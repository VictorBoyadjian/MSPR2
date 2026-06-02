import logging
import os

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

from .exceptions import DatabaseLoadError

logger = logging.getLogger("etl")

_DEFAULT_DSN = "postgresql+psycopg2://postgres:postgres@mainline.proxy.rlwy.net:51566/healthai"
DB_SCHEMA = os.getenv("DB_SCHEMA", "Data")


def _get_conn() -> psycopg2.extensions.connection:
    dsn = os.getenv("DATABASE_URL", _DEFAULT_DSN).replace("postgresql+psycopg2://", "postgresql://")
    try:
        conn = psycopg2.connect(dsn)
        conn.autocommit = False
        return conn
    except psycopg2.OperationalError as exc:
        raise DatabaseLoadError(table_name="N/A", detail=str(exc)) from exc


def _table_columns(conn, table_name: str) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = %s AND table_name = %s
            ORDER BY ordinal_position
            """,
            (DB_SCHEMA, table_name,),
        )
        return [row[0] for row in cur.fetchall()]


def _ensure_stub_users(conn, user_ids: list[int]) -> None:
    if not user_ids:
        return

    with conn.cursor() as cur:
        cur.execute("SELECT id FROM \"Data\".\"users\" WHERE id = ANY(%s)", (user_ids,))
        existing = {row[0] for row in cur.fetchall()}

    missing = [uid for uid in user_ids if uid not in existing]
    if not missing:
        return

    logger.warning("load | insertion de %d utilisateurs stubs (FK metrics→users)", len(missing))

    stubs = [
        (uid, f"stub_{uid}@healthai.local", f"Utilisateur{uid}", "Stub", None, None, None, None)
        for uid in missing
    ]
    with conn.cursor() as cur:
        execute_values(
            cur,
            'INSERT INTO "Data"."users" (id, email, first_name, last_name, age, gender, weight_kg, height_cm) '
            "VALUES %s ON CONFLICT (id) DO NOTHING",
            stubs,
        )


def load(df: pd.DataFrame, table_name: str) -> int:
    if df.empty:
        logger.warning("load | %s DataFrame vide, rien à insérer", table_name)
        return 0

    conn = None
    try:
        conn = _get_conn()

        db_cols = _table_columns(conn, table_name)
        if not db_cols:
            raise DatabaseLoadError(table_name, f"Table '{table_name}' introuvable.")

        df_cols = set(df.columns)
        columns = [c for c in db_cols if c in df_cols]
        ignored = df_cols - set(db_cols)

        if ignored:
            logger.info("load | %s colonnes_ignorées=%s", table_name, sorted(ignored))

        if not columns:
            raise DatabaseLoadError(table_name, "Aucune colonne commune entre le DataFrame et la table.")

        df = df[columns]

    except DatabaseLoadError:
        if conn:
            conn.close()
        raise
    except Exception as exc:
        if conn:
            conn.close()
        raise DatabaseLoadError(table_name, str(exc)) from exc

    if table_name == "metrics" and "user_id" in df.columns:
        _ensure_stub_users(conn, df["user_id"].dropna().astype(int).tolist())

    records = [
        tuple(None if pd.isna(v) else v for v in row)
        for row in df.itertuples(index=False, name=None)
    ]
    col_list = ", ".join(f'"{c}"' for c in columns)
    sql = f'INSERT INTO "{DB_SCHEMA}"."{table_name}" ({col_list}) VALUES %s ON CONFLICT DO NOTHING'

    logger.info("load | %s lignes=%d", table_name, len(records))

    try:
        with conn.cursor() as cur:
            cur.execute(f'SELECT COUNT(*) FROM "{DB_SCHEMA}"."{table_name}"')
            before = cur.fetchone()[0]

            execute_values(cur, sql, records, page_size=500)

            cur.execute(f'SELECT COUNT(*) FROM "{DB_SCHEMA}"."{table_name}"')
            after = cur.fetchone()[0]

        conn.commit()
        inserted = after - before
        logger.info("load | %s insérées=%d conflits_ignorés=%d", table_name, inserted, len(records) - inserted)
        return inserted

    except Exception as exc:
        if conn:
            conn.rollback()
            logger.error("load | %s ROLLBACK — %s", table_name, exc)
        raise DatabaseLoadError(table_name, str(exc)) from exc

    finally:
        if conn:
            conn.close()
