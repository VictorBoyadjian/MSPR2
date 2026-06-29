# MSPR2 — HealthAI

## 🚀 Lancement
  
Le dossier [start/](start/) lance **toute la stack** (build des images + démarrage + restauration
de la base à partir de `start/pg_restore/dump.sql`).

**Prérequis** : [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.

### Windows

```bat
cd start
start.bat
```

### macOS / Linux

```bash
cd start
chmod +x start.sh   # la première fois
./start.sh
```

### URLs une fois démarré

| Service | URL |
|---------|-----|
| 🖥️ Application HealthAI | <http://localhost:3000> |
| 🔌 API métier (Laravel) | <http://localhost:8080> |
| 📖 Swagger UI (API métier) | <http://localhost:8080/api/documentation> |
| 🍽️ Image Analysis API | <http://localhost:2021/docs> |
| 🤖 ML / Reco API | <http://localhost:8000/docs> |
| 🗄️ PostgreSQL | `localhost:5433` (user `postgres` / mdp `postgres` / base `healthai`)


### Relancer build apk
cd healthai-app/android
rm -rf app/.cxx app/build
./gradlew assembleDebug