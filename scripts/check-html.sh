#!/usr/bin/env bash
# =====================================================================
#  check-html.sh
# =====================================================================
#  Validates every committed *.html file using whichever tool is
#  installed locally. Order of preference:
#
#    1. html-validate   (npm i -g html-validate)   — fast, strict
#    2. tidy            (apt install tidy / brew install tidy-html5)
#
#  Neither tool is required to run the site, so this script PRINTS a
#  warning and exits 0 if neither is installed. CI is configured to
#  only invoke it when one of the tools is on $PATH.
#
#      bash scripts/check-html.sh
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Skip node_modules + .git for speed.
mapfile -d '' FILES < <(
  find . \
    -type d \( -name node_modules -o -name .git -o -name dist -o -name .vercel \) -prune -o \
    -type f -name '*.html' -print0
)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "check-html: no HTML files found"
  exit 0
fi

echo "check-html: ${#FILES[@]} HTML file(s) to validate"

if command -v html-validate >/dev/null 2>&1; then
  echo "check-html: using html-validate"
  # html-validate exits non-zero on findings. Allow the user to
  # override the config path; default to a permissive ruleset since
  # we hand-write HTML and use legacy attributes deliberately.
  CFG="${HTML_VALIDATE_CONFIG:-}"
  if [ -n "$CFG" ]; then
    html-validate --config "$CFG" "${FILES[@]}"
  else
    html-validate "${FILES[@]}"
  fi
  exit $?
fi

if command -v tidy >/dev/null 2>&1; then
  echo "check-html: using tidy (warn-only)"
  status=0
  for f in "${FILES[@]}"; do
    # -q quiet, -e errors only, -utf8 explicit charset. Tidy returns 1
    # for warnings and 2 for errors; we only fail CI on errors.
    if ! tidy -q -e -utf8 "$f" >/dev/null; then
      rc=$?
      if [ "$rc" -ge 2 ]; then
        echo "  ERROR  $f"
        status=1
      else
        echo "  warn   $f"
      fi
    fi
  done
  exit "$status"
fi

echo "check-html: neither html-validate nor tidy is installed — skipping"
echo "check-html: install one with"
echo "    npm install -g html-validate"
echo "    # or"
echo "    sudo apt-get install -y tidy        # Debian/Ubuntu"
echo "    brew install tidy-html5             # macOS"
exit 0
