#!/usr/bin/env node
// =====================================================================
//  Cookbook snippet typecheck
// =====================================================================
//  Extracts every TSX snippet from cookbook/**/*.html, wraps each one
//  as a standalone .tsx file under /tmp/snippet-check/, then invokes
//  tsc against scripts/snippet-tsconfig.json so each snippet must
//  compile against the *real* @corelithzw/react source.
//
//  Snippets are skipped (with a counted, visible reason) when they are
//  deliberately illustrative — diff syntax, ellipses, "// ..." cuts,
//  or specimens explicitly marked data-snippet-check="skip".
//
//  Usage:
//      node scripts/check-snippets.mjs               # check everything
//      node scripts/check-snippets.mjs --list        # inventory only
//      node scripts/check-snippets.mjs --filter slug # one recipe
//      node scripts/check-snippets.mjs --verbose     # show per-snippet
//
//  Exits 1 on any failing snippet. The CI workflow enforces this.
// =====================================================================

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, relative, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const COOKBOOK_DIR = join(REPO_ROOT, 'cookbook');
const TMP_DIR = '/tmp/snippet-check';
const TSCONFIG = join(REPO_ROOT, 'scripts', 'snippet-tsconfig.json');
const PACKAGE_NAME = '@corelithzw/react';

// Files we never check — they are templates / indices, not recipes.
const EXCLUDED_BASENAMES = new Set(['_template.html', 'index.html']);

// ── CLI flags ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  list: args.includes('--list'),
  verbose: args.includes('--verbose'),
  filter: null,
};
const fi = args.indexOf('--filter');
if (fi !== -1 && args[fi + 1]) flags.filter = args[fi + 1];

// ── Helpers ───────────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

function isExcluded(path) {
  const base = basename(path);
  const rel = relative(COOKBOOK_DIR, path);
  if (EXCLUDED_BASENAMES.has(base)) return true;
  // charts/index.html is the chart-list index; also excluded.
  if (rel === join('charts', 'index.html')) return true;
  return false;
}

function decodeEntities(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function slugFor(htmlPath) {
  const rel = relative(COOKBOOK_DIR, htmlPath).replace(/\.html$/, '');
  return rel.replace(/[\\/]/g, '__');
}

// ── Snippet extraction ────────────────────────────────────────────────
//
// 1. `data-code='…'` (single-quoted) and `data-code="…"` (double-quoted)
//    attributes on any element. We track per-element whether the element
//    also carries `data-snippet-check="skip"`.
//
// 2. `<pre><code>…</code></pre>` blocks that include the
//    `from '@corelithzw/react'` (or HTML-encoded equivalent) substring.
//    Recipe authors occasionally drop free-standing fenced snippets
//    in addition to the specimen-attached ones.
//
// We walk the HTML linearly so we can preserve specimen ordinality
// (snippet 1, snippet 2, ...) per recipe for the error report.

function findAttr(elementOpen, attrName) {
  // Match `attrName='…'` or `attrName="…"` — quote-flexible.
  const single = new RegExp(`${attrName}=\\s*'([^']*)'`, 's');
  const double = new RegExp(`${attrName}=\\s*"([^"]*)"`, 's');
  const m1 = elementOpen.match(single);
  if (m1) return m1[1];
  const m2 = elementOpen.match(double);
  if (m2) return m2[1];
  return null;
}

function extractSnippets(html) {
  const snippets = [];

  // Pass A: scan element open-tags that carry data-code=
  //
  // Specimens look like:
  //   <div class="ds-specimen"
  //        data-snippet-check="skip"
  //        data-code='import { Stack } from &#39;@corelithzw/react&#39;;
  // ...
  //   '>
  //
  // We need to read the open-tag up to the `>` that closes it (after
  // accounting for quoted attribute values that may contain `>`s).

  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;
    // Skip non-element starts (comments, doctype, closing tags).
    const next = html[lt + 1];
    if (next === '!' || next === '/' || next === '?' ) {
      i = lt + 1;
      continue;
    }
    // Find the matching `>` while respecting quoted attribute values.
    let j = lt + 1;
    let inQuote = null;
    while (j < html.length) {
      const c = html[j];
      if (inQuote) {
        if (c === inQuote) inQuote = null;
      } else {
        if (c === '"' || c === "'") inQuote = c;
        else if (c === '>') break;
      }
      j++;
    }
    if (j >= html.length) break;
    const openTag = html.slice(lt, j + 1);
    // Cheap fast-path: only parse if data-code= is present.
    if (openTag.includes('data-code=')) {
      const rawCode = findAttr(openTag, 'data-code');
      if (rawCode !== null) {
        const skipAttr = findAttr(openTag, 'data-snippet-check');
        const code = decodeEntities(rawCode);
        snippets.push({
          source: 'data-code',
          code,
          skipMarker: skipAttr === 'skip',
          offset: lt,
        });
      }
    }
    i = j + 1;
  }

  // Pass B: <pre><code>…</code></pre> blocks that import from the package.
  //
  // We accept both `<pre><code>` and `<pre><code class="…">` forms.
  const preRe = /<pre>\s*<code(?:\s[^>]*)?>([\s\S]*?)<\/code>\s*<\/pre>/g;
  let m;
  while ((m = preRe.exec(html)) !== null) {
    const raw = m[1];
    const decoded = decodeEntities(raw);
    if (!decoded.includes(`from '${PACKAGE_NAME}'`)) continue;
    snippets.push({
      source: 'pre-code',
      code: decoded,
      skipMarker: false,
      offset: m.index,
    });
  }

  // Preserve document order so the snippet ordinal in errors matches
  // the reader's eye scrolling top-to-bottom.
  snippets.sort((a, b) => a.offset - b.offset);
  return snippets;
}

