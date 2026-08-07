#!/bin/bash
# Script 2: Tổng quan Frontend (Pages & Components)
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/2_frontend_overview.md"

mkdir -p "$OUT_DIR"
echo "# 2. FRONTEND OVERVIEW" > "$FILE"

echo "## App Router Structure (Routes)" >> "$FILE"
echo '```' >> "$FILE"
# Tìm các file chính của Next.js App Router
find "$ROOT/src/app" -type f \( -name "page.tsx" -o -name "layout.tsx" -o -name "loading.tsx" \) | sed "s|$ROOT||g" >> "$FILE"
echo '```' >> "$FILE"

echo "## Components List" >> "$FILE"
echo '```' >> "$FILE"
# Liệt kê components (chỉ lấy tên file, không lấy nội dung để tiết kiệm)
find "$ROOT/src/components" -maxdepth 3 -name "*.tsx" | sed "s|$ROOT||g" >> "$FILE"
echo '```' >> "$FILE"
echo "✅ Done: $FILE"