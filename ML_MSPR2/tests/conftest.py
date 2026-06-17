"""Shared fixtures for ML_MSPR2 tests."""

import sys
import types
from unittest.mock import MagicMock, patch

import pytest


def _make_mock_ml_modules():
    """Stub all ML imports so FitnessService can be imported without models on disk."""
    ml_pkg = types.ModuleType("ml")
    ml_src = types.ModuleType("ml.src")
    ml_pre = types.ModuleType("ml.src.preprocessing")
    ml_eng_mod = types.ModuleType("ml.src.preprocessing.engineer")
    ml_eng_mod.engineer = lambda df: df
    ml_pipe = types.ModuleType("ml.src.preprocessing.pipeline")
    ml_pipe.get_feature_names = lambda: []
    ml_rec = types.ModuleType("ml.src.recommendation_engine")
    ml_rec_eng = types.ModuleType("ml.src.recommendation_engine.engine")
    ml_rec_eng.get_program = MagicMock()
    ml_rec_eng.program_to_dict = MagicMock(return_value={})
    ml_rec_eng.list_profiles = MagicMock(return_value=[])
    ml_rec_eng._PROFILE_CONFIG = {}

    for name, mod in [
        ("ml", ml_pkg),
        ("ml.src", ml_src),
        ("ml.src.preprocessing", ml_pre),
        ("ml.src.preprocessing.engineer", ml_eng_mod),
        ("ml.src.preprocessing.pipeline", ml_pipe),
        ("ml.src.recommendation_engine", ml_rec),
        ("ml.src.recommendation_engine.engine", ml_rec_eng),
    ]:
        sys.modules.setdefault(name, mod)


_make_mock_ml_modules()


@pytest.fixture()
def mock_fitness_service():
    """Patch FitnessService singleton so no model files are needed."""
    with patch("joblib.load", return_value=MagicMock()):
        from app.service import FitnessService

        FitnessService._instance = None
        svc = FitnessService.__new__(FitnessService)
        svc._model = MagicMock()
        svc._encoder = MagicMock()
        FitnessService._instance = svc
        yield svc
        FitnessService._instance = None


@pytest.fixture()
def client(mock_fitness_service):
    """FastAPI TestClient with auth always returning True."""
    from fastapi.testclient import TestClient

    with patch("app.authorization.Authorization.verify_token", return_value=True):
        from app.main import app
        yield TestClient(app)


@pytest.fixture()
def client_unauthorized(mock_fitness_service):
    """FastAPI TestClient with auth always returning False."""
    from fastapi.testclient import TestClient

    with patch("app.authorization.Authorization.verify_token", return_value=False):
        from app.main import app
        yield TestClient(app)