// ── Skip-rule policy ─────────────────────────────────────────────────
function classify(snippet) {
  const code = snippet.code;
  if (snippet.skipMarker) return { skip: true, reason: 'data-snippet-check=skip' };
  if (!code.includes(PACKAGE_NAME)) return { skip: true, reason: 'no @corelithzw/react import' };
  if (code.includes('…')) return { skip: true, reason: 'ellipsis (…)' };
  if (/\/\/\s*\.\.\./.test(code)) return { skip: true, reason: '// ... elision' };
  if (/\/\*\s*\.\.\.\s*\*\//.test(code)) return { skip: true, reason: '/* ... */ elision' };
  // Diff syntax: any non-blank line whose first non-whitespace char is `+` or `-`
  // *and* is followed by a space (i.e. looks like a real diff line). We accept
  // unary minus and TS unions safely by requiring leading `+ ` / `- ` at line start.
  if (/^[+-] /m.test(code)) return { skip: true, reason: 'diff syntax (+/- lines)' };
  return { skip: false };
}

// ── Write snippets to /tmp ────────────────────────────────────────────
//
// React APIs (hooks, createContext, ...) live in `react`, not in
// `@corelithzw/react`. Recipe authors occasionally fold them into the same
// import line for narrative brevity. We split such imports here so the
// snippet compiles against the real packages without us touching the source.
const REACT_REEXPORTS = new Set([
  'useState', 'useEffect', 'useReducer', 'useRef', 'useMemo',
  'useCallback', 'useContext', 'useLayoutEffect', 'useImperativeHandle',
  'useDeferredValue', 'useTransition', 'useId', 'useSyncExternalStore',
  'useInsertionEffect', 'useDebugValue',
  'createContext', 'forwardRef', 'memo', 'lazy', 'Suspense', 'Fragment',
  'startTransition', 'createElement', 'cloneElement',
]);

function stripAlias(name) {
  const m = name.match(/^([A-Za-z_$][\w$]*)\s+as\s+/);
  return m ? m[1] : name;
}

function rewriteCorelithImports(code) {
  const importRe = /import\s+\{([^}]*)\}\s+from\s+['"]@corelithzw\/react['"]\s*;/g;
  return code.replace(importRe, (_full, inside) => {
    const names = inside.split(',').map((s) => s.trim()).filter(Boolean);
    const fromReact = names.filter((n) => REACT_REEXPORTS.has(stripAlias(n)));
    const fromCorelith = names.filter((n) => !REACT_REEXPORTS.has(stripAlias(n)));
    const out = [];
    if (fromReact.length) out.push(`import { ${fromReact.join(', ')} } from 'react';`);
    if (fromCorelith.length) out.push(`import { ${fromCorelith.join(', ')} } from '@corelithzw/react';`);
    return out.join('\n');
  });
}

function ensureReactImport(code) {
  // `react-jsx` removes the need for the React import in scope, but we still
  // want React types available for hook generics etc. We also pre-import the
  // common React hooks because recipes use them without an explicit import
  // (narrative brevity — the reader knows they're from `react`). De-duped
  // against names already imported anywhere in the snippet so we never inject
  // a duplicate identifier.
  const commonHooks = [
    'useState', 'useEffect', 'useReducer', 'useRef', 'useMemo',
    'useCallback', 'useContext', 'useLayoutEffect',
    'createContext', 'forwardRef',
  ];
  const existing = new Set();
  for (const m of code.matchAll(/import\s+\{([^}]*)\}\s+from\s+['"][^'"]+['"]/g)) {
    for (const raw of m[1].split(',')) {
      const name = stripAlias(raw.trim());
      if (name) existing.add(name);
    }
  }
  const inject = commonHooks.filter((n) => !existing.has(n));
  const preamble =
    `import * as React from 'react';\n` +
    (inject.length ? `import { ${inject.join(', ')} } from 'react';\n` : '');
  return preamble + code;
}

