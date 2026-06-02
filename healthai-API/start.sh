#!/bin/bash
set -e

echo "========================================================================================"
echo "        Lancement MSPR1 - PostgreSQL + API Laravel + Grafana + REACT + ETL"
echo "========================================================================================"

# Vérifier que Docker est lancé
if ! docker info > /dev/null 2>&1; then
    echo "[ERREUR] Docker n'est pas lancé. Démarre Docker Desktop puis relance ce script."
    exit 1
fi

# Se placer à la racine du projet (là où se trouve le script)
cd "$(dirname "$0")"

if [ ! -f "docker-compose.yml" ]; then
    echo "[ERREUR] docker-compose.yml introuvable à la racine."
    exit 1
fi

echo "[INFO] Nettoyage des conteneurs existants..."
docker compose down --remove-orphans -v > /dev/null 2>&1 || true

echo "[INFO] Suppression des conteneurs fantômes si nécessaire..."
docker rm -f mspr1-api > /dev/null 2>&1 || true
docker rm -f postgres > /dev/null 2>&1 || true

echo "[INFO] Construction et démarrage des conteneurs..."
docker compose up --build -d

echo ""
echo "[INFO] Attente que PostgreSQL soit opérationnel..."
until docker exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done
echo "[OK] PostgreSQL est prêt."

echo ""
echo "[INFO] Lancement du restore de la base de données..."

# --- Restore via le conteneur PostgreSQL ---
DUMP_FILE="start/pg_restore/db_dump.sql"
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_NAME=healthai

if [ ! -f "$DUMP_FILE" ]; then
    echo "[ERREUR] Fichier dump introuvable : $DUMP_FILE"
    exit 1
fi

echo "[INFO] Host     : ${DB_HOST}:${DB_PORT}"
echo "[INFO] Base     : ${DB_NAME}"
echo "[INFO] User     : ${DB_USER}"
echo "[INFO] Dump     : ${DUMP_FILE}"
echo ""

# Copier le dump dans le conteneur et lancer pg_restore
docker cp "$DUMP_FILE" postgres:/tmp/db_dump.sql

echo "[INFO] Lancement du restore..."
docker exec -e PGPASSWORD=postgres postgres \
    pg_restore \
    --host localhost \
    --port 5432 \
    --username "$DB_USER" \
    --dbname "$DB_NAME" \
    --verbose \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    /tmp/db_dump.sql || true

# Nettoyage du dump temporaire dans le conteneur
docker exec postgres rm -f /tmp/db_dump.sql

echo ""
echo "============================================"
echo "  Restore terminé !"
echo "============================================"

echo ""
echo "============================================"
echo "  Tout est démarré !"
echo "  API dispo sur  : http://localhost:8080"
echo "  Swagger UI     : http://localhost:8080/api/documentation"
echo "  React          : http://localhost:3000"
echo "  Grafana        : http://localhost:1506"
echo "  ETL API        : http://localhost:5005"
echo "============================================"
echo ""
echo "[INFO] Logs en direct : docker compose logs -f"
echo "[INFO] Pour arrêter   : docker compose down"
echo ""
