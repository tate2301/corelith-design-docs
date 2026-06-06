#!/usr/bin/env bash
# =====================================================================
#  build-search.sh
# =====================================================================
#  Builds the Pagefind static search index that powers `search.html`.
#  Pagefind crawls every HTML file under the repo root and writes a
#  pre-computed bundle to `_pagefind/`, which `search.html` then
#  lazy-loads via dynamic import.
#
#  Re-run any time site content changes meaningfully; cheap (sub-second
#  for ~400 pages on a modern laptop).
#
#      bash scripts/build-search.sh
#
#  The output directory is gitignored — the index is a build artefact,
#  regenerated at deploy time, not version-controlled.
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "build-search: indexing $(pwd) -> _pagefind/"
npx --yes pagefind --site . --output-path _pagefind

echo "build-search: done"