// Extract the lexically-top-level type/interface/function/const declarations
// from a snippet's source so a later snippet in the same recipe can reference
// them. We keep this deliberately conservative — only declarations that begin
// at column 0 (no indent) are picked up, which matches the recipe convention
// of stating shared types before any component body. The original `import`
// lines are stripped because the wrapping step injects the right imports
// already.
function extractTopLevelDecls(code) {
  const lines = code.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Top-level only: starts with `type `, `interface `, `const ` or
    // `function `. We do NOT pull in `let`/`var`/`class`/`enum` — those
    // are rarer in practice and more likely to contain references the
    // recipe never defines. Deduped by declared name so a later snippet's
    // local redeclaration wins over the preamble.
    const startMatch = line.match(
      /^(?:export\s+)?(type|interface|const|function)\s/,
    );
    if (!startMatch) {
      i++;
      continue;
    }
    const kind = startMatch[1];
    // `type` and `const`/`let`/`var` declarations terminate at a top-level
    // `;`. `interface`/`function`/`class`/`enum` declarations terminate
    // at a top-level `}` once at least one `{` has been opened.
    const endsOnSemi = kind === 'type' || kind === 'const';
    // Capture the block by tracking brace/bracket/paren depth. Single-line
    // statements (e.g. `type X = string;`) end on the first `;`. Multi-line
    // blocks end when *all* depths return to 0 after at least one opener,
    // and we hit either a closing brace/bracket at line start or a trailing
    // `;` on the line.
    let block = '';
    let curlyDepth = 0;
    let bracketDepth = 0;
    let parenDepth = 0;
    let started = false;
    let inLineComment = false;
    let inBlockComment = false;
    let inStr = null;
    // Regex literal mode + char-class-inside-regex mode. We only enter
    // regex mode when a `/` appears in a position where a value is expected
    // — i.e. right after another operator-ish char (`(,=:?!&|+-*<>;{[` or
    // `return` keyword). Otherwise `/` is division.
    let inRegex = false;
    let inRegexClass = false;
    let lastSignificantChar = '';
    while (i < lines.length) {
      const l = lines[i];
      block += (block ? '\n' : '') + l;
      inLineComment = false;
      for (let k = 0; k < l.length; k++) {
        const c = l[k];
        const c2 = l[k + 1];
        if (inLineComment) continue;
        if (inBlockComment) {
          if (c === '*' && c2 === '/') {
            inBlockComment = false;
            k++;
          }
          continue;
        }
        if (inStr) {
          if (c === '\\') { k++; continue; }
          if (c === inStr) inStr = null;
          continue;
        }
        if (inRegex) {
          if (c === '\\') { k++; continue; }
          if (inRegexClass) {
            if (c === ']') inRegexClass = false;
          } else {
            if (c === '[') inRegexClass = true;
            else if (c === '/') inRegex = false;
          }
          continue;
        }
        if (c === '/' && c2 === '/') { inLineComment = true; continue; }
        if (c === '/' && c2 === '*') { inBlockComment = true; k++; continue; }
        if (c === '"' || c === "'" || c === '`') { inStr = c; lastSignificantChar = c; continue; }
        // Detect regex literal: a `/` after a value-expecting token. We
        // deliberately exclude `<` from the value-expecting set because
        // `</` is a JSX closing-tag, not a regex.
        if (c === '/') {
          const valueExpecting =
            /[(,=:?!&|+\-*>;{[]/.test(lastSignificantChar) ||
            lastSignificantChar === '';
          if (valueExpecting) {
            inRegex = true;
            continue;
          }
        }
        if (c === '{') { curlyDepth++; started = true; }
        else if (c === '}') curlyDepth--;
        else if (c === '[') { bracketDepth++; started = true; }
        else if (c === ']') bracketDepth--;
        else if (c === '(') { parenDepth++; }
        else if (c === ')') parenDepth--;
        if (!/\s/.test(c)) lastSignificantChar = c;
      }
      i++;
      const trimmed = l.replace(/\/\/.*$/, '').trimEnd();
      if (endsOnSemi) {
        // type / const: terminate when at top level and the line ends in `;`.
        if (curlyDepth === 0 && bracketDepth === 0 && parenDepth === 0 && /;\s*$/.test(trimmed)) {
          break;
        }
      } else {
        // interface / function / class / enum: terminate after at least
        // one `{` has been seen, when the line ends in `}` (optionally
        // followed by `;`) at top level.
        if (started && curlyDepth === 0 && bracketDepth === 0 && parenDepth === 0 && /\}\s*;?\s*$/.test(trimmed)) {
          break;
        }
      }
    }
    out.push(block);
  }
  return out;
}

// Pick out the identifier being declared by a top-level type/interface block
// so we can drop it from the preamble when the *current* snippet redeclares
// it. Both forms accepted: `type X<...>` and `interface X<...>`.
function declaredName(block) {
  const m = block.match(
    /^(?:export\s+)?(?:type|interface|const|function)\s+([A-Za-z_$][\w$]*)/,
  );
  return m ? m[1] : null;
}

// Recipes occasionally write `const [edit, setEdit] = useState<…>(…)` at
// what looks like top-level inside their narrative snippets. Those are
// not legal at module scope — but later snippets in the same recipe
// reference `edit` / `setEdit` as if they were. Emit ambient `declare`s
// so the later snippet still compiles. Returns an array of
// `declare const X: any;` lines, deduped against names the current
// snippet already binds.
function extractAmbientDestructured(code, skipNames) {
  const out = [];
  const seen = new Set(skipNames);
  // `const [a, b, ...] = …;` — match at column 0.
  const arrRe = /^(?:export\s+)?const\s*\[([^\]]+)\]\s*=/gm;
  // `const { a, b: ren, ... } = …;` — match at column 0.
  const objRe = /^(?:export\s+)?const\s*\{([^}]+)\}\s*=/gm;
  for (const re of [arrRe, objRe]) {
    let m;
    while ((m = re.exec(code)) !== null) {
      for (const raw of m[1].split(',')) {
        // Strip default-value (`x = 1`), strip rest (`...y`), strip
        // renames (`a: b` → keep `b`).
        let name = raw.trim().replace(/\s*=\s*[^,]*$/, '');
        const renameMatch = name.match(/^\s*[A-Za-z_$][\w$]*\s*:\s*([A-Za-z_$][\w$]*)/);
        if (renameMatch) name = renameMatch[1];
        name = name.replace(/^\.\.\./, '');
        if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue;
        if (seen.has(name)) continue;
        seen.add(name);
        out.push(`declare const ${name}: any;`);
      }
    }
  }
  return out;
}

