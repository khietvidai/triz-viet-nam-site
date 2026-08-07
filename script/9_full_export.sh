#!/bin/bash
# Script 9: Tổng hợp thành 1 file context duy nhất
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FINAL_FILE="$OUT_DIR/FULL_PROJECT_CONTEXT.md"

# Chạy lại tất cả các script con trước để đảm bảo dữ liệu mới nhất
# (Bỏ comment dòng dưới nếu bạn muốn script 9 tự chạy luôn các script 1-8)
# for s in {1..8}; do bash "$ROOT/scripts/${s}_*.sh"; done

echo "# FULL PROJECT CONTEXT FOR LLM" > "$FINAL_FILE"
echo "Generated at: $(date)" >> "$FINAL_FILE"

# Loop qua các file output từ 1 đến 8
for i in {1..8}; do
    PART_FILE=$(find "$OUT_DIR" -name "${i}_*.md" | head -n 1)
    if [ -f "$PART_FILE" ]; then
        echo "" >> "$FINAL_FILE"
        echo "---" >> "$FINAL_FILE"
        cat "$PART_FILE" >> "$FINAL_FILE"
    fi
done

echo "🎉 SUCCESS! Your AI context is ready at:"
echo "👉 $FINAL_FILE"