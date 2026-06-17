"""Unit tests for Authorization.verify_token."""

import os
from unittest.mock import MagicMock, patch

import pytest

from app.authorization import Authorization


class TestVerifyToken:
    def test_returns_true_on_200(self):
        mock_resp = MagicMock(status_code=200)
        with patch("app.authorization.requests.get", return_value=mock_resp), \
             patch.dict(os.environ, {"LARAVEL_HOST": "localhost", "LARAVEL_PORT": "8000", "LARAVEL_ME_URL": "/api/me"}):
            assert Authorization.verify_token("valid-token") is True

    def test_returns_false_on_401(self):
        mock_resp = MagicMock(status_code=401)
        with patch("app.authorization.requests.get", return_value=mock_resp), \
             patch.dict(os.environ, {"LARAVEL_HOST": "localhost", "LARAVEL_PORT": "8000", "LARAVEL_ME_URL": "/api/me"}):
            assert Authorization.verify_token("bad-token") is False

    def test_returns_false_on_500(self):
        mock_resp = MagicMock(status_code=500)
        with patch("app.authorization.requests.get", return_value=mock_resp), \
             patch.dict(os.environ, {"LARAVEL_HOST": "localhost", "LARAVEL_PORT": "8000", "LARAVEL_ME_URL": "/api/me"}):
            assert Authorization.verify_token("any-token") is False

    def test_sends_bearer_header(self):
        mock_resp = MagicMock(status_code=200)
        with patch("app.authorization.requests.get", return_value=mock_resp) as mock_get, \
             patch.dict(os.environ, {"LARAVEL_HOST": "localhost", "LARAVEL_PORT": "8000", "LARAVEL_ME_URL": "/api/me"}):
            Authorization.verify_token("my-token")
            _, kwargs = mock_get.call_args
            assert kwargs["headers"]["Authorization"] == "Bearer my-token"

    def test_host_prefixed_with_http_if_missing(self):
        mock_resp = MagicMock(status_code=200)
        with patch("app.authorization.requests.get", return_value=mock_resp) as mock_get, \
             patch.dict(os.environ, {"LARAVEL_HOST": "myhost.local", "LARAVEL_PORT": "8000", "LARAVEL_ME_URL": "/api/me"}):
            Authorization.verify_token("tok")
            url = mock_get.call_args[0][0]
            assert url.startswith("http://")

    def test_host_not_double_prefixed_when_already_http(self):
        mock_resp = MagicMock(status_code=200)
        with patch("app.authorization.requests.get", return_value=mock_resp) as mock_get, \
             patch.dict(os.environ, {"LARAVEL_HOST": "http://myhost.local", "LARAVEL_PORT": "8000", "LARAVEL_ME_URL": "/api/me"}):
            Authorization.verify_token("tok")
            url = mock_get.call_args[0][0]
            assert not url.startswith("http://http://")
