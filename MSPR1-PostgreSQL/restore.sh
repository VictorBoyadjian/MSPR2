#!/bin/bash
set -e

MIGRATIONS_DIR="/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "[init] No migrations directory found at $MIGRATIONS_DIR, skipping."
    exit 0
fi

echo "[init] Preparing schemas on database '$POSTGRES_DB'..."

# The 'healthai' database is already created by the postgres entrypoint
# (POSTGRES_DB). Here we create the schemas the API expects and make the
# migrations land in "Data" (the API search_path is "System","Data").
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE SCHEMA IF NOT EXISTS "System";
    CREATE SCHEMA IF NOT EXISTS "Data";
    ALTER DATABASE "$POSTGRES_DB" SET search_path TO "System", "Data";
EOSQL

echo "[init] Running migrations one by one..."

# Run each migration file in version order. Tables are created in "Data"
# because search_path is forced to "Data" for the migration sessions.
for file in $(ls "$MIGRATIONS_DIR"/V*.sql | sort -V); do
    echo "[init] Applying $(basename "$file")..."
    PGOPTIONS="--search_path=Data" psql -v ON_ERROR_STOP=1 \
        --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
        -f "$file"
done

echo "[init] All migrations applied."
