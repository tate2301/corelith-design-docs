#!/usr/bin/env bash
# =====================================================================
#  check-links.sh
# =====================================================================
#  Broken-link sweep across every committed *.html file. Two backends:
#
#    1. lychee   (preferred — fast, parallel, accept-list aware)
#       cargo install lychee
#       # or
#       brew install lychee
#
#    2. curl fallback — very slow, deliberately serial. Used only when
#       lychee is unavailable AND the caller passes --fallback. CI does
#       NOT use the fallback (it just skips); local users can opt in.
#
#  Usage:
#      bash scripts/check-links.sh                 # use lychee or skip
#      bash scripts/check-links.sh --fallback      # use curl if needed
#
#  Soft-fail philosophy: link rot in third-party docs shouldn't block a
#  PR. The script exits 0 by default and prints a summary; pass
#  --strict to flip broken external links into a non-zero exit.
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

USE_FALLBACK=0
STRICT=0
for arg in "$@"; do
  case "$arg" in
    --fallback) USE_FALLBACK=1 ;;
    --strict)   STRICT=1 ;;
  esac
done

if command -v lychee >/dev/null 2>&1; then
  echo "check-links: using lychee"
  # --no-progress to keep CI logs readable. --exclude-mail because
  # mailto: links have no DNS to resolve. Cache for 1 day locally.
  set +e
  lychee \
    --no-progress \
    --exclude-mail \
    --accept '200,201,202,203,204,206,301,302,303,304,307,308,403,429' \
    --max-concurrency 8 \
    './**/*.html'
  rc=$?
  set -e
  if [ "$STRICT" -eq 1 ]; then
    exit "$rc"
  fi
  if [ "$rc" -ne 0 ]; then
    echo "check-links: lychee found issues (rc=$rc) — soft-failing (pass --strict to enforce)"
  fi
  exit 0
fi

if [ "$USE_FALLBACK" -eq 1 ]; then
  echo "check-links: lychee not found — using curl fallback (slow)"
  # Grep every absolute http(s) URL out of every HTML file, de-dupe,
  # then HEAD each one with a small timeout.
  mapfile -t URLS < <(
    grep -rhoE 'https?://[^"<> )]+' --include='*.html' . \
      | sed -e 's/[)>,.;]*$//' \
      | sort -u
  )
  fails=0
  for u in "${URLS[@]}"; do
    if ! curl -sSfIL --max-time 8 -o /dev/null "$u"; then
      echo "  BROKEN  $u"
      fails=$((fails + 1))
    fi
  done
  echo "check-links: ${#URLS[@]} unique URL(s), $fails failure(s)"
  if [ "$STRICT" -eq 1 ] && [ "$fails" -gt 0 ]; then
    exit 1
  fi
  exit 0
fi

echo "check-links: lychee not installed — skipping"
echo "check-links: install with"
echo "    cargo install lychee"
echo "    # or"
echo "    brew install lychee"
echo "check-links: re-run with --fallback to use the slow curl-based checker"
exit 0
