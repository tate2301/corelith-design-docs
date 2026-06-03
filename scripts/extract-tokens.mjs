#!/usr/bin/env node
/**
 * extract-tokens.mjs — parse tokens.css and emit Style Dictionary–compatible JSON.
 *
 * Reads `tokens.css`, pulls every `--name: value;` declaration from the
 * `:root` block and from `body.is-dark`, groups by prefix into nested
 * objects, and writes:
 *   tokens/tokens.json       (light / default cascade)
 *   tokens/tokens.dark.json  (dark cascade overrides)
 *
 * Run:   node scripts/extract-tokens.mjs
 *
 * Output is Style Dictionary friendly (`{ value, type, description? }`),
 * but does NOT require the Style Dictionary package — consumers can feed
 * the JSON to SD, a Figma plugin, Tailwind, or anything that speaks
 * the design-tokens shape.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "tokens.css");
const OUT_LIGHT = resolve(ROOT, "tokens/tokens.json");
const OUT_DARK = resolve(ROOT, "tokens/tokens.dark.json");

// ─── helpers ────────────────────────────────────────────────

/** Extract a CSS block by selector — returns the body between `{` and matching `}`. */
function extractBlock(css, selector) {
  const i = css.indexOf(selector);
  if (i < 0) return "";
  const open = css.indexOf("{", i);
  if (open < 0) return "";
  let depth = 1;
  let j = open + 1;
  while (j < css.length && depth > 0) {
    const ch = css[j];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    j++;
  }
  return css.slice(open + 1, j - 1);
}

/** Pull `--name: value;` declarations. Multi-line values supported. */
function parseDecls(block) {
  const decls = [];
  // Strip /* … */ comments first so they don't confuse the scanner.
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, "");
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const name = m[1].trim();
    const value = m[2].trim().replace(/\s+/g, " ");
    decls.push([name, value]);
  }
  return decls;
}

