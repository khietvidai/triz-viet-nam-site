#!/bin/bash
# Script 6: Map các thư mục logic
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/6_features_map.md"

mkdir -p "$OUT_DIR"
echo "# 6. LOGIC & FEATURES MAP" > "$FILE"
echo '```' >> "$FILE"
# Quét các folder chức năng
tree "$ROOT/src/lib" "$ROOT/src/utils" "$ROOT/src/hooks" "$ROOT/src/services" "$ROOT/src/types" -L 2 --noreport >> "$FILE" 2>/dev/null
echo '```' >> "$FILE"
echo "✅ Done: $FILE"