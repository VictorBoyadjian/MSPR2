"""Unit tests for mistral_vision_service.MistralVisionService.

The Mistral HTTP client is replaced so no API call is ever made.
"""

from types import SimpleNamespace

from data_schemas import UploadDish, OutputResponse
from mistral_vision_service import MistralVisionService


def _input() -> UploadDish:
    return UploadDish(base64_image="aGVsbG8=")


def _mistral_response(content: str, usage: SimpleNamespace = None) -> SimpleNamespace:
    """Minimal stand-in for the object returned by client.chat.complete."""
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))],
        usage=usage,
    )


def _fake_client(capture: dict, content: str, usage: SimpleNamespace = None) -> SimpleNamespace:
    def complete(**kwargs):
        capture.update(kwargs)
        return _mistral_response(content, usage)

    return SimpleNamespace(chat=SimpleNamespace(complete=complete))


class TestGenerate:
    def test_happy_path_returns_output_response(self, monkeypatch) -> None:
        captured: dict = {}
        content = '{"foods": [{"name_fr": "pain", "quantity_g": 50, "confidence": "high"}]}'
        monkeypatch.setattr(
            MistralVisionService, "_client", _fake_client(captured, content)
        )

        result = MistralVisionService.generate(_input())

        assert isinstance(result, OutputResponse)
        assert "pain" in result.aliments
        assert result.aliments["pain"].quantity_g == 50
        assert result.aliments["pain"].accuracy == 0.9  # "high" confidence

    def test_sends_image_as_data_url_content_block(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client(captured, '{"foods": [{"name_fr": "riz", "quantity_g": 100}]}'),
        )

        MistralVisionService.generate(_input())

        content = captured["messages"][0]["content"]
        assert captured["messages"][0]["role"] == "user"
        assert captured["temperature"] == 0.4
        text_blocks = [b for b in content if b["type"] == "text"]
        image_blocks = [b for b in content if b["type"] == "image_url"]
        assert text_blocks, "prompt text block missing"
        assert image_blocks[0]["image_url"] == "data:image/jpeg;base64,aGVsbG8="

    def test_does_not_double_prefix_existing_data_url(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client(captured, '{"foods": [{"name_fr": "riz", "quantity_g": 100}]}'),
        )

        already = "data:image/webp;base64,UklGRg=="
        MistralVisionService.generate(UploadDish(base64_image=already))

        content = captured["messages"][0]["content"]
        image_blocks = [b for b in content if b["type"] == "image_url"]
        assert image_blocks[0]["image_url"] == already

    def test_passes_through_remote_image_url(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client(captured, '{"foods": [{"name_fr": "riz", "quantity_g": 100}]}'),
        )

        url = "https://example.com/meal.jpg"
        MistralVisionService.generate(UploadDish(base64_image=url))

        content = captured["messages"][0]["content"]
        image_blocks = [b for b in content if b["type"] == "image_url"]
        assert image_blocks[0]["image_url"] == url

    def test_uses_configured_vision_model(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client(captured, '{"foods": [{"name_fr": "x", "quantity_g": 1}]}'),
        )

        MistralVisionService.generate(_input())

        assert captured["model"] == MistralVisionService._model

    def test_returns_empty_dict_when_model_output_is_unparseable(
        self, monkeypatch
    ) -> None:
        monkeypatch.setattr(
            MistralVisionService, "_client", _fake_client({}, "not json")
        )

        result = MistralVisionService.generate(_input())

        assert result == {}

    def test_returns_fallback_when_request_raises(self, monkeypatch) -> None:
        def boom(**kwargs):
            raise RuntimeError("401 unauthorized")

        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            SimpleNamespace(chat=SimpleNamespace(complete=boom)),
        )

        result = MistralVisionService.generate(_input())

        assert isinstance(result, OutputResponse)
        assert result.aliments

    def test_logs_failure_when_output_empty(self, monkeypatch, capsys) -> None:
        monkeypatch.setattr(
            MistralVisionService, "_client", _fake_client({}, "not json")
        )

        MistralVisionService.generate(_input())

        captured = capsys.readouterr()
        assert "Mistral Vision has failed" in captured.out

    def test_includes_token_usage_in_response(self, monkeypatch) -> None:
        usage = SimpleNamespace(
            prompt_tokens=120, completion_tokens=30, total_tokens=150
        )
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client(
                {},
                '{"foods": [{"name_fr": "riz", "quantity_g": 100}]}',
                usage,
            ),
        )

        result = MistralVisionService.generate(_input())

        assert result.usage.prompt_tokens == 120
        assert result.usage.completion_tokens == 30
        assert result.usage.total_tokens == 150

    def test_usage_defaults_to_zero_when_absent(self, monkeypatch) -> None:
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client({}, '{"foods": [{"name_fr": "riz", "quantity_g": 100}]}'),
        )

        result = MistralVisionService.generate(_input())

        assert result.usage.total_tokens == 0

    def test_logs_success_when_output_parsed(self, monkeypatch, capsys) -> None:
        monkeypatch.setattr(
            MistralVisionService,
            "_client",
            _fake_client({}, '{"foods": [{"name_fr": "soupe", "quantity_g": 200}]}'),
        )

        MistralVisionService.generate(_input())

        captured = capsys.readouterr()
        assert "Mistral Vision has finished" in captured.out
