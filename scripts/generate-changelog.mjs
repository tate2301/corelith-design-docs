#!/usr/bin/env node
/**
 * generate-changelog.mjs — turn `git log` into a Changelog.md update.
 *
 * Used during the v0.5.x window, before Changesets is wired up. Once
 * Changesets owns the changelog (from v0.6.0 onwards), this script is
 * retained as a fallback / "reconstruct from history" utility but
 * should not be the source of truth.
 *
 * Usage:
 *   node scripts/generate-changelog.mjs           # since last tag
 *   node scripts/generate-changelog.mjs v0.4.0    # since the given ref
 *
 * Outputs Markdown to stdout. Pipe into Changelog.md to update.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim();
}

function currentVersion() {
  try {
    return readFileSync(resolve(ROOT, "VERSION"), "utf8").trim();
  } catch {
    return "0.0.0";
  }
}

function lastTag() {
  try {
    return sh("git describe --tags --abbrev=0");
  } catch {
    return ""; // no tags yet — fall back to whole history
  }
}

function commitsSince(ref) {
  const range = ref ? `${ref}..HEAD` : "HEAD";
  // `%h %s` keeps it compact and bucketable.
  const raw = sh(`git log --no-merges --pretty=format:%h%x09%s ${range}`);
  if (!raw) return [];
  return raw.split("\n").map((line) => {
    const [sha, ...rest] = line.split("\t");
    return { sha, subject: rest.join("\t") };
  });
}

/** Bucket a commit by its subject prefix or keyword. */
function bucket(subject) {
  const s = subject.toLowerCase();
  if (/^(feat|add|new)[:\s(]/.test(s) || /\badd(s|ed)?\b/.test(s)) return "Added";
  if (/^(fix|bug)[:\s(]/.test(s) || /\bfix(es|ed)?\b/.test(s)) return "Fixed";
  if (/^(remove|drop)[:\s(]/.test(s) || /\bremov(e|ed)\b/.test(s)) return "Removed";
  if (/^(refactor|chore|style|docs|perf)[:\s(]/.test(s)) return "Changed";
  return "Changed";
}

const since = process.argv[2] || lastTag();
const version = currentVersion();
const date = new Date().toISOString().slice(0, 10);

const commits = commitsSince(since);
const buckets = { Added: [], Changed: [], Fixed: [], Removed: [] };
for (const c of commits) buckets[bucket(c.subject)].push(c);

const out = [];
out.push(`## v${version} — ${date}`);
out.push("");
if (since) out.push(`_Range: ${since}..HEAD (${commits.length} commits)_`);
else out.push(`_Range: full history (${commits.length} commits)_`);
out.push("");

for (const label of ["Added", "Changed", "Fixed", "Removed"]) {
  const items = buckets[label];
  if (items.length === 0) continue;
  out.push(`### ${label}`);
  out.push("");
  for (const c of items) out.push(`- ${c.subject} (${c.sha})`);
  out.push("");
}

process.stdout.write(out.join("\n") + "\n");
