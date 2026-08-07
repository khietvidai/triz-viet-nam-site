#!/bin/bash
# Script 4: Database Schema
ROOT="/Users/nguyenkhiet/DuAnPython/TRIZAI/triz-web-app"
OUT_DIR="$ROOT/script/DocCodeBase"
FILE="$OUT_DIR/4_database_schema.md"
SCHEMA="$ROOT/prisma/schema.prisma"

mkdir -p "$OUT_DIR"
echo "# 4. DATABASE SCHEMA" > "$FILE"

if [ -f "$SCHEMA" ]; then
    echo '```prisma' >> "$FILE"
    cat "$SCHEMA" >> "$FILE"
    echo '```' >> "$FILE"
else
    echo "⚠️ File schema.prisma not found!" >> "$FILE"
fi
echo "✅ Done: $FILE"