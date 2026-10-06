#!/bin/sh
set -e

DIST="dist"

# Clean slate
rm -rf "$DIST"
mkdir -p "$DIST"

# Copy everything (catches new pages automatically)
for item in *; do
  [ "$item" = "$DIST" ] && continue
  cp -r "$item" "$DIST/"
done

# Remove private items from the published folder
rm -rf "$DIST/api"
rm -rf "$DIST/netlify"
rm -rf "$DIST/node_modules"
rm -f  "$DIST/package.json"
rm -f  "$DIST/package-lock.json"
rm -f  "$DIST/vercel.json"
rm -f  "$DIST/netlify.toml"
rm -f  "$DIST/.gitignore"

# Gate: fail if any private item leaked through
PRIVATE="api netlify node_modules package.json package-lock.json vercel.json netlify.toml .gitignore"
FAIL=0
for item in $PRIVATE; do
  if [ -e "$DIST/$item" ]; then
    echo "FAIL: private item in published folder: $item" >&2
    FAIL=1
  fi
done
if [ "$FAIL" -ne 0 ]; then exit 1; fi

COUNT=$(find "$DIST" -type f | wc -l)
echo "Published folder built: $COUNT files"
