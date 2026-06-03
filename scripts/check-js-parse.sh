#!/usr/bin/env bash
# =====================================================================
#  check-js-parse.sh
# =====================================================================
#  Extracts every inline <script>…</script> body from:
#    - portals/**/*.html       (every portal demo)
#    - cookbook/*.html         (every cookbook recipe, incl. _template)
#
#  Each body is parsed with Node's `vm.Script` constructor — which is
#  the cheapest "this would crash at load" check available without a
#  full browser. Modules and external (`src=…`) scripts are skipped:
#  only inline JS is verified.
#
#  Exits non-zero on the first parse failure and prints the offending
#  file + the V8 error message. Designed to be runnable locally:
#
#      bash scripts/check-js-parse.sh
#
#  Idempotent. No deps beyond Node 18+.
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Collect candidates.
FILE_LIST="$(find portals cookbook -type f -name '*.html' 2>/dev/null | sort || true)"

if [ -z "$FILE_LIST" ]; then
  echo "check-js-parse: no portal or cookbook HTML files found — nothing to check"
  exit 0
fi

# Pass the list to Node via env var (newline-separated) to avoid
# heredoc + positional-arg interaction issues across bash versions.
export CHECK_FILE_LIST="$FILE_LIST"

node -e '
const fs = require("fs");
const vm = require("vm");

const files = (process.env.CHECK_FILE_LIST || "")
  .split("\n")
  .map(s => s.trim())
  .filter(Boolean);

let scriptsChecked = 0;
let failures = 0;

// Pull every <script>…</script> body that has no src= attribute. The
// regex is intentionally permissive — we want a parse error, not a
// false negative from a clever attribute order.
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  let m;
  while ((m = SCRIPT_RE.exec(html)) !== null) {
    const attrs = m[1] || "";
    const body  = m[2] || "";
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/\btype\s*=\s*["\x27]?application\/(ld\+)?json/i.test(attrs)) continue;
    if (!body.trim()) continue;
    scriptsChecked++;
    try {
      new vm.Script(body, { filename: file });
    } catch (err) {
      failures++;
      console.error(`\nPARSE FAIL  ${file}`);
      console.error("  " + (err && err.message ? err.message : String(err)));
    }
  }
}

console.log(`check-js-parse: ${scriptsChecked} inline script(s) across ${files.length} file(s)`);
if (failures > 0) {
  console.error(`check-js-parse: ${failures} failure(s)`);
  process.exit(1);
}
console.log("check-js-parse: OK");
'
