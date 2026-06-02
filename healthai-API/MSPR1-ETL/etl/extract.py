import logging
import pathlib

import pandas as pd

from .exceptions import InvalidFileFormatError

logger = logging.getLogger("etl")


def extract(file_path: str) -> pd.DataFrame:
    path = pathlib.Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Fichier introuvable : {file_path}")

    ext = path.suffix.lower()

    if ext not in (".csv", ".json", ".xlsx"):
        raise InvalidFileFormatError(
            file_path=str(file_path),
            message=f"Extension '{ext}' non supportée. Formats acceptés : .csv .json .xlsx.",
        )

    logger.info("extract | fichier=%s format=%s", path.name, ext)

    try:
        if ext == ".csv":
            df = pd.read_csv(file_path, on_bad_lines="skip", engine="python")
        elif ext == ".json":
            df = pd.read_json(file_path)
        else:
            df = pd.read_excel(file_path)
    except Exception as exc:
        logger.error("extract | échec lecture %s — %s", file_path, exc)
        raise

    logger.info("extract | lignes=%d colonnes=%d", len(df), len(df.columns))
    return df
