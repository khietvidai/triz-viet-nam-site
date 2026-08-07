#!/bin/bash
# Script 5: Design System Config
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/5_design_system.md"

mkdir -p "$OUT_DIR"
echo "# 5. DESIGN SYSTEM" > "$FILE"

echo "## Tailwind Config" >> "$FILE"
echo '```js' >> "$FILE"
cat "$ROOT/tailwind.config.ts" 2>/dev/null || cat "$ROOT/tailwind.config.js" 2>/dev/null || echo "Tailwind v4 (configured in CSS)" >> "$FILE"
echo '```' >> "$FILE"

echo "## Global CSS (First 50 lines)" >> "$FILE"
echo '```css' >> "$FILE"
# Chỉ lấy 50 dòng đầu để AI hiểu base style, tránh quá dài
head -n 50 "$ROOT/src/app/globals.css" >> "$FILE"
echo '```' >> "$FILE"
echo "✅ Done: $FILE"