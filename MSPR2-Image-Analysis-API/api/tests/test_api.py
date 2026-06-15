from fastapi.testclient import TestClient

import api

from api.data_schemas import Food, OutputResponse

client = TestClient(api.app)

class TestHealth:
    def test_health_returns_ok(self) -> None:
        response = client.get("/health/")
        assert response.status_code == 200
        assert response.json() == "ok"


class TestAnalyze:
    def test_valid_token_returns_generated_payload(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: True)
        monkeypatch.setattr(
            api.OllamaService,
            "generate",
            lambda data: OutputResponse(aliments={"bread": Food(calories_kcal=99)}),
        )

        response = client.post(
            "/analyze/",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer valid"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["aliments"]["bread"]["calories_kcal"] == 99

    def test_invalid_token_returns_401(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: False)

        response = client.post(
            "/analyze/",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer bad"},
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid token"

    def test_missing_authorization_header_is_rejected(self) -> None:
        response = client.post("/analyze/", json={"base64_image": "abc"})
        assert response.status_code == 401

    def test_token_is_passed_through_to_verifier(self, monkeypatch) -> None:
        seen: dict = {}

        def fake_verify(token):
            seen["token"] = token
            return True

        monkeypatch.setattr(api.Authorization, "verify_token", fake_verify)
        monkeypatch.setattr(api.OllamaService, "generate", lambda data: {})

        client.post(
            "/analyze/",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer my-secret-token"},
        )

        assert seen["token"] == "my-secret-token"
