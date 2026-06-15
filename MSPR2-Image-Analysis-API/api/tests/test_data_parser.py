"""Unit tests for data_parser.Parser (Ollama and Mistral responses)."""

from types import SimpleNamespace

from ollama import ChatResponse, Message

from data_parser import Parser
from data_schemas import DishCalculateOutput, Food, OutputResponse, ScannedFood


def _ollama_response(content: str) -> ChatResponse:
    return ChatResponse(message=Message(role="assistant", content=content))


def _mistral_response(content) -> SimpleNamespace:
    """Minimal stand-in for mistralai.ChatCompletionResponse."""
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


class TestOllamaResponseSuccess:
    def test_parses_foods_list_into_output_response(self) -> None:
        raw = (
            '{"foods": [{"name_fr": "pain", "quantity_g": 50, '
            '"calories_kcal": 120, "proteins_g": 4.0, "carbs_g": 22.0, '
            '"fats_g": 1.5, "fiber_g": 2.0, "confidence": "high"}]}'
        )
        result = Parser.ollama_reponse(_ollama_response(raw))

        assert isinstance(result, OutputResponse)
        assert "pain" in result.aliments
        pain = result.aliments["pain"]
        assert isinstance(pain, Food)
        assert pain.quantity_g == 50
        assert pain.calories_kcal == 120
        assert pain.accuracy == 0.9  # "high" confidence

    def test_parses_plain_dict_keyed_by_food_name(self) -> None:
        raw = '{"riz": {"quantity_g": 150, "calories_kcal": 200}}'
        result = Parser.ollama_reponse(_ollama_response(raw))

        assert isinstance(result, OutputResponse)
        assert result.aliments["riz"].quantity_g == 150
        assert result.aliments["riz"].calories_kcal == 200

    def test_strips_markdown_code_fences_and_json_label(self) -> None:
        raw = '```json\n{"foods": [{"name_fr": "riz", "quantity_g": 150}]}\n```'
        result = Parser.ollama_reponse(_ollama_response(raw))

        assert isinstance(result, OutputResponse)
        assert result.aliments["riz"].quantity_g == 150

    def test_uses_explicit_accuracy_over_confidence(self) -> None:
        raw = '{"foods": [{"name_fr": "pomme", "accuracy": 0.42}]}'
        result = Parser.ollama_reponse(_ollama_response(raw))

        assert result.aliments["pomme"].accuracy == 0.42

    def test_aggregates_duplicate_food_entries(self) -> None:
        raw = (
            '{"foods": ['
            '{"name_fr": "pain", "quantity_g": 30, "calories_kcal": 80},'
            '{"name_fr": "pain", "quantity_g": 20, "calories_kcal": 40}'
            "]}"
        )
        result = Parser.ollama_reponse(_ollama_response(raw))

        pain = result.aliments["pain"]
        assert pain.quantity_g == 50
        assert pain.calories_kcal == 120

    def test_recovers_entries_from_truncated_json_tail(self) -> None:
        # Trailing object is incomplete; the regex fallback recovers the valid one.
        raw = '{"name_fr": "pain", "quantity_g": 40} {"name_fr": "beurre"'
        result = Parser.ollama_reponse(_ollama_response(raw))

        assert isinstance(result, OutputResponse)
        assert "pain" in result.aliments


class TestOllamaResponseFailure:
    def test_returns_empty_dict_on_invalid_content(self) -> None:
        result = Parser.ollama_reponse(_ollama_response("not valid json at all"))
        assert result == {}

    def test_returns_empty_dict_on_empty_content(self) -> None:
        result = Parser.ollama_reponse(_ollama_response(""))
        assert result == {}

    def test_failure_logs_error(self, capsys) -> None:
        Parser.ollama_reponse(_ollama_response(""))
        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out


class TestMistralResponseSuccess:
    def test_parses_full_dish_payload(self) -> None:
        raw = (
            '{"dish_name": "Tartine beurrée", "kcal": 250, "carbs_g": 30, '
            '"fats_g": 12, "fiber_g": 2.5, "proteins_g": 8}'
        )
        result = Parser.mistral_reponse(_mistral_response(raw))

        assert isinstance(result, DishCalculateOutput)
        assert result.dish_name == "Tartine beurrée"
        assert result.kcal == 250
        assert result.carbs_g == 30
        assert result.fats_g == 12
        assert result.fiber_g == 2.5
        assert result.proteins_g == 8

    def test_strips_markdown_fences_before_parsing(self) -> None:
        raw = '```json\n{"dish_name": "Salade", "kcal": 90}\n```'
        result = Parser.mistral_reponse(_mistral_response(raw))

        assert isinstance(result, DishCalculateOutput)
        assert result.dish_name == "Salade"
        assert result.kcal == 90

    def test_missing_numeric_keys_default_to_zero(self) -> None:
        raw = '{"dish_name": "Pain"}'
        result = Parser.mistral_reponse(_mistral_response(raw))

        assert isinstance(result, DishCalculateOutput)
        assert result.dish_name == "Pain"
        assert result.kcal == 0
        assert result.carbs_g == 0
        assert result.fats_g == 0
        assert result.fiber_g == 0
        assert result.proteins_g == 0


class TestMistralResponseFailure:
    def test_returns_empty_dict_on_empty_content(self) -> None:
        result = Parser.mistral_reponse(_mistral_response(""))
        assert result == {}

    def test_returns_empty_dict_on_invalid_json(self) -> None:
        result = Parser.mistral_reponse(_mistral_response("garbage {"))
        assert result == {}

    def test_failure_logs_error(self, capsys) -> None:
        Parser.mistral_reponse(_mistral_response("garbage {"))
        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out


class TestMistralVisionResponseSuccess:
    def test_parses_foods_list_into_output_response(self) -> None:
        raw = (
            '{"foods": [{"name_fr": "pain", "quantity_g": 50, '
            '"confidence": "high"}]}'
        )
        result = Parser.mistral_vision_reponse(_mistral_response(raw))

        assert isinstance(result, OutputResponse)
        pain = result.aliments["pain"]
        assert isinstance(pain, ScannedFood)
        assert pain.quantity_g == 50
        assert pain.accuracy == 0.9  # "high" confidence

    def test_strips_markdown_fences_before_parsing(self) -> None:
        raw = '```json\n{"foods": [{"name_fr": "riz", "quantity_g": 150}]}\n```'
        result = Parser.mistral_vision_reponse(_mistral_response(raw))

        assert isinstance(result, OutputResponse)
        assert result.aliments["riz"].quantity_g == 150

    def test_aggregates_duplicate_food_entries(self) -> None:
        raw = (
            '{"foods": ['
            '{"name_fr": "pain", "quantity_g": 30},'
            '{"name_fr": "pain", "quantity_g": 20}'
            "]}"
        )
        result = Parser.mistral_vision_reponse(_mistral_response(raw))

        assert result.aliments["pain"].quantity_g == 50


class TestMistralVisionResponseFailure:
    def test_returns_empty_dict_on_invalid_content(self) -> None:
        result = Parser.mistral_vision_reponse(_mistral_response("not json"))
        assert result == {}

    def test_returns_empty_dict_on_empty_content(self) -> None:
        result = Parser.mistral_vision_reponse(_mistral_response(""))
        assert result == {}

    def test_failure_logs_error(self, capsys) -> None:
        Parser.mistral_vision_reponse(_mistral_response(""))
        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out
