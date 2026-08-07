#!/bin/bash
# Script 8: ENV Config (Che giấu mật khẩu)
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/8_env_config.md"
ENV_FILE="$ROOT/.env"

mkdir -p "$OUT_DIR"
echo "# 8. ENV CONFIGURATION" > "$FILE"
echo "> Note: Values are redacted (*****)" >> "$FILE"

echo '```bash' >> "$FILE"
if [ -f "$ENV_FILE" ]; then
    # Lệnh sed này thay thế mọi ký tự sau dấu = thành *****
    grep -v '^#' "$ENV_FILE" | sed 's/=.*$/=*****/' >> "$FILE"
else
    echo "No .env file found" >> "$FILE"
fi
echo '```' >> "$FILE"
echo "✅ Done: $FILE"