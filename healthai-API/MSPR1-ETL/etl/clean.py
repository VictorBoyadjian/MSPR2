import logging
import re
from typing import Tuple

import pandas as pd

from .schemas import ALLOWED_VALUES, NUMERIC_BOUNDS

logger = logging.getLogger("etl")


def clean(df: pd.DataFrame, dataset_type: str) -> Tuple[pd.DataFrame, int]:
    original_len = len(df)
    logger.info("clean | %s lignes_entrée=%d", dataset_type, original_len)

    df = _generic_clean(df)

    cleaner = {
        "users": _clean_users,
        "foods": _clean_foods,
        "exercises": _clean_exercises,
        "metrics": _clean_metrics,
    }.get(dataset_type)

    if cleaner:
        df = cleaner(df)

    rejected = original_len - len(df)
    logger.info("clean | %s lignes_sortie=%d rejetées=%d", dataset_type, len(df), rejected)
    return df, rejected


def _generic_clean(df: pd.DataFrame) -> pd.DataFrame:
    before = len(df)

    df.columns = (
        df.columns.str.strip()
        .str.lower()
        .str.replace(r"\s+", "_", regex=True)
        .str.replace(r"[^\w]", "_", regex=True)
    )

    str_cols = df.select_dtypes(include="object").columns
    df[str_cols] = df[str_cols].apply(lambda s: s.str.strip())

    df = df.drop_duplicates()
    if (dropped := before - len(df)):
        logger.info("clean | doublons_supprimés=%d", dropped)

    return df.reset_index(drop=True)


def _apply_numeric_bounds(df: pd.DataFrame, dataset_type: str) -> pd.DataFrame:
    for col, (lo, hi) in NUMERIC_BOUNDS.get(dataset_type, {}).items():
        if col not in df.columns:
            continue
        df[col] = pd.to_numeric(df[col], errors="coerce")
        before = len(df)
        df = df[df[col].between(lo, hi, inclusive="both") | df[col].isna()].copy()
        if (dropped := before - len(df)):
            logger.warning("clean | %s hors bornes [%s,%s] rejetées=%d", col, lo, hi, dropped)
    return df


def _standardise_categoricals(df: pd.DataFrame, dataset_type: str) -> pd.DataFrame:
    for col, allowed in ALLOWED_VALUES.get(dataset_type, {}).items():
        if col not in df.columns:
            continue
        df[col] = df[col].astype(str).str.lower().str.strip()
        before = len(df)
        df = df[df[col].isin(allowed) | df[col].isna()].copy()
        if (dropped := before - len(df)):
            logger.warning("clean | %s valeurs_invalides_rejetées=%d", col, dropped)
    return df


def _clean_users(df: pd.DataFrame) -> pd.DataFrame:
    if "email" in df.columns:
        pattern = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
        before = len(df)
        df = df[df["email"].apply(lambda v: bool(pattern.match(str(v))))]
        if (dropped := before - len(df)):
            logger.warning("clean | users emails_invalides=%d", dropped)

    df = df.dropna(subset=[c for c in ["email", "first_name", "last_name"] if c in df.columns])

    for col in ("age", "weight_kg", "height_cm"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = _apply_numeric_bounds(df, "users")
    df = _standardise_categoricals(df, "users")

    if "objective" in df.columns:
        df["objective"] = df["objective"].fillna("general_fitness").str.lower().str.strip()

    return df.reset_index(drop=True)


def _clean_foods(df: pd.DataFrame) -> pd.DataFrame:
    for col in ["calories_kcal", "proteins_g", "carbs_g", "fats_g", "fiber_g", "sugars_g", "sodium_mg"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df = _apply_numeric_bounds(df, "foods")
    df = _standardise_categoricals(df, "foods")

    if "name" in df.columns:
        df = df.dropna(subset=["name"])
        df = df[df["name"].str.strip() != ""]

    return df.reset_index(drop=True)


_DIFFICULTY_MAP = {
    "beginner": "debutant",
    "intermediate": "intermediaire",
    "advanced": "avance",
    "expert": "avance",
    "debutant": "debutant",
    "intermediaire": "intermediaire",
    "avance": "avance",
}


def _clean_exercises(df: pd.DataFrame) -> pd.DataFrame:
    if "difficulty" in df.columns:
        df["difficulty"] = (
            df["difficulty"].astype(str).str.lower().str.strip().map(_DIFFICULTY_MAP)
        )

    df = _standardise_categoricals(df, "exercises")

    if "equipment" in df.columns:
        df["equipment"] = df["equipment"].astype(str).str.lower().str.strip().replace("nan", "none")

    for col in ("name", "instructions"):
        if col in df.columns:
            df = df.dropna(subset=[col])
            df = df[df[col].str.strip() != ""]

    return df.reset_index(drop=True)


def _clean_metrics(df: pd.DataFrame) -> pd.DataFrame:
    for col in ["weight_kg", "bmi", "body_fat_pct", "heart_rate_avg", "heart_rate_max",
                "calories_burned", "workout_frequency", "water_intake_l"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "user_id" in df.columns:
        df["user_id"] = pd.to_numeric(df["user_id"], errors="coerce")

    # Si pas de user_id dans la source, on génère des ids séquentiels
    if "user_id" not in df.columns or df["user_id"].isna().all():
        df["user_id"] = range(1, len(df) + 1)
        logger.warning("clean | metrics user_id absent — ids séquentiels générés 1..%d", len(df))

    df = _apply_numeric_bounds(df, "metrics")
    return df.reset_index(drop=True)
