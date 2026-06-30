from fastapi.testclient import TestClient

import api

from data_schemas import ScannedFood, OutputResponse, CoachMessageOutput

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
            lambda data: OutputResponse(aliments={"bread": ScannedFood(quantity_g=99)}),
        )

        response = client.post(
            "/analyze",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer valid"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["aliments"]["bread"]["quantity_g"] == 99

    def test_invalid_token_returns_401(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: False)

        response = client.post(
            "/analyze",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer bad"},
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid token"

    def test_missing_authorization_header_is_rejected(self) -> None:
        response = client.post("/analyze", json={"base64_image": "abc"})
        assert response.status_code == 401

    def test_token_is_passed_through_to_verifier(self, monkeypatch) -> None:
        seen: dict = {}

        def fake_verify(token):
            seen["token"] = token
            return True

        monkeypatch.setattr(api.Authorization, "verify_token", fake_verify)
        monkeypatch.setattr(api.OllamaService, "generate", lambda data: {})

        client.post(
            "/analyze",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer my-secret-token"},
        )

        assert seen["token"] == "my-secret-token"


class TestAnalyzeByMistral:
    def test_valid_token_returns_generated_payload(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: True)
        monkeypatch.setattr(
            api.MistralVisionService,
            "generate",
            lambda data: OutputResponse(aliments={"bread": ScannedFood(quantity_g=77)}),
        )

        response = client.post(
            "/analyze-by-mistral",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer valid"},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["aliments"]["bread"]["quantity_g"] == 77

    def test_invalid_token_returns_401(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: False)

        response = client.post(
            "/analyze-by-mistral",
            json={"base64_image": "abc"},
            headers={"Authorization": "Bearer bad"},
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid token"

    def test_missing_authorization_header_is_rejected(self) -> None:
        response = client.post("/analyze-by-mistral", json={"base64_image": "abc"})
        assert response.status_code == 401

    def test_data_is_passed_through_to_service(self, monkeypatch) -> None:
        seen: dict = {}

        def fake_generate(data):
            seen["base64_image"] = data.base64_image
            return {}

        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: True)
        monkeypatch.setattr(api.MistralVisionService, "generate", fake_generate)

        client.post(
            "/analyze-by-mistral",
            json={"base64_image": "my-image-data"},
            headers={"Authorization": "Bearer valid"},
        )

        assert seen["base64_image"] == "my-image-data"


class TestCoachMessage:
    def test_valid_token_returns_generated_message(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: True)
        monkeypatch.setattr(
            api.MistralCoachService,
            "generate",
            lambda data: CoachMessageOutput(message="Bravo, continue comme ça !"),
        )

        response = client.post(
            "/coach-message",
            json={"first_name": "Victor", "goal": "Perte de poids (débutant)"},
            headers={"Authorization": "Bearer valid"},
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Bravo, continue comme ça !"

    def test_invalid_token_returns_401(self, monkeypatch) -> None:
        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: False)

        response = client.post(
            "/coach-message",
            json={"goal": "Maintien et bien-être"},
            headers={"Authorization": "Bearer bad"},
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid token"

    def test_missing_authorization_header_is_rejected(self) -> None:
        response = client.post("/coach-message", json={"goal": "Maintien et bien-être"})
        assert response.status_code == 401

    def test_data_is_passed_through_to_service(self, monkeypatch) -> None:
        seen: dict = {}

        def fake_generate(data):
            seen["goal"] = data.goal
            seen["sessions_count"] = data.sessions_count
            return CoachMessageOutput(message="ok")

        monkeypatch.setattr(api.Authorization, "verify_token", lambda token: True)
        monkeypatch.setattr(api.MistralCoachService, "generate", fake_generate)

        client.post(
            "/coach-message",
            json={"goal": "Prise de masse (débutant)", "sessions_count": 4},
            headers={"Authorization": "Bearer valid"},
        )

        assert seen["goal"] == "Prise de masse (débutant)"
        assert seen["sessions_count"] == 4
