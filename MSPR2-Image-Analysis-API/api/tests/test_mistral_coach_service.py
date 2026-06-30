"""Unit tests for mistral_coach_service.MistralCoachService.

The Mistral HTTP client is replaced so no API call is ever made.
"""

from types import SimpleNamespace

from data_schemas import CoachMessageInput, CoachMessageOutput
from mistral_coach_service import MistralCoachService


def _input() -> CoachMessageInput:
    return CoachMessageInput(
        first_name="Victor",
        goal="Perte de poids (débutant)",
        current_weight_kg=80.0,
        target_weight_kg=75.0,
        sport_hours_this_week=3.5,
        weekly_average_hours=2.0,
        sessions_count=3,
        meals_logged=12,
        avg_daily_calories=2100.0,
    )


def _mistral_response(content: str) -> SimpleNamespace:
    """Minimal stand-in for the object returned by client.chat.complete."""
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


def _fake_client(capture: dict, content: str) -> SimpleNamespace:
    def complete(**kwargs):
        capture.update(kwargs)
        return _mistral_response(content)

    return SimpleNamespace(chat=SimpleNamespace(complete=complete))


class TestGenerate:
    def test_happy_path_returns_coach_message(self, monkeypatch) -> None:
        captured: dict = {}
        content = "Bravo Victor, 3 séances cette semaine ! Continue sur ta lancée."
        monkeypatch.setattr(
            MistralCoachService, "_client", _fake_client(captured, content)
        )

        result = MistralCoachService.generate(_input())

        assert isinstance(result, CoachMessageOutput)
        assert result.message == content

    def test_strips_surrounding_quotes(self, monkeypatch) -> None:
        monkeypatch.setattr(
            MistralCoachService,
            "_client",
            _fake_client({}, '  "Beau travail cette semaine !"  '),
        )

        result = MistralCoachService.generate(_input())

        assert isinstance(result, CoachMessageOutput)
        assert result.message == "Beau travail cette semaine !"

    def test_returns_empty_dict_when_output_empty(self, monkeypatch) -> None:
        monkeypatch.setattr(
            MistralCoachService, "_client", _fake_client({}, "")
        )

        result = MistralCoachService.generate(_input())

        assert result == {}

    def test_uses_user_role_message(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            MistralCoachService,
            "_client",
            _fake_client(captured, "Continue comme ça !"),
        )

        MistralCoachService.generate(_input())

        assert captured["messages"][0]["role"] == "user"
        assert "Perte de poids" in captured["messages"][0]["content"]

    def test_logs_success_when_output_parsed(self, monkeypatch, capsys) -> None:
        monkeypatch.setattr(
            MistralCoachService,
            "_client",
            _fake_client({}, "Excellente semaine, garde le rythme !"),
        )

        MistralCoachService.generate(_input())

        captured = capsys.readouterr()
        assert "Mistral Coach has finished" in captured.out
