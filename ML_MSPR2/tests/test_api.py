"""Unit tests for FastAPI endpoints (app/main.py)."""

from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# /health
# ---------------------------------------------------------------------------

class TestHealth:
    def test_returns_200(self, client):
        r = client.get("/health")
        assert r.status_code == 200

    def test_returns_ok_status(self, client):
        assert client.get("/health").json()["status"] == "ok"

    def test_returns_version(self, client):
        assert client.get("/health").json()["version"] == "2.0.0"


# ---------------------------------------------------------------------------
# Auth guard — all protected endpoints return 401 when token is invalid
# ---------------------------------------------------------------------------

_POST_ENDPOINTS = [
    ("/recommend",          {"age": 30, "gender": "male", "weight_kg": 75, "height_cm": 175, "body_fat_pct": 15, "resting_bpm": 65, "experience_level": "intermediate"}),
    ("/nutrition/meals",    {"profile": "perte_poids_debutant"}),
    ("/nutrition/calories", {"age": 30, "gender": "male", "weight_kg": 75, "height_cm": 175, "target_weight_kg": 70, "weeks_to_goal": 10, "profile": "perte_poids_debutant"}),
    ("/logs/feedback",      {"prediction_id": "x", "chosen_profile": "maintien_bien_etre"}),
    ("/sessions/exercises", {"profile": "perte_poids_debutant"}),
]

_GET_ENDPOINTS = ["/profiles", "/logs/comparison"]


class TestAuthGuard:
    @pytest.mark.parametrize("path,body", _POST_ENDPOINTS)
    def test_post_returns_401_with_invalid_token(self, client_unauthorized, path, body):
        r = client_unauthorized.post(path, json=body, headers={"Authorization": "Bearer bad"})
        assert r.status_code == 401

    @pytest.mark.parametrize("path", _GET_ENDPOINTS)
    def test_get_returns_401_with_invalid_token(self, client_unauthorized, path):
        r = client_unauthorized.get(path, headers={"Authorization": "Bearer bad"})
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# /nutrition/calories — happy path (pure math, no external deps)
# ---------------------------------------------------------------------------

CALORIES_PAYLOAD = {
    "age": 30, "gender": "male", "weight_kg": 80.0, "height_cm": 180.0,
    "target_weight_kg": 75.0, "weeks_to_goal": 10, "profile": "perte_poids_debutant",
}


class TestCaloriesEndpoint:
    def test_returns_200(self, client):
        r = client.post("/nutrition/calories", json=CALORIES_PAYLOAD,
                        headers={"Authorization": "Bearer tok"})
        assert r.status_code == 200

    def test_response_contains_goal_type(self, client):
        r = client.post("/nutrition/calories", json=CALORIES_PAYLOAD,
                        headers={"Authorization": "Bearer tok"})
        assert "goal_type" in r.json()

    def test_deficit_goal_for_weight_loss(self, client):
        r = client.post("/nutrition/calories", json=CALORIES_PAYLOAD,
                        headers={"Authorization": "Bearer tok"})
        assert r.json()["goal_type"] == "deficit"

    def test_invalid_profile_returns_422(self, client):
        bad = {**CALORIES_PAYLOAD, "profile": "inexistant"}
        r = client.post("/nutrition/calories", json=bad,
                        headers={"Authorization": "Bearer tok"})
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# /nutrition/meals — mock service via app.main.service
# ---------------------------------------------------------------------------

MEALS_PAYLOAD = {"profile": "perte_poids_debutant"}


class TestMealsEndpoint:
    def test_returns_200_with_mocked_service(self, client):
        from app.schemas import MealsOutput
        mock_svc = MagicMock()
        mock_svc.get_meals.return_value = MealsOutput(
            profile="perte_poids_debutant",
            allergens_excluded=[],
            meal_type_filter=None,
            count=0,
            meals=[],
        )
        with patch("app.main.service", mock_svc):
            r = client.post("/nutrition/meals", json=MEALS_PAYLOAD,
                            headers={"Authorization": "Bearer tok"})
        assert r.status_code == 200

    def test_invalid_profile_returns_422(self, client):
        r = client.post("/nutrition/meals", json={"profile": "invalide"},
                        headers={"Authorization": "Bearer tok"})
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# /sessions/exercises — mock service via app.main.service
# ---------------------------------------------------------------------------

class TestSessionsEndpoint:
    def test_returns_200_with_mocked_service(self, client):
        from app.schemas import SessionOutput
        mock_svc = MagicMock()
        mock_svc.get_sessions.return_value = SessionOutput(
            profile="prise_masse_debutant",
            session_type_filter=None,
            body_parts_excluded=[],
            count=0,
            sessions=[],
        )
        with patch("app.main.service", mock_svc):
            r = client.post("/sessions/exercises",
                            json={"profile": "prise_masse_debutant"},
                            headers={"Authorization": "Bearer tok"})
        assert r.status_code == 200

    def test_invalid_body_region_returns_422(self, client):
        r = client.post("/sessions/exercises",
                        json={"profile": "prise_masse_debutant", "body_parts_to_exclude": ["tete"]},
                        headers={"Authorization": "Bearer tok"})
        assert r.status_code == 422


# ---------------------------------------------------------------------------
# /logs/feedback — mock firebase (imported lazily inside handler)
# ---------------------------------------------------------------------------

class TestFeedbackEndpoint:
    def test_returns_200_with_mocked_firebase(self, client):
        mock_doc = {
            "recommended_profile": "perte_poids_debutant",
            "chosen_profile": "maintien_bien_etre",
            "followed_recommendation": False,
        }
        with patch("app.firebase.log_feedback", return_value=mock_doc):
            r = client.post("/logs/feedback",
                            json={"prediction_id": "abc-123", "chosen_profile": "maintien_bien_etre"},
                            headers={"Authorization": "Bearer tok"})
        assert r.status_code == 200

    def test_firebase_not_found_returns_404(self, client):
        with patch("app.firebase.log_feedback", side_effect=ValueError("not found")):
            r = client.post("/logs/feedback",
                            json={"prediction_id": "bad-id", "chosen_profile": "maintien_bien_etre"},
                            headers={"Authorization": "Bearer tok"})
        assert r.status_code == 404

    def test_firebase_timeout_returns_503(self, client):
        import requests as req_lib
        with patch("app.firebase.log_feedback", side_effect=req_lib.exceptions.Timeout):
            r = client.post("/logs/feedback",
                            json={"prediction_id": "abc", "chosen_profile": "maintien_bien_etre"},
                            headers={"Authorization": "Bearer tok"})
        assert r.status_code == 503


# ---------------------------------------------------------------------------
# /logs/comparison — mock firebase
# ---------------------------------------------------------------------------

class TestComparisonEndpoint:
    def test_returns_200_with_mocked_firebase(self, client):
        mock_stats = {
            "total_with_feedback": 10,
            "followed_recommendation": 7,
            "follow_rate_pct": 70.0,
            "by_profile": {},
        }
        with patch("app.firebase.get_comparison_stats", return_value=mock_stats):
            r = client.get("/logs/comparison", headers={"Authorization": "Bearer tok"})
        assert r.status_code == 200

    def test_firebase_timeout_returns_503(self, client):
        import requests as req_lib
        with patch("app.firebase.get_comparison_stats", side_effect=req_lib.exceptions.Timeout):
            r = client.get("/logs/comparison", headers={"Authorization": "Bearer tok"})
        assert r.status_code == 503
