"""Unit tests for mistral_service.MistralService.

The Mistral HTTP client is replaced so no API call is ever made.
"""

from types import SimpleNamespace

from data_schemas import DishCalculateInput, DishCalculateOutput
from mistral_service import MistralService


def _input() -> DishCalculateInput:
    return DishCalculateInput(aliments={"pain": {"quantity_g": 50}})


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
    def test_happy_path_returns_dish_output(self, monkeypatch) -> None:
        captured: dict = {}
        content = (
            '{"dish_name": "Tartine", "kcal": 250, "carbs_g": 30, '
            '"fats_g": 10, "fiber_g": 2.0, "proteins_g": 6}'
        )
        monkeypatch.setattr(
            MistralService, "_client", _fake_client(captured, content)
        )

        result = MistralService.generate(_input())

        assert isinstance(result, DishCalculateOutput)
        assert result.dish_name == "Tartine"
        assert result.kcal == 250

    def test_uses_expected_model_and_temperature(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            MistralService,
            "_client",
            _fake_client(captured, '{"dish_name": "X", "kcal": 1}'),
        )

        MistralService.generate(_input())

        assert captured["model"] == "mistral-large-latest"
        assert captured["temperature"] == 0.4
        assert captured["messages"][0]["role"] == "user"

    def test_returns_empty_dict_when_model_output_is_unparseable(
        self, monkeypatch
    ) -> None:
        monkeypatch.setattr(
            MistralService, "_client", _fake_client({}, "not json")
        )

        result = MistralService.generate(_input())

        assert result == {}

    def test_logs_failure_when_output_empty(self, monkeypatch, capsys) -> None:
        monkeypatch.setattr(MistralService, "_client", _fake_client({}, ""))

        MistralService.generate(_input())

        captured = capsys.readouterr()
        assert "Mistral has failed" in captured.out

    def test_logs_success_when_output_parsed(self, monkeypatch, capsys) -> None:
        monkeypatch.setattr(
            MistralService,
            "_client",
            _fake_client({}, '{"dish_name": "Soupe", "kcal": 90}'),
        )

        MistralService.generate(_input())

        captured = capsys.readouterr()
        assert "Mistral has finished" in captured.out
