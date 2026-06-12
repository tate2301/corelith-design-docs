#!/usr/bin/env node
// scripts/api-report.mjs — generate etc/api-report.md from dist/index.cjs.
//
// Walks every export of the built CJS bundle, classifies it, and writes a
// sorted markdown report. Future PRs diff this file so any change to the
// public surface is visible at a glance.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkgRoot = resolve(__dirname, '..');
const distEntry = resolve(pkgRoot, 'dist', 'index.cjs');
const outDir = resolve(pkgRoot, 'etc');
const outFile = resolve(outDir, 'api-report.md');

// dist/index.cjs is a CJS bundle. Use createRequire so the global `require`
// resolves modules relative to this script.
const require = createRequire(pathToFileURL(__filename));

let mod;
try {
  mod = require(distEntry);
} catch (err) {
  console.error(`[api-report] failed to load ${distEntry}`);
  console.error(err);
  process.exit(1);
}

/** Classify an export value into one of our public-API buckets. */
function classify(name, value) {
  if (value == null) return 'value';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return 'constant';

  const isForwardRef =
    value &&
    typeof value === 'object' &&
    typeof value.$$typeof === 'symbol' &&
    String(value.$$typeof).includes('react.forward_ref');
  const isMemo =
    value &&
    typeof value === 'object' &&
    typeof value.$$typeof === 'symbol' &&
    String(value.$$typeof).includes('react.memo');

  // Compound component if it has PascalCase keys hanging off it
  // (e.g. Menu.Item, Tabs.Panel, Card.Header).
  const subComponentKeys = (() => {
    if (!value || (t !== 'function' && t !== 'object')) return [];
    return Object.getOwnPropertyNames(value).filter(
      (k) =>
        !['length', 'name', 'prototype', '$$typeof', 'render', 'defaultProps', 'displayName', 'propTypes', 'type', 'compare'].includes(k) &&
        /^[A-Z]/.test(k),
    );
  })();
  const isCompound = subComponentKeys.length > 0;

  if (isForwardRef) return isCompound ? 'forwardRef namespace' : 'forwardRef component';
  if (isMemo) return 'memo component';

  if (t === 'function') {
    if (/^use[A-Z]/.test(name)) return 'hook';
    if (isCompound) return 'namespace';
    if (/^[A-Z]/.test(name)) return 'function component';
    return 'function';
  }
  if (t === 'object') {
    if (isCompound) return 'namespace';
    return 'object';
  }
  return 'value';
}

const entries = Object.keys(mod)
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ name, kind: classify(name, mod[name]) }));

const now = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push('# @corelithzw/react — Public API report');
lines.push('');
lines.push(`Generated: ${now} from \`dist/index.cjs\`.`);
lines.push('');
lines.push('This file is committed. PRs that change the public surface must');
lines.push('regenerate it with `npm run api-report`. A diff against this file');
lines.push('is the source of truth for additive vs breaking changes.');
lines.push('');
lines.push(`Total exports: **${entries.length}**`);
lines.push('');
lines.push('| Export | Kind |');
lines.push('| --- | --- |');
for (const { name, kind } of entries) {
  lines.push(`| \`${name}\` | ${kind} |`);
}
lines.push('');

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, lines.join('\n'), 'utf8');
console.log(`[api-report] wrote ${outFile} (${entries.length} exports)`);
