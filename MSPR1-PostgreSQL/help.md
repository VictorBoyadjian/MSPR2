# Migrations — aide-mémoire Flyway

Base de données PostgreSQL du projet MSPR (schéma applicatif `Data`, search_path
`System, Data`). Les migrations versionnées vivent dans
[`migrations/migrations/`](migrations/migrations/) et la config Flyway dans
[`migrations/flyway.toml`](migrations/flyway.toml).

> ⚠️ Deux mécanismes appliquent les `.sql`, ne pas les confondre :
> 1. **Flyway** (CLI / Flyway Desktop) → pour appliquer/contrôler les migrations sur
>    une base existante (local ou Railway). C'est l'objet de ce document.
> 2. **`restore.sh`** (`docker-entrypoint-initdb.d`) → rejoue tous les `V*.sql` via
>    `psql`, dans l'ordre de version, **uniquement au premier démarrage** du conteneur
>    (volume de données vide). Ce n'est PAS Flyway : pas de table d'historique, pas de
>    contrôle de checksum. Cf. [`restore.sh`](restore.sh).

---

## 1. Convention de nommage

```
V<version>__<description>.sql
```

- `V` majuscule, puis le numéro de version (ex. `00023`), puis `__` (double underscore),
  puis une description en `snake_case`.
- Exemple existant : `V00023__metrics_coach_message.sql`.
- L'ordre d'application suit la version (tri naturel). `outOfOrder = true` dans la config
  autorise l'insertion d'une version « en retard » entre deux déjà appliquées.

---

## 2. Pré-requis

Installer la CLI Flyway :

```bash
# macOS (Homebrew)
brew install flyway

# ou via l'archive officielle : https://documentation.red-gate.com/fd/command-line-184127404.html
```

Vérifier l'installation :

```bash
flyway --version
```

Toutes les commandes ci-dessous se lancent **depuis le dossier `migrations/`**
(là où se trouve `flyway.toml`) :

```bash
cd MSPR1-PostgreSQL/migrations
```

> Sinon, pointer la config explicitement : `flyway -configFiles=migrations/flyway.toml <commande>`.

---

## 3. Environnements

Définis dans `flyway.toml` :

| Environnement | Cible                                            |
|---------------|--------------------------------------------------|
| `MSPR1`       | Base distante Railway (`thomas.proxy.rlwy.net`)  |
| `MSPR-Local`  | Base locale (`127.0.0.1:5433/healthai`)          |

On choisit la cible avec `-environment=` :

```bash
flyway -environment=MSPR-Local info
flyway -environment=MSPR1     info
```

> Bonnes pratiques : ne pas committer de mots de passe. Pour la prod, surcharger l'URL et
> les identifiants en ligne de commande ou via variables d'env plutôt que dans `flyway.toml` :
>
> ```bash
> flyway -url="jdbc:postgresql://HOST:PORT/healthai" -user="$PGUSER" -password="$PGPASSWORD" info
> ```

---

## 4. Commandes principales

```bash
# Voir l'état : migrations appliquées / en attente (pending)
flyway -environment=MSPR-Local info

# Appliquer toutes les migrations en attente
flyway -environment=MSPR-Local migrate

# Vérifier l'intégrité (checksums) sans rien appliquer
flyway -environment=MSPR-Local validate

# Réparer la table d'historique (checksums recalculés, lignes en échec nettoyées)
# À utiliser si validate échoue après modif d'un fichier déjà appliqué.
flyway -environment=MSPR-Local repair

# Marquer une base existante (non vide) comme point de départ, sans rejouer l'existant
flyway -environment=MSPR-Local baseline

# ⚠️ DANGER : supprime TOUT le contenu du/des schéma(s). Jamais en prod.
flyway -environment=MSPR-Local clean
```

### Cibler une version précise

```bash
# N'appliquer que jusqu'à la version 00023 incluse
flyway -environment=MSPR-Local -target=00023 migrate
```

---

## 5. Workflow type pour ajouter une migration

1. Créer le fichier dans `migrations/migrations/` en respectant la convention
   (incrémenter le numéro de version le plus élevé existant).
2. Tester en local :
   ```bash
   cd MSPR1-PostgreSQL/migrations
   flyway -environment=MSPR-Local info      # la nouvelle migration apparaît en "Pending"
   flyway -environment=MSPR-Local migrate
   flyway -environment=MSPR-Local info      # vérifier qu'elle est "Success"
   ```
3. Appliquer en distant une fois validée :
   ```bash
   flyway -environment=MSPR1 migrate
   ```

---

## 6. Rappels utiles

- `migrate` n'applique que les fichiers **non encore enregistrés** dans la table
  d'historique Flyway (`flyway_schema_history`) ; rejouer la commande est sans effet si
  rien n'a changé (idempotent).
- Ne jamais **modifier** une migration déjà appliquée en prod : créer une nouvelle
  migration. Modifier un fichier déjà joué casse le checksum → `validate` échoue
  (corriger via `repair`, en connaissance de cause).
- Sur une base recréée de zéro via Docker, ce sont les `V*.sql` rejoués par `restore.sh`
  qui créent le schéma (pas Flyway) ; Flyway sert ensuite pour les évolutions.
