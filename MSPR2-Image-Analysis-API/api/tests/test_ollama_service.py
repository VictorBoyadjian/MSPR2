"""Unit tests for ollama_service.OllamaService.

External calls (the Ollama HTTP client, the streaming renderer) are replaced so
no model is ever contacted or pulled.
"""

from types import SimpleNamespace

from ollama import ChatResponse, Message

import ollama_service
from data_schemas import OutputResponse, UploadDish
from ollama_service import OllamaService


class TestModuleLoad:
    def test_models_loaded_from_env(self) -> None:
        assert OllamaService.models == ["llama3.2-vision", "gemma3"]

    def test_selected_model_resolved_from_index(self) -> None:
        assert OllamaService._selected_model == "llama3.2-vision"


class TestCheckModelAvailability:
    def test_true_when_selected_model_present(self, monkeypatch) -> None:
        fake_client = SimpleNamespace(
            list=lambda: SimpleNamespace(models=[{"model": "llama3.2-vision"}])
        )
        monkeypatch.setattr(OllamaService, "_client", fake_client)
        assert OllamaService.check_model_availability() is True

    def test_false_when_model_absent(self, monkeypatch) -> None:
        fake_client = SimpleNamespace(
            list=lambda: SimpleNamespace(models=[{"model": "something-else"}])
        )
        monkeypatch.setattr(OllamaService, "_client", fake_client)
        assert OllamaService.check_model_availability() is False

    def test_explicit_model_argument_is_used(self, monkeypatch) -> None:
        fake_client = SimpleNamespace(
            list=lambda: SimpleNamespace(models=[{"model": "gemma3"}])
        )
        monkeypatch.setattr(OllamaService, "_client", fake_client)
        assert OllamaService.check_model_availability(model="gemma3") is True
        assert OllamaService.check_model_availability(model="absent") is False


class TestDownloadModel:
    def test_returns_true_on_success(self, monkeypatch) -> None:
        fake_client = SimpleNamespace(pull=lambda name, stream=False: iter([]))
        monkeypatch.setattr(OllamaService, "_client", fake_client)
        monkeypatch.setattr(
            ollama_service.MessageRenderer,
            "pulling_message",
            lambda stream, required_model: None,
        )
        assert OllamaService.download_model("gemma3") is True

    def test_returns_false_on_exception(self, monkeypatch) -> None:
        def boom(name, stream=False):
            raise RuntimeError("network down")

        fake_client = SimpleNamespace(pull=boom)
        monkeypatch.setattr(OllamaService, "_client", fake_client)
        assert OllamaService.download_model("gemma3") is False


class TestPullModels:
    def test_all_models_only_downloads_missing(self, monkeypatch) -> None:
        downloaded: list = []
        # llama3.2-vision is available, gemma3 is not
        monkeypatch.setattr(
            OllamaService,
            "check_model_availability",
            lambda model=None: model == "llama3.2-vision",
        )

        def fake_download(model_name):
            downloaded.append(model_name)
            return True

        monkeypatch.setattr(OllamaService, "download_model", fake_download)

        result = OllamaService.pull_models(all_models=True)

        assert downloaded == ["gemma3"]
        assert result == ["gemma3"]

    def test_single_model_delegates_to_download(self, monkeypatch) -> None:
        monkeypatch.setattr(OllamaService, "download_model", lambda model_name: True)
        assert OllamaService.pull_models() is True


class TestGenerate:
    def test_happy_path_returns_output_response(self, monkeypatch) -> None:
        monkeypatch.setattr(
            OllamaService, "check_model_availability", lambda model=None: True
        )
        chat_response = ChatResponse(
            message=Message(
                role="assistant",
                content='{"bread": {"quantity": 1, "quantity_g": 100}}',
            )
        )
        fake_client = SimpleNamespace(chat=lambda **kwargs: chat_response)
        monkeypatch.setattr(OllamaService, "_client", fake_client)

        result = OllamaService.generate(UploadDish(base64_image="img"))

        assert isinstance(result, OutputResponse)
        assert result.aliments["bread"].quantity_g == 100

    def test_returns_empty_when_model_unavailable_and_pull_fails(
        self, monkeypatch
    ) -> None:
        monkeypatch.setattr(
            OllamaService, "check_model_availability", lambda model=None: False
        )
        monkeypatch.setattr(OllamaService, "pull_models", lambda: False)

        result = OllamaService.generate(UploadDish(base64_image="img"))

        assert result == {}

    def test_chat_receives_selected_model_and_image(self, monkeypatch) -> None:
        captured: dict = {}
        monkeypatch.setattr(
            OllamaService, "check_model_availability", lambda model=None: True
        )

        def fake_chat(**kwargs):
            captured.update(kwargs)
            return ChatResponse(
                message=Message(role="assistant", content='{"x": {"quantity": 1}}')
            )

        monkeypatch.setattr(OllamaService, "_client", SimpleNamespace(chat=fake_chat))

        OllamaService.generate(UploadDish(base64_image="the-image"))

        assert captured["model"] == "llama3.2-vision"
        assert captured["messages"][0]["images"] == ["the-image"]
