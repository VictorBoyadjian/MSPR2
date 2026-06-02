import logging
import re

import pandas as pd

from .exceptions import SchemaValidationError
from .schemas import COLUMN_ALIASES, REQUIRED_SCHEMAS

logger = logging.getLogger("etl")


def _normalize_col(name: str) -> str:
    name = name.strip().lower()
    name = re.sub(r"[^\w]+", "_", name)
    name = re.sub(r"_+", "_", name)
    return name.strip("_")


def validate(df: pd.DataFrame, dataset_type: str) -> pd.DataFrame:
    if dataset_type not in REQUIRED_SCHEMAS:
        raise ValueError(f"Dataset inconnu : '{dataset_type}'")

    # Normalisation snake_case
    df.columns = [_normalize_col(c) for c in df.columns]

    # Renommage selon les aliases du dataset
    df = df.rename(columns=COLUMN_ALIASES.get(dataset_type, {}))

    required = set(REQUIRED_SCHEMAS[dataset_type])
    present = set(df.columns)
    missing = sorted(required - present)
    extra = sorted(present - required)

    if extra:
        logger.info("validate | %s colonnes_extra=%s (ignorées)", dataset_type, extra)

    if missing:
        logger.error("validate | %s colonnes_manquantes=%s", dataset_type, missing)
        raise SchemaValidationError(dataset_type=dataset_type, missing_columns=missing)

    logger.info("validate | %s OK (%d colonnes requises)", dataset_type, len(required))
    return df