/** Decide the design-token `type` for a given name + value. */
function classify(name, value) {
  if (/^(font|type)-/.test(name)) {
    if (/^font-(sans|serif|mono|display)/.test(name)) return "fontFamilies";
    return "typography";
  }
  if (/^space-|^gutter-|^row-/.test(name)) return "spacing";
  if (/^radius-|-radius$/.test(name)) return "borderRadius";
  if (/^shadow-/.test(name)) return "boxShadow";
  if (/^dur-/.test(name)) return "duration";
  if (/^ease-/.test(name)) return "cubicBezier";
  if (/^h-control|input-height|button-height|sidebar-w|rail-w|content-max/.test(name)) return "sizing";
  // colors: hex, rgb(a), hsl(a), or alias to a color token
  if (/^#|^rgb|^hsl/.test(value)) return "color";
  if (/^var\(--/.test(value)) {
    // Aliases keep the type of their referent loosely; default to color
    // for the color-heavy ranges, otherwise leave generic.
    if (/^(brand|tone|action|dot|focus|text|border|surface|canvas|ink|gray|hairline|clay)/.test(name)) return "color";
  }
  if (/^(brand|tone|action|dot|focus|text|border|surface|canvas|ink|gray|hairline|clay)/.test(name)) return "color";
  return "other";
}

/** Map a top-level group label from a token name. */
function groupOf(name) {
  if (/^space-|^gutter-|^row-/.test(name)) return "space";
  if (/^radius-|^button-radius$|^card-radius$/.test(name)) return "radius";
  if (/^shadow-/.test(name)) return "shadow";
  if (/^dur-/.test(name)) return "duration";
  if (/^ease-/.test(name)) return "easing";
  if (/^font-/.test(name)) return "font";
  if (/^type-/.test(name)) return "type";
  if (/^h-control|input-height|button-height/.test(name)) return "size";
  if (/^sidebar-w|^rail-w|^content-max/.test(name)) return "layout";
  // color families
  if (/^brand/.test(name)) return "color";
  if (/^tone-/.test(name)) return "color";
  if (/^action-/.test(name)) return "color";
  if (/^dot-/.test(name)) return "color";
  if (/^focus-/.test(name)) return "color";
  if (/^text-/.test(name)) return "color";
  if (/^border|^hairline/.test(name)) return "color";
  if (/^surface|^canvas|^ink/.test(name)) return "color";
  if (/^gray-/.test(name)) return "color";
  if (/^clay/.test(name)) return "color";
  return "misc";
}

/** Split a token name into a nested path under its group. */
function pathOf(name) {
  // color.brand.soft, color.tone.success, color.gray.500, space.4, radius.lg
  if (/^brand$/.test(name)) return ["color", "brand", "base"];
  if (/^brand-(.+)$/.test(name)) return ["color", "brand", RegExp.$1];
  if (/^tone-(.+?)(?:-(bg|bd))?$/.test(name)) {
    const tone = RegExp.$1;
    const sub = RegExp.$2;
    return sub ? ["color", "tone", tone, sub] : ["color", "tone", tone];
  }
  if (/^action-(.+)$/.test(name)) return ["color", "action", ...RegExp.$1.split("-")];
  if (/^dot-(.+)$/.test(name)) return ["color", "dot", RegExp.$1];
  if (/^focus-(.+)$/.test(name)) return ["color", "focus", RegExp.$1];
  if (/^text-(.+)$/.test(name)) return ["color", "text", RegExp.$1];
  if (/^border(?:-(.+))?$/.test(name)) return ["color", "border", RegExp.$1 || "base"];
  if (/^hairline$/.test(name)) return ["color", "border", "hairline"];
  if (/^surface(?:-(.+))?$/.test(name)) return ["color", "surface", RegExp.$1 || "base"];
  if (/^canvas$/.test(name)) return ["color", "canvas"];
  if (/^ink(?:-(.+))?$/.test(name)) return ["color", "ink", RegExp.$1 || "base"];
  if (/^gray-(\d+)$/.test(name)) return ["color", "gray", RegExp.$1];
  if (/^clay(?:-(.+))?$/.test(name)) return ["color", "clay", RegExp.$1 || "base"];

  if (/^space-(.+)$/.test(name)) return ["space", RegExp.$1];
  if (/^gutter-(.+)$/.test(name)) return ["space", "gutter", RegExp.$1];
  if (/^row-(.+)$/.test(name)) return ["space", "row", RegExp.$1];

  if (/^radius-(.+)$/.test(name)) return ["radius", RegExp.$1];
  if (/^(button|card)-radius$/.test(name)) return ["radius", RegExp.$1];

  if (/^shadow-(.+)$/.test(name)) return ["shadow", RegExp.$1];
  if (/^dur-(.+)$/.test(name)) return ["duration", RegExp.$1];
  if (/^ease-(.+)$/.test(name)) return ["easing", RegExp.$1];

  if (/^font-(.+)$/.test(name)) return ["font", RegExp.$1];
  if (/^type-(.+)$/.test(name)) return ["type", RegExp.$1];

  if (/^h-control-(.+)$/.test(name)) return ["size", "control", RegExp.$1];
  if (/^(input|button)-height$/.test(name)) return ["size", RegExp.$1, "height"];

  if (/^sidebar-w(?:-(.+))?$/.test(name)) return ["layout", "sidebar", RegExp.$1 || "default"];
  if (/^rail-w$/.test(name)) return ["layout", "rail"];
  if (/^content-max$/.test(name)) return ["layout", "content-max"];

  return ["misc", name];
}

/** Convert `var(--foo-bar)` references into Style Dictionary `{foo.bar}` aliases. */
function aliasify(value) {
  return value.replace(/var\(--([a-z0-9-]+)\)/gi, (_, ref) => {
    const path = pathOf(ref).join(".");
    return `{${path}}`;
  });
}

/** Insert a leaf token at a nested path inside `tree`. */
function setPath(tree, path, leaf) {
  let cur = tree;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (typeof cur[key] !== "object" || cur[key] === null || "value" in cur[key]) {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[path[path.length - 1]] = leaf;
}

/** Build a Style Dictionary–shaped tree from raw `[name, value]` pairs. */
function buildTree(decls) {
  const tree = {};
  for (const [name, raw] of decls) {
    const path = pathOf(name);
    const value = aliasify(raw);
    const type = classify(name, raw);
    const leaf = { value, type };
    leaf.original = `--${name}`;
    setPath(tree, path, leaf);
  }
  return tree;
}

// ─── main ───────────────────────────────────────────────────

const css = await readFile(SRC, "utf8");

const lightBlock = extractBlock(css, ":root");
const darkBlock = extractBlock(css, "body.is-dark");

const lightDecls = parseDecls(lightBlock);
const darkDecls = parseDecls(darkBlock);

const lightTree = buildTree(lightDecls);
const darkTree = buildTree(darkDecls);

const banner = {
  $schema: "https://design-tokens.github.io/community-group/format/",
  $description:
    "Generated by `scripts/extract-tokens.mjs` — do not edit by hand. Regenerate with `node scripts/extract-tokens.mjs`.",
};

await mkdir(dirname(OUT_LIGHT), { recursive: true });
await writeFile(OUT_LIGHT, JSON.stringify({ ...banner, ...lightTree }, null, 2) + "\n");
await writeFile(
  OUT_DARK,
  JSON.stringify(
    {
      ...banner,
      $description:
        "Generated by `scripts/extract-tokens.mjs` — do not edit by hand. Dark-cascade overrides (body.is-dark). Merge over tokens.json.",
      ...darkTree,
    },
    null,
    2
  ) + "\n"
);

console.log(`wrote ${OUT_LIGHT} (${lightDecls.length} tokens)`);
console.log(`wrote ${OUT_DARK} (${darkDecls.length} tokens)`);
