"""Unit tests for ollama_parser.Parser."""

from ollama import ChatResponse, Message

from ollama_parser import Parser
from ollama_schemas import Food, OutputResponse


def _response(content: str) -> ChatResponse:
    return ChatResponse(message=Message(role="assistant", content=content))


class TestParseSuccess:
    def test_parses_clean_json_into_output_response(self) -> None:
        result = Parser.parse(_response('{"bread": {"quantity": 2, "calories_kcal": 120}}'))
        assert isinstance(result, OutputResponse)
        assert "bread" in result.aliments
        assert isinstance(result.aliments["bread"], Food)
        assert result.aliments["bread"].quantity == 2
        assert result.aliments["bread"].calories_kcal == 120

    def test_strips_markdown_code_fences_and_json_label(self) -> None:
        raw = '```json\n{"rice": {"quantity_g": 150}}\n```'
        result = Parser.parse(_response(raw))
        assert isinstance(result, OutputResponse)
        assert result.aliments["rice"].quantity_g == 150

    def test_strips_stray_backslashes(self) -> None:
        raw = '{\\"apple\\": {\\"quantity\\": 1}}'
        result = Parser.parse(_response(raw))
        assert isinstance(result, OutputResponse)
        assert "apple" in result.aliments


class TestParseFailure:
    def test_returns_empty_dict_on_invalid_json(self) -> None:
        result = Parser.parse(_response("not valid json at all"))
        assert result == {}

    def test_returns_empty_dict_on_empty_content(self) -> None:
        result = Parser.parse(_response(""))
        assert result == {}

    def test_failure_logs_error(self, capsys) -> None:
        Parser.parse(_response("garbage {"))
        captured = capsys.readouterr()
        assert "[ERROR]" in captured.out
