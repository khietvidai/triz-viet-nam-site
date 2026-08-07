#!/bin/bash
# Script 7: Dependencies & Scripts
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/7_dependencies.md"

mkdir -p "$OUT_DIR"
echo "# 7. PACKAGE.JSON" > "$FILE"
echo '```json' >> "$FILE"
cat "$ROOT/package.json" >> "$FILE"
echo '```' >> "$FILE"
echo "✅ Done: $FILE"