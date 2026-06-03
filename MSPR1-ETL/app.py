import logging
import logging.config
import os
import pathlib
import re
import shutil
from contextlib import asynccontextmanager
from typing import Any

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from etl.pipeline import run_pipeline

load_dotenv()

BASE_DIR = pathlib.Path(__file__).parent
UPLOADS_DIR = BASE_DIR / "uploads"
EXPORTS_DIR = BASE_DIR / "exports"
LOGS_DIR = BASE_DIR / "logs"
LOG_FILE = LOGS_DIR / "etl.log"

for d in (UPLOADS_DIR, EXPORTS_DIR, LOGS_DIR):
    d.mkdir(exist_ok=True)

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "std": {"format": "%(asctime)s [%(levelname)s] %(name)s | %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"}
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "std"},
        "file": {"class": "logging.FileHandler", "filename": str(LOG_FILE),
                 "formatter": "std", "encoding": "utf-8"},
    },
    "loggers": {
        "etl": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
        "app": {"handlers": ["console", "file"], "level": "INFO", "propagate": False},
    },
})

logger = logging.getLogger("app")

API_KEY = os.getenv("API_KEY", "")
_DEFAULT_DSN = "postgresql+psycopg2://postgres:postgres@mainline.proxy.rlwy.net:51566/healthai"


def _dsn() -> str:
    return os.getenv("DATABASE_URL", _DEFAULT_DSN).replace("postgresql+psycopg2://", "postgresql://")


def _db():
    return psycopg2.connect(_dsn())


def _query(sql: str, params: tuple = ()) -> list[dict]:
    conn = _db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def require_api_key(x_api_key: str = Header(..., alias="x-api-key")) -> None:
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("HealthAI Coach API démarrée")
    yield
    logger.info("HealthAI Coach API arrêtée")


app = FastAPI(
    title="HealthAI Coach — API",
    description="Pipeline ETL et API REST pour l'ingestion et la consultation de données santé/fitness.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACCEPTED_FORMATS = {".csv", ".json", ".xlsx"}


def _save_file(file: UploadFile) -> pathlib.Path:
    dest = UPLOADS_DIR / file.filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return dest


def _handle_upload(file: UploadFile, dataset_type: str) -> dict[str, Any]:
    if pathlib.Path(file.filename).suffix.lower() not in ACCEPTED_FORMATS:
        raise HTTPException(status_code=422, detail=f"Format non supporté. Acceptés : {ACCEPTED_FORMATS}")

    path = _save_file(file)
    logger.info("upload | dataset=%s fichier=%s", dataset_type, path.name)

    report = run_pipeline(str(path), dataset_type)
    if report["status"] == "error":
        raise HTTPException(status_code=422, detail=report)

    return report


# Upload ETL

@app.post("/upload/users", tags=["ETL Upload"], dependencies=[Depends(require_api_key)])
def upload_users(file: UploadFile = File(...)):
    """Ingestion d'un fichier de profils utilisateurs (CSV/JSON/XLSX)."""
    return _handle_upload(file, "users")


@app.post("/upload/foods", tags=["ETL Upload"], dependencies=[Depends(require_api_key)])
def upload_foods(file: UploadFile = File(...)):
    """Ingestion d'un fichier d'aliments."""
    return _handle_upload(file, "foods")


@app.post("/upload/exercises", tags=["ETL Upload"], dependencies=[Depends(require_api_key)])
def upload_exercises(file: UploadFile = File(...)):
    """Ingestion d'un catalogue d'exercices."""
    return _handle_upload(file, "exercises")


@app.post("/upload/metrics", tags=["ETL Upload"], dependencies=[Depends(require_api_key)])
def upload_metrics(file: UploadFile = File(...)):
    """Ingestion de métriques biométriques."""
    return _handle_upload(file, "metrics")


# Lecture CRUD

def _paginate(table: str, limit: int, offset: int) -> list[dict]:
    return _query(f'SELECT * FROM "{table}" LIMIT %s OFFSET %s', (limit, offset))


@app.get("/users", tags=["CRUD"])
def get_users(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
              _: None = Depends(require_api_key)):
    """Liste paginée des utilisateurs."""
    return _paginate("users", limit, offset)


@app.get("/foods", tags=["CRUD"])
def get_foods(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
              _: None = Depends(require_api_key)):
    """Liste paginée des aliments."""
    return _paginate("foods", limit, offset)


@app.get("/exercises", tags=["CRUD"])
def get_exercises(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
                  _: None = Depends(require_api_key)):
    """Liste paginée des exercices."""
    return _paginate("exercises", limit, offset)


@app.get("/metrics", tags=["CRUD"])
def get_metrics(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
                _: None = Depends(require_api_key)):
    """Liste paginée des métriques biométriques."""
    return _paginate("metrics", limit, offset)


@app.get("/sessions", tags=["CRUD"])
def get_sessions(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
                 _: None = Depends(require_api_key)):
    """Liste paginée des sessions d'entraînement."""
    return _paginate("sessions", limit, offset)


# Export

def _stream_csv(table: str) -> StreamingResponse:
    import io
    import pandas as pd
    conn = _db()
    try:
        df = pd.read_sql(f'SELECT * FROM "{table}"', conn)
    finally:
        conn.close()
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(buf, media_type="text/csv",
                             headers={"Content-Disposition": f"attachment; filename={table}.csv"})


@app.get("/export/users/csv", tags=["Export"])
def export_users_csv(_: None = Depends(require_api_key)):
    return _stream_csv("users")

@app.get("/export/users/json", tags=["Export"])
def export_users_json(_: None = Depends(require_api_key)):
    return JSONResponse(_query('SELECT * FROM "users"'))

@app.get("/export/foods/csv", tags=["Export"])
def export_foods_csv(_: None = Depends(require_api_key)):
    return _stream_csv("foods")

@app.get("/export/foods/json", tags=["Export"])
def export_foods_json(_: None = Depends(require_api_key)):
    return JSONResponse(_query('SELECT * FROM "foods"'))

@app.get("/export/exercises/csv", tags=["Export"])
def export_exercises_csv(_: None = Depends(require_api_key)):
    return _stream_csv("exercises")

@app.get("/export/metrics/csv", tags=["Export"])
def export_metrics_csv(_: None = Depends(require_api_key)):
    return _stream_csv("metrics")


# Monitoring

@app.get("/etl/health", tags=["Monitoring"])
def etl_health():
    """Vérifie la connexion DB et l'état de l'API. Pas d'authentification requise."""
    try:
        conn = _db()
        conn.close()
        db_status = "connectée"
        ok = True
    except Exception as exc:
        db_status = f"erreur : {exc}"
        ok = False

    return {"status": "ok" if ok else "dégradé", "base_de_donnees": db_status,
            "log": str(LOG_FILE), "uploads": str(UPLOADS_DIR)}


@app.get("/etl/logs", tags=["Monitoring"])
def etl_logs(lines: int = Query(100, ge=1, le=1000), _: None = Depends(require_api_key)):
    """Retourne les dernières lignes du fichier de log ETL."""
    if not LOG_FILE.exists():
        return {"lines": []}
    with LOG_FILE.open("r", encoding="utf-8") as f:
        return {"lines": [l.rstrip() for l in f.readlines()[-lines:]]}


@app.get("/quality/report", tags=["Monitoring"])
def quality_report(_: None = Depends(require_api_key)):
    """Rapport qualité agrégé par dataset, calculé depuis les logs d'exécution."""
    if not LOG_FILE.exists():
        return {"datasets": {}}

    pattern = re.compile(
        r"pipeline \| END dataset=(\S+) status=(\S+) rows_raw=(\d+) rows_clean=\d+ "
        r"rows_inserted=(\d+) rejected=(\d+)"
    )
    stats: dict[str, dict[str, Any]] = {}

    with LOG_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            m = pattern.search(line)
            if not m:
                continue
            ds, status, raw, inserted, rejected = (
                m.group(1), m.group(2), int(m.group(3)), int(m.group(4)), int(m.group(5))
            )
            e = stats.setdefault(ds, {"executions": 0, "rows_raw": 0,
                                       "rows_inserted": 0, "rejected_rows": 0, "errors": 0})
            e["executions"] += 1
            e["rows_raw"] += raw
            e["rows_inserted"] += inserted
            e["rejected_rows"] += rejected
            if status != "success":
                e["errors"] += 1

    for e in stats.values():
        total = e["rows_raw"]
        e["taux_rejet_pct"] = round(e["rejected_rows"] / total * 100, 2) if total else 0.0
        e["taux_insertion_pct"] = round(e["rows_inserted"] / total * 100, 2) if total else 0.0

    return {"datasets": stats}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
