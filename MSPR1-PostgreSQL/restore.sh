#!/bin/bash
set -e

DUMP_FILE="/tmp/init.dump"

if [ ! -f "$DUMP_FILE" ]; then
    echo "[restore] No dump file found at $DUMP_FILE, skipping."
    exit 0
fi

echo "[restore] Restoring database from dump..."

pg_restore \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --no-owner \
    --no-acl \
    --no-create-db \
    "$DUMP_FILE" || echo "[restore] pg_restore finished (some non-fatal errors may appear above)"

echo "[restore] Done."
