#!/usr/bin/env node
/**
 * Extract a single version section from CHANGELOG.md.
 *
 *   node scripts/extract-changelog-section.mjs 0.1.2
 *
 * Prints the body of the `## 0.1.2` (or `## [0.1.2]`) section to stdout,
 * stripping the heading itself. Used by the publish workflow to fill in
 * the body of the GitHub Release.
 *
 * Exit non-zero if the version isn't found, so the workflow falls back
 * to a generic release body instead of attaching empty notes.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const version = process.argv[2];
if (!version) {
  console.error('Usage: extract-changelog-section.mjs <version>');
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const changelog = resolve(here, '..', 'CHANGELOG.md');
const src = readFileSync(changelog, 'utf8');

// Match `## 0.1.2`, `## [0.1.2]`, `## v0.1.2`, `## [v0.1.2]` — anything
// that contains the bare version after the `##`.
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp(
  `^##\\s+\\[?v?${escaped}\\]?[^\\n]*$`,
  'm',
);
const startMatch = re.exec(src);
if (!startMatch) {
  console.error(`No CHANGELOG section found for ${version}`);
  process.exit(1);
}

const start = startMatch.index + startMatch[0].length;
const tail = src.slice(start);
// Stop at the next `## ` heading (the next version), or EOF.
const next = tail.match(/\n##\s+/);
const body = (next ? tail.slice(0, next.index) : tail).trim();

process.stdout.write(body + '\n');