// Pull `import` statements out of a snippet so we can fold them into the
// preamble — a later snippet's reference to a component named in an
// earlier snippet only works if the corresponding import survives. We
// pull both `import { … } from '…'` and side-effect imports.
function extractImports(code) {
  // Match `import …;`, supporting both single-line and multi-line
  // braced-import forms. The `import` keyword must be at column 0; the
  // statement ends at the next top-level `;` (we approximate by reading
  // up to the first `;` after the `from '…'` clause, or the first `;`
  // for side-effect imports).
  const out = [];
  const re = /^import\b[\s\S]*?;/gm;
  let m;
  while ((m = re.exec(code)) !== null) out.push(m[0]);
  return out;
}

function buildRecipePreamble(priorSnippets, currentCode) {
  const decls = [];
  const seen = new Set();
  // Identify identifiers redeclared in the current snippet so we don't
  // shadow them from the preamble.
  const localNames = new Set(
    extractTopLevelDecls(currentCode).map(declaredName).filter(Boolean),
  );
  for (const sn of priorSnippets) {
    for (const block of extractTopLevelDecls(sn)) {
      const name = declaredName(block);
      if (!name) continue;
      if (seen.has(name)) continue;
      if (localNames.has(name)) continue;
      seen.add(name);
      decls.push(block);
    }
    // Ambient `declare const X: any;` for destructured bindings.
    const localImportedNames = new Set(localNames);
    for (const a of extractAmbientDestructured(sn, [
      ...seen,
      ...localImportedNames,
    ])) {
      const am = a.match(/declare\s+const\s+([A-Za-z_$][\w$]*)/);
      if (!am) continue;
      const name = am[1];
      if (seen.has(name) || localImportedNames.has(name)) continue;
      seen.add(name);
      decls.push(a);
    }
  }
  // Fold in every prior named import, collapsing by source module. We
  // accumulate `{ source -> Set<imported names> }` across all prior
  // snippets, then drop any name already imported by the *current*
  // snippet (so the preamble never duplicates an identifier the snippet
  // itself binds). The import rewriter (`rewriteCorelithImports`) runs
  // *after* the preamble is prepended, so `@corelithzw/react` imports
  // still get split into react-vs-corelith correctly.
  const localImported = new Set();
  for (const line of extractImports(currentCode)) {
    const im = line.match(/\{([\s\S]*?)\}/);
    if (!im) continue;
    for (const raw of im[1].split(',')) {
      const name = stripAlias(raw.trim());
      if (name) localImported.add(name);
    }
  }
  const namedBySource = new Map();
  const sideEffect = [];
  const defaultBySource = new Map();
  for (const sn of priorSnippets) {
    for (const line of extractImports(sn)) {
      const fromMatch = line.match(/from\s+['"]([^'"]+)['"]\s*;/);
      if (!fromMatch) {
        // side-effect import like `import './styles.css';`
        sideEffect.push(line.trim());
        continue;
      }
      const source = fromMatch[1];
      const namedMatch = line.match(/\{([\s\S]*?)\}/);
      const defaultMatch = line.match(/^import\s+([A-Za-z_$][\w$]*)\s*[,{]?/);
      if (defaultMatch && !line.startsWith('import {')) {
        const def = defaultMatch[1];
        if (def !== 'import' && !localImported.has(def)) {
          defaultBySource.set(source, def);
        }
      }
      if (namedMatch) {
        if (!namedBySource.has(source)) namedBySource.set(source, new Set());
        for (const raw of namedMatch[1].split(',')) {
          const name = stripAlias(raw.trim());
          if (!name) continue;
          if (localImported.has(name)) continue;
          namedBySource.get(source).add(raw.trim());
        }
      }
    }
  }
  const importLines = [];
  for (const line of new Set(sideEffect)) importLines.push(line);
  for (const [source, names] of namedBySource) {
    if (names.size === 0) continue;
    importLines.push(`import { ${[...names].join(', ')} } from '${source}';`);
  }
  if (!decls.length && !importLines.length) return '';
  return (
    '// ── Recipe context: declarations from earlier snippets ──\n' +
    (importLines.length ? importLines.join('\n') + '\n\n' : '') +
    decls.join('\n\n') +
    '\n// ── End recipe context ──\n\n'
  );
}

function writeSnippets(items) {
  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
  for (const item of items) {
    const preamble = buildRecipePreamble(item.priorCodes || [], item.code);
    const combined = preamble + item.code;
    const rewritten = rewriteCorelithImports(combined);
    const wrapped = ensureReactImport(rewritten);
    writeFileSync(join(TMP_DIR, item.filename), wrapped, 'utf8');
  }
}

// ── tsc invocation + error parsing ───────────────────────────────────
function runTsc() {
  // We invoke tsc via the package's local install. The CI workflow ensures
  // packages/react/node_modules exists before running this script.
  const tscBin = join(REPO_ROOT, 'packages', 'react', 'node_modules', '.bin', 'tsc');
  const result = spawnSync(tscBin, ['--project', TSCONFIG, '--pretty', 'false'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return result;
}

const ERROR_LINE_RE = /^(.+?)\((\d+),(\d+)\):\s+error\s+TS\d+:\s+(.*)$/;

function parseErrors(stdout) {
  const errors = [];
  for (const line of stdout.split(/\r?\n/)) {
    const m = line.match(ERROR_LINE_RE);
    if (!m) continue;
    errors.push({
      file: m[1].trim(),
      line: Number(m[2]),
      col: Number(m[3]),
      message: m[4].trim(),
    });
  }
  return errors;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  if (!statSync(COOKBOOK_DIR).isDirectory()) {
    console.error(`cookbook directory not found: ${COOKBOOK_DIR}`);
    process.exit(2);
  }

  const allHtml = walk(COOKBOOK_DIR).filter((p) => !isExcluded(p)).sort();
  const recipes = allHtml.filter((p) => {
    if (!flags.filter) return true;
    return slugFor(p).includes(flags.filter);
  });

  let totalFound = 0;
  let totalSkipped = 0;
  const skipReasons = new Map();
  const toCheck = []; // { filename, recipe, ord, code }
  const byRecipe = new Map(); // slug -> { found, checked, skipped }

  for (const path of recipes) {
    const slug = slugFor(path);
    const html = readFileSync(path, 'utf8');
    const snippets = extractSnippets(html);
    const stats = { found: snippets.length, checked: 0, skipped: 0 };
    byRecipe.set(slug, stats);
    totalFound += snippets.length;

    // Accumulate the source of every prior snippet so a later snippet
    // can reference types/components named earlier in the recipe — the
    // reader sees the recipe as one continuous narrative. We only carry
    // forward snippets whose code is parseable; snippets marked as
    // illustrative (ellipsis, `// ...`, diff syntax) are explicitly
    // *excluded* because feeding their elided source into the extractor
    // would inject syntactically invalid tokens into later snippets'
    // preambles.
    const ILLUSTRATIVE_REASONS = new Set([
      'ellipsis (…)',
      '// ... elision',
      '/* ... */ elision',
      'diff syntax (+/- lines)',
    ]);
    const priorCodes = [];
    snippets.forEach((sn, idx) => {
      const ord = idx + 1;
      const decision = classify(sn);
      if (decision.skip) {
        stats.skipped++;
        totalSkipped++;
        skipReasons.set(decision.reason, (skipReasons.get(decision.reason) ?? 0) + 1);
        if (flags.verbose) {
          console.log(`  skip  ${slug}#${ord}  (${decision.reason})`);
        }
        // Even skipped snippets contribute their decls to the recipe
        // context — *unless* the snippet is explicitly illustrative
        // (elided / diff). Those would corrupt the preamble. We check
        // the raw code as well as the classification reason because a
        // snippet may have been skipped for a different reason while
        // still containing elision tokens.
        if (
          !ILLUSTRATIVE_REASONS.has(decision.reason) &&
          !sn.code.includes('…') &&
          !/\/\/\s*\.\.\./.test(sn.code) &&
          !/\/\*\s*\.\.\.\s*\*\//.test(sn.code) &&
          !/^[+-] /m.test(sn.code)
        ) {
          priorCodes.push(sn.code);
        }
        return;
      }
      stats.checked++;
      const filename = `${slug}__${String(ord).padStart(2, '0')}.tsx`;
      toCheck.push({
        filename,
        recipe: slug,
        ord,
        code: sn.code,
        path,
        priorCodes: priorCodes.slice(),
      });
      priorCodes.push(sn.code);
    });
  }

  if (flags.list) {
    console.log(`Recipes: ${recipes.length}`);
    console.log(`Snippets found: ${totalFound}`);
    console.log(`To check: ${toCheck.length}`);
    console.log(`Skipped: ${totalSkipped}`);
    if (skipReasons.size) {
      console.log('Skip reasons:');
      for (const [reason, n] of skipReasons) console.log(`  ${n}× ${reason}`);
    }
    if (flags.verbose) {
      for (const [slug, s] of byRecipe) {
        console.log(`  ${slug}: found=${s.found} checked=${s.checked} skipped=${s.skipped}`);
      }
    }
    process.exit(0);
  }

  writeSnippets(toCheck);

  const tsc = runTsc();
  const allOut = (tsc.stdout ?? '') + (tsc.stderr ?? '');
  const errors = parseErrors(allOut);

  // Group errors by snippet file.
  const byFile = new Map();
  for (const err of errors) {
    const key = basename(err.file);
    if (!byFile.has(key)) byFile.set(key, []);
    byFile.get(key).push(err);
  }

  if (errors.length === 0 && tsc.status === 0) {
    console.log('OK  cookbook snippets typecheck cleanly');
    console.log(
      `Recipes: ${recipes.length} / Snippets found: ${totalFound} / ` +
        `Checked: ${toCheck.length} / Skipped: ${totalSkipped} / Failed: 0`,
    );
    if (flags.verbose && skipReasons.size) {
      console.log('Skip reasons:');
      for (const [reason, n] of skipReasons) console.log(`  ${n}× ${reason}`);
    }
    process.exit(0);
  }

  // If tsc reported a non-zero exit with no parsed errors, the failure is
  // structural (config error, missing tsc, etc.). Surface raw output.
  if (errors.length === 0) {
    console.error('tsc failed with no parsable errors:');
    console.error(allOut);
    process.exit(tsc.status ?? 2);
  }

  // Per-recipe failure report.
  const failingFiles = [...byFile.keys()].sort();
  console.error(`FAIL  ${errors.length} TypeScript error(s) across ${failingFiles.length} snippet(s):\n`);
  for (const file of failingFiles) {
    const meta = toCheck.find((t) => t.filename === file);
    const heading = meta
      ? `${meta.recipe}  (snippet #${meta.ord})`
      : file;
    console.error(`── ${heading} ──`);
    for (const err of byFile.get(file)) {
      console.error(`  line ${err.line}:${err.col}  ${err.message}`);
    }
    console.error('');
  }
  console.error(
    `Recipes: ${recipes.length} / Snippets found: ${totalFound} / ` +
      `Checked: ${toCheck.length} / Skipped: ${totalSkipped} / Failed: ${failingFiles.length}`,
  );
  process.exit(1);
}

main();
