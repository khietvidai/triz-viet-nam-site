#!/bin/bash
# ============================================================
# Script: 1_project_structure.sh
# Mục đích: Tự động quét và export cấu trúc thư mục cho AI
# ============================================================

# 1. Định nghĩa đường dẫn output (Folder output nằm trong scripts)
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/1_project_structure.md"

# 2. Tạo thư mục output nếu chưa có (tránh lỗi)
mkdir -p "$OUT_DIR"

# 3. Bắt đầu ghi file Markdown
echo "# 📂 CẤU TRÚC THƯ MỤC DỰ ÁN (Real-time Scan)" > "$FILE"
echo "Generated at: $(date)" >> "$FILE"
echo "" >> "$FILE"

# 4. Ghi chú thích cho AI hiểu
echo "> Note: Dưới đây là cây thư mục thực tế, đã loại bỏ các folder rác (node_modules, .git...)" >> "$FILE"
echo "" >> "$FILE"

# 5. Dùng lệnh tree để vẽ cây tự động
# -I: Bỏ qua các thư mục không cần thiết để tiết kiệm token
echo '```' >> "$FILE"
if command -v tree &> /dev/null; then
    tree "$ROOT" -I 'node_modules|.next|.git|.vscode|dist|build|coverage|*.log' >> "$FILE"
else
    # Fallback nếu server chưa cài 'tree'
    find "$ROOT" -maxdepth 3 -not -path '*/.*' | sed "s|$ROOT||g" >> "$FILE"
fi
echo '```' >> "$FILE"

echo "✅ Done! File saved to: $FILE"