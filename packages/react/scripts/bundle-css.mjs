#!/usr/bin/env node
/**
 * Concatenates the Corelith design-system stylesheets (`tokens.css` +
 * `components.css` from the docs-site root) into the head of the package's
 * own `dist/styles.css`, then rewrites it. Runs as a post-build step (see
 * `package.json` → `build`).
 *
 * The result: consumers can do
 *
 *     import '@tate2301/corelith/styles.css';
 *
 * and get tokens, fonts, every recipe class name, plus the small portal
 * positioning fallbacks the package itself ships.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkgRoot = resolve(__dirname, '..');
const repoRoot = resolve(pkgRoot, '..', '..');

const sources = [
  resolve(repoRoot, 'tokens.css'),
  resolve(repoRoot, 'components.css'),
];

const dest = resolve(pkgRoot, 'dist', 'styles.css');
const tokensDest = resolve(pkgRoot, 'dist', 'tokens.css');
const componentsDest = resolve(pkgRoot, 'dist', 'components.css');

if (!existsSync(dest)) {
  console.error(`[bundle-css] dist/styles.css not found at ${dest}. Did vite build run?`);
  process.exit(1);
}

const pieces = [];
pieces.push(
  '/* @tate2301/corelith — bundled design-system stylesheet. */\n' +
  '/* Generated from packages/react/scripts/bundle-css.mjs. */\n' +
  '/* Source: tokens.css + components.css (docs-site root) + per-component CSS. */\n',
);

for (const src of sources) {
  if (!existsSync(src)) {
    console.warn(`[bundle-css] missing source: ${src} — skipping`);
    continue;
  }
  const body = readFileSync(src, 'utf8');
  const name = src.split('/').pop();
  pieces.push(`\n/* ── BEGIN ${name} ───────────────────────────────────────── */\n`);
  pieces.push(body.trim());
  pieces.push(`\n/* ── END ${name} ─────────────────────────────────────────── */\n`);
}

const [tokensSrc, componentsSrc] = sources;
if (existsSync(tokensSrc)) writeFileSync(tokensDest, readFileSync(tokensSrc, 'utf8'));
if (existsSync(componentsSrc)) writeFileSync(componentsDest, readFileSync(componentsSrc, 'utf8'));

const existing = readFileSync(dest, 'utf8');
pieces.push('\n/* ── Package-shipped per-component fallbacks ────────────── */\n');
pieces.push(existing.trim());
pieces.push('\n');

writeFileSync(dest, pieces.join(''));
const sizeKb = (Buffer.byteLength(pieces.join(''), 'utf8') / 1024).toFixed(2);
console.log(`[bundle-css] wrote ${dest} (${sizeKb} KB)`);
