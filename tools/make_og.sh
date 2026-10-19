#!/bin/sh
# Render the social preview cards (needs Google Chrome). Run from the repo root.
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
for L in en vi; do
  OUT="site/assets/og-image$([ "$L" = vi ] && echo -vi).png"
  "$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$TMP" --hide-scrollbars \
    --window-size=1200,630 --virtual-time-budget=4000 --screenshot="$OUT" "file://$PWD/tools/og.html?lang=$L" 2>/dev/null
  echo "$OUT"
done
