# Commandes utiles

## Docker — Image Analysis API


### Build (à partir du Dockerfile)

```bash
docker build -t nom_image .
```

### Run (avec port + environnement)

```bash
docker run -p 2021:2021 --env-file .env nom_image
```

> ⚠️ Le `.env` est copié dans l'image au build (`COPY . /app`).
> Si tu modifies le `.env`, il faut **rebuild** l'image.
> En local, Ollama se joint via `host.docker.internal`.

### Run en arrière-plan + nom du conteneur

```bash
docker run -d --name nom_contener -p 2021:2021 --env-file .env nom_image
```

### Voir les logs / arrêter

```bash
docker logs -f image-api
docker stop image-api
docker rm image-api
```

---

## Flyway — Migrations base de données

Dossier : `SQL/migrations/` (config `flyway.toml`, migrations dans `migrations/`)

### Voir l'état des migrations

```bash
cd SQL/migrations
flyway -environment=MSPR1 info
```

### Appliquer les migrations

```bash
cd SQL/migrations
flyway -environment=MSPR1 migrate
```

### Environnements disponibles

- `MSPR1`   → base distante Railway (`thomas.proxy.rlwy.net`)
- `target2` → base locale (`127.0.0.1:5433`)

```bash
# exemple en local
flyway -environment=target2 migrate
```

> L'utilisateur / mot de passe sont dans `flyway.user.toml`.
