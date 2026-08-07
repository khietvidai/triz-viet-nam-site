#!/bin/bash
# Script 3: Liệt kê API Routes
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/3_api_endpoints.md"

mkdir -p "$OUT_DIR"
echo "# 3. API ENDPOINTS" > "$FILE"
echo '```' >> "$FILE"
# Tìm file route.ts trong thư mục api
find "$ROOT/src/app/api" -name "route.ts" | sed "s|$ROOT||g" >> "$FILE"
echo '```' >> "$FILE"
echo "✅ Done: $FILE"