#!/usr/bin/env node
/**
 * export-tokens.mjs — Token export pipeline (P2-08).
 *
 * Reads `tokens.css` (the single source of truth) and projects it into
 * three downstream-friendly formats:
 *
 *   tokens/corelith.flat.json     flat name -> value map (+ _dark, _meta)
 *   tokens/corelith.json          Figma Tokens Studio / W3C DTCG shape
 *   tokens/corelith.tailwind.css  Tailwind v4 `@theme { ... }` block
 *
 * Run:   node scripts/export-tokens.mjs   (or `npm run tokens`)
 *
 * The script is dependency-free: only Node's built-in fs/path/url.
 * Dark-theme tokens are sourced from the `body.is-dark` block in
 * tokens.css. If a `@media (prefers-color-scheme: dark) { :root {} }`
 * block is added later, it's picked up too.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "tokens.css");
const OUT_DIR = resolve(ROOT, "tokens");
const OUT_FLAT = resolve(OUT_DIR, "corelith.flat.json");
const OUT_DTCG = resolve(OUT_DIR, "corelith.json");
const OUT_TW = resolve(OUT_DIR, "corelith.tailwind.css");
const PKG_REACT = resolve(ROOT, "packages/react/package.json");

// ─── CSS block extraction ───────────────────────────────────

/** Walk the CSS top-level and return all `:root { ... }` blocks
 *  alongside any `body.is-dark { ... }` or media-query dark `:root`
 *  blocks. Returns { light: string[], dark: string[] }. */
function extractBlocks(css) {
  const out = { light: [], dark: [] };

  // Strip /* ... */ comments while keeping line offsets — we'll
  // re-parse comments separately for descriptions.
  const len = css.length;
  let i = 0;
  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(css[i])) i++;
    if (i >= len) break;

    // Skip block comments at the top level
    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end < 0) break;
      i = end + 2;
      continue;
    }

    // Find the next `{` or `;` — at-rules like `@import url(...);` and
    // `@charset "utf-8";` have no body and terminate with `;`.
    const open = css.indexOf("{", i);
    const semi = css.indexOf(";", i);
    if (open < 0 && semi < 0) break;
    if (semi > -1 && (semi < open || open < 0)) {
      // At-rule without a body — skip past the `;` and continue.
      i = semi + 1;
      continue;
    }
    const prelude = css.slice(i, open).trim();

    // Find the matching closing brace.
    let depth = 1;
    let j = open + 1;
    while (j < len && depth > 0) {
      const ch = css[j];
      if (ch === "/" && css[j + 1] === "*") {
        const end = css.indexOf("*/", j + 2);
        if (end < 0) { j = len; break; }
        j = end + 2;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);

    classifyBlock(prelude, body, out);
    i = j;
  }

  return out;
}

function classifyBlock(prelude, body, out) {
  // Drop @import / @font-face / @keyframes etc. quickly.
  if (/^:root\b/.test(prelude)) {
    out.light.push(body);
    return;
  }
  if (/body\.is-dark\b/.test(prelude)) {
    out.dark.push(body);
    return;
  }
  if (/^@media\b/.test(prelude) && /prefers-color-scheme:\s*dark/i.test(prelude)) {
    // Look for nested `:root { ... }` or `body.is-dark { ... }`.
    const nested = extractBlocks(body);
    out.dark.push(...nested.light, ...nested.dark);
    return;
  }
  if (/^@media\b/.test(prelude)) {
    // Other media queries — scan for nested :root anyway (could be light overrides).
    const nested = extractBlocks(body);
    out.light.push(...nested.light);
    out.dark.push(...nested.dark);
  }
  // Anything else (regular selectors, @keyframes, @supports) is ignored —
  // tokens only live in :root or body.is-dark.
}

// ─── Declaration parsing ────────────────────────────────────

/** Pull `--name: value;` declarations from a CSS block, capturing the
 *  most-recent line comment (` /* ... *\/ `) as `description`.
 *  Returns Array<{ name, value, description? }>. */
function parseDecls(block) {
  const out = [];
  let pendingDesc = null;
  let i = 0;
  const len = block.length;

  while (i < len) {
    // Whitespace
    while (i < len && /\s/.test(block[i])) i++;
    if (i >= len) break;

    // Comment — capture as candidate description for the next decl.
    if (block[i] === "/" && block[i + 1] === "*") {
      const end = block.indexOf("*/", i + 2);
      if (end < 0) break;
      const raw = block.slice(i + 2, end).trim();
      // Skip giant banner / section dividers (rows of ═ or ─).
      if (
        !/^[═─=─-]+$/.test(raw) &&
        !/^[═─=─-]/.test(raw) &&
        raw.length > 0
      ) {
        // Normalize internal whitespace.
        pendingDesc = raw.replace(/\s+/g, " ").trim();
      }
      i = end + 2;
      continue;
    }

    // Custom property?
    if (block[i] === "-" && block[i + 1] === "-") {
      // Find the colon.
      const colon = block.indexOf(":", i);
      if (colon < 0) break;
      const name = block.slice(i + 2, colon).trim();

      // Read the value up to a semicolon at depth 0 of parentheses.
      let k = colon + 1;
      let pdepth = 0;
      while (k < len) {
        const ch = block[k];
        if (ch === "(") pdepth++;
        else if (ch === ")") pdepth--;
        else if (ch === ";" && pdepth === 0) break;
        else if (ch === "/" && block[k + 1] === "*") {
          const e = block.indexOf("*/", k + 2);
          if (e < 0) { k = len; break; }
          k = e + 2;
          continue;
        }
        k++;
      }
      const value = block.slice(colon + 1, k).trim().replace(/\s+/g, " ");
      const entry = { name, value };
      if (pendingDesc) entry.description = pendingDesc;
      out.push(entry);
      pendingDesc = null;
      i = k + 1;
      continue;
    }

    // Anything else — skip to the next `;` or `{}` block to recover.
    const nextSemi = block.indexOf(";", i);
    const nextBrace = block.indexOf("{", i);
    if (nextSemi < 0 && nextBrace < 0) break;
    if (nextBrace > -1 && (nextBrace < nextSemi || nextSemi < 0)) {
      // Skip nested block (e.g. `color-scheme: dark;` line is fine,
      // but be defensive against future additions).
      let depth = 1;
      let j = nextBrace + 1;
      while (j < len && depth > 0) {
        if (block[j] === "{") depth++;
        else if (block[j] === "}") depth--;
        j++;
      }
      i = j;
    } else {
      i = nextSemi + 1;
    }
    pendingDesc = null;
  }

  return out;
}

// ─── Classification ─────────────────────────────────────────

const COLOR_PREFIXES = [
  "canvas", "surface", "text", "border", "brand", "tone", "accent",
  "ink", "gray", "hairline", "clay", "action", "dot", "focus",
];
const COLOR_VALUE_RE = /^(#|rgb|hsl|color\()/i;

/** High-level category bucket — drives output grouping. */
function categoryOf(name, value) {
  if (/^space-|^gutter-|^row-/.test(name)) return "space";
  if (/^radius-|-radius$/.test(name)) return "radius";
  if (/^shadow-/.test(name)) return "shadow";
  if (/^dur-/.test(name)) return "duration";
  if (/^ease-/.test(name)) return "easing";
  if (/^font-/.test(name)) return "font";
  if (/^type-/.test(name)) return "typography";
  if (/^h-control|input-height|button-height/.test(name)) return "size";
  if (/^sidebar-w|^rail-w|^content-max/.test(name)) return "size";

  // Color decision — by prefix or by raw value shape.
  for (const p of COLOR_PREFIXES) {
    if (name === p || name.startsWith(p + "-")) return "color";
  }
  if (COLOR_VALUE_RE.test(value)) return "color";
  // var(--…) that resolves to color-ish prefix
  const ref = value.match(/^var\(--([a-z0-9-]+)\)/i);
  if (ref) {
    for (const p of COLOR_PREFIXES) {
      if (ref[1] === p || ref[1].startsWith(p + "-")) return "color";
    }
  }

  return "other";
}

/** DTCG `type` field. */
function dtcgType(category) {
  switch (category) {
    case "color":      return "color";
    case "space":      return "spacing";
    case "radius":     return "borderRadius";
    case "shadow":     return "shadow";
    case "duration":   return "duration";
    case "easing":     return "cubicBezier";
    case "font":       return "fontFamilies";
    case "typography": return "typography";
    case "size":       return "sizing";
    default:           return "other";
  }
}

// ─── Tailwind mapping ───────────────────────────────────────

const RADIUS_SCALE_MAP = {
  // Names already on a t-shirt scale stay put.
  "xs": "xs", "sm": "sm", "md": "md", "lg": "lg",
  "xl": "xl", "2xl": "2xl", "3xl": "3xl", "pill": "full",
  "full": "full",
  // Numeric scale (1..4 etc.) → t-shirt.
  "1": "sm", "2": "md", "3": "lg", "4": "xl", "5": "2xl",
};

/** Translate a token name to a Tailwind v4 `@theme` namespace variable.
 *  Returns the full `--namespace-key` string, or null to skip. */
function toTailwindName(name, category) {
  switch (category) {
    case "color":
      return `--color-${name}`;
    case "space":
      if (/^space-(.+)$/.test(name)) return `--spacing-${RegExp.$1}`;
      if (/^gutter-(.+)$/.test(name)) return `--spacing-gutter-${RegExp.$1}`;
      if (/^row-(.+)$/.test(name)) return `--spacing-row-${RegExp.$1}`;
      return `--spacing-${name}`;
    case "radius":
      if (/^radius-(.+)$/.test(name)) {
        const key = RegExp.$1;
        const mapped = RADIUS_SCALE_MAP[key] || key;
        return `--radius-${mapped}`;
      }
      if (/^(button|card)-radius$/.test(name)) return `--radius-${RegExp.$1}`;
      return `--radius-${name}`;
    case "shadow":
      if (/^shadow-(.+)$/.test(name)) return `--shadow-${RegExp.$1}`;
      return `--shadow-${name}`;
    case "duration":
      // Tailwind v4 reads --animate-duration-* / --transition-duration-* loosely;
      // we expose generic `--duration-*` which v4 honors as an arbitrary namespace.
      if (/^dur-(.+)$/.test(name)) return `--duration-${RegExp.$1}`;
      return `--duration-${name}`;
    case "easing":
      if (/^ease-(.+)$/.test(name)) return `--ease-${RegExp.$1}`;
      return `--ease-${name}`;
    case "font":
      if (/^font-(.+)$/.test(name)) return `--font-${RegExp.$1}`;
      return `--font-${name}`;
    case "typography":
      // Tailwind v4 doesn't have a first-class shorthand-font namespace;
      // emit as a custom `--type-*` so consumers can opt in via `font: var(...)`.
      return `--type-${name.replace(/^type-/, "")}`;
    case "size":
      // Map common sizing tokens to a `--size-*` namespace.
      return `--size-${name}`;
    default:
      return `--${name}`;
  }
}

/** Strip leftover `var(--…)` references — Tailwind `@theme` keeps them. */
function tailwindValue(value) {
  return value;
}

// ─── Output assembly ────────────────────────────────────────

function sortObject(obj) {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const sorted = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = sortObject(obj[k]);
  return sorted;
}

function buildFlat(decls) {
  const flat = {};
  for (const d of decls) flat[d.name] = d.value;
  return sortObject(flat);
}

function buildDTCG(decls) {
  const tree = {};
  for (const d of decls) {
    const cat = categoryOf(d.name, d.value);
    const bucket = (() => {
      switch (cat) {
        case "color":      return "color";
        case "space":      return "spacing";
        case "radius":     return "borderRadius";
        case "shadow":     return "shadow";
        case "duration":   return "duration";
        case "easing":     return "easing";
        case "font":       return "font";
        case "typography": return "typography";
        case "size":       return "sizing";
        default:           return "other";
      }
    })();
    if (!tree[bucket]) tree[bucket] = {};
    // Use the leaf name (strip group prefix) where it's redundant; otherwise full name.
    const leafKey = leafKeyFor(d.name, cat);
    const leaf = { value: d.value, type: dtcgType(cat) };
    if (d.description) leaf.description = d.description;
    tree[bucket][leafKey] = leaf;
  }
  // Sort within each bucket.
  const out = {};
  for (const k of Object.keys(tree).sort()) {
    out[k] = {};
    for (const leaf of Object.keys(tree[k]).sort()) out[k][leaf] = tree[k][leaf];
  }
  return out;
}

function leafKeyFor(name, category) {
  switch (category) {
    case "space":      return name.replace(/^space-/, "").replace(/^gutter-/, "gutter-").replace(/^row-/, "row-");
    case "radius":     return name.replace(/^radius-/, "");
    case "shadow":     return name.replace(/^shadow-/, "");
    case "duration":   return name.replace(/^dur-/, "");
    case "easing":     return name.replace(/^ease-/, "");
    case "font":       return name.replace(/^font-/, "");
    case "typography": return name.replace(/^type-/, "");
    default:           return name;
  }
}

function buildTailwind(decls, { darkDecls }) {
  const lines = [];
  lines.push("/* Generated from tokens.css. DO NOT EDIT — re-run `npm run tokens`. */");
  lines.push("");
  lines.push("@theme {");
  const seen = new Set();
  for (const d of [...decls].sort((a, b) => a.name.localeCompare(b.name))) {
    const cat = categoryOf(d.name, d.value);
    const tw = toTailwindName(d.name, cat);
    if (!tw) continue;
    if (seen.has(tw)) continue;
    seen.add(tw);
    lines.push(`  ${tw}: ${tailwindValue(d.value)};`);
  }
  lines.push("}");

  if (darkDecls && darkDecls.length) {
    lines.push("");
    lines.push("/* Dark cascade — Corelith ships dark via `body.is-dark`,");
    lines.push("   but Tailwind consumers typically prefer the media-query route. */");
    lines.push("@media (prefers-color-scheme: dark) {");
    lines.push("  @theme {");
    const seenDark = new Set();
    for (const d of [...darkDecls].sort((a, b) => a.name.localeCompare(b.name))) {
      const cat = categoryOf(d.name, d.value);
      const tw = toTailwindName(d.name, cat);
      if (!tw) continue;
      if (seenDark.has(tw)) continue;
      seenDark.add(tw);
      lines.push(`    ${tw}: ${tailwindValue(d.value)};`);
    }
    lines.push("  }");
    lines.push("}");
  }

  return lines.join("\n") + "\n";
}

// ─── Main ───────────────────────────────────────────────────

const css = await readFile(SRC, "utf8");
const blocks = extractBlocks(css);

// Merge all light blocks (in document order, last write wins per name).
const lightDeclMap = new Map();
for (const b of blocks.light) {
  for (const d of parseDecls(b)) lightDeclMap.set(d.name, d);
}
const lightDecls = [...lightDeclMap.values()];

const darkDeclMap = new Map();
for (const b of blocks.dark) {
  for (const d of parseDecls(b)) darkDeclMap.set(d.name, d);
}
const darkDecls = [...darkDeclMap.values()];

// Read package version for metadata.
let version = "unknown";
try {
  const pkg = JSON.parse(await readFile(PKG_REACT, "utf8"));
  version = pkg.version || "unknown";
} catch { /* ignore */ }

await mkdir(OUT_DIR, { recursive: true });

// ── (a) Flat JSON ─────────────────────────────────────────
const flatLight = buildFlat(lightDecls);
const flatDark = darkDecls.length ? buildFlat(darkDecls) : undefined;
const flatOut = { ...flatLight };
if (flatDark) flatOut._dark = flatDark;
flatOut._meta = {
  version,
  generated: new Date().toISOString(),
  source: "tokens.css",
};
await writeFile(OUT_FLAT, JSON.stringify(flatOut, null, 2) + "\n");

// ── (b) DTCG / Figma Tokens Studio ────────────────────────
const dtcgLight = buildDTCG(lightDecls);
const dtcgOut = { ...dtcgLight };
if (darkDecls.length) dtcgOut._dark = buildDTCG(darkDecls);
dtcgOut._meta = {
  $description:
    "Corelith design tokens — generated from tokens.css. Re-run `npm run tokens` after edits.",
  version,
  generated: new Date().toISOString(),
  source: "tokens.css",
};
await writeFile(OUT_DTCG, JSON.stringify(dtcgOut, null, 2) + "\n");

// ── (c) Tailwind v4 @theme ────────────────────────────────
const twOut = buildTailwind(lightDecls, { darkDecls });
await writeFile(OUT_TW, twOut);

// ── Report ────────────────────────────────────────────────
const flatCount = Object.keys(flatLight).length;
const darkCount = darkDecls.length;
const twLines = twOut.split("\n").filter((l) => /^\s*--[a-z0-9-]+:/.test(l)).length;
const otherCount = lightDecls.filter((d) => categoryOf(d.name, d.value) === "other").length;
const others = lightDecls.filter((d) => categoryOf(d.name, d.value) === "other").map((d) => d.name);

console.log(`tokens.css → parsed ${lightDecls.length} light tokens, ${darkCount} dark overrides`);
console.log(`  wrote ${OUT_FLAT}  (${flatCount} keys${darkCount ? ` + ${darkCount} _dark` : ""})`);
console.log(`  wrote ${OUT_DTCG}  (Figma Tokens Studio / W3C DTCG)`);
console.log(`  wrote ${OUT_TW}   (${twLines} @theme declarations)`);
if (otherCount) {
  console.log(`  note: ${otherCount} tokens fell into "other" bucket: ${others.join(", ")}`);
}
