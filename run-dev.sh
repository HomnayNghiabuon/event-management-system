#!/bin/bash
# Chạy server dev – tự động load biến từ .env
# Sử dụng: ./run-dev.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "[ERROR] Không tìm thấy file .env"
    echo "  → Chạy: cp .env.example .env  rồi điền thông tin vào"
    exit 1
fi

echo "[INFO] Loading $ENV_FILE ..."
set -a
source "$ENV_FILE"
set +a

echo "[INFO] Starting server on port ${SERVER_PORT:-8081} ..."
"$SCRIPT_DIR/mvnw" spring-boot:run
