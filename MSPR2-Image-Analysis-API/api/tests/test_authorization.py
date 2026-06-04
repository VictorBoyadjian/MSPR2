import authorization
from authorization import Authorization

class _FakeResponse:
    def __init__(self, status_code: int) -> None:
        self.status_code = status_code


class TestVerifyToken:
    def test_returns_true_on_200(self, monkeypatch) -> None:
        monkeypatch.setattr(
            authorization.requests, "get", lambda *a, **k: _FakeResponse(200)
        )
        assert Authorization.verify_token("good-token") is True

    def test_returns_false_on_401(self, monkeypatch) -> None:
        monkeypatch.setattr(
            authorization.requests, "get", lambda *a, **k: _FakeResponse(401)
        )
        assert Authorization.verify_token("bad-token") is False

    def test_returns_false_on_500(self, monkeypatch) -> None:
        monkeypatch.setattr(
            authorization.requests, "get", lambda *a, **k: _FakeResponse(500)
        )
        assert Authorization.verify_token("anything") is False

    def test_sends_bearer_authorization_header(self, monkeypatch) -> None:
        captured: dict = {}

        def fake_get(url, headers=None, **kwargs):
            captured["url"] = url
            captured["headers"] = headers
            return _FakeResponse(200)

        monkeypatch.setattr(authorization.requests, "get", fake_get)

        Authorization.verify_token("my-token")

        assert captured["headers"]["Authorization"] == "Bearer my-token"

    def test_builds_url_from_env(self, monkeypatch) -> None:
        captured: dict = {}

        def fake_get(url, headers=None, **kwargs):
            captured["url"] = url
            return _FakeResponse(200)

        monkeypatch.setattr(authorization.requests, "get", fake_get)

        Authorization.verify_token("t")

        assert captured["url"] == "http://localhost:8080/api/me"
