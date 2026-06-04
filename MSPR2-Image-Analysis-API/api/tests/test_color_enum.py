"""Unit tests for color_enum.ColorEnum."""

import pytest
from colorama import Fore

from color_enum import ColorEnum


class TestColorEnumValues:
    def test_all_members_exist_with_expected_values(self) -> None:
        assert ColorEnum.INFO.value == "Info"
        assert ColorEnum.ERROR.value == "Error"
        assert ColorEnum.WARNING.value == "Warning"
        assert ColorEnum.CHECK_MARK.value == "CheckMark"
        assert ColorEnum.MODEL.value == "Model"
        assert ColorEnum.TIME.value == "Time"

    def test_member_count(self) -> None:
        assert len(list(ColorEnum)) == 6


class TestColorEnumFormat:
    @pytest.mark.parametrize(
        ("member", "color"),
        [
            (ColorEnum.INFO, Fore.CYAN),
            (ColorEnum.ERROR, Fore.RED),
            (ColorEnum.WARNING, Fore.YELLOW),
            (ColorEnum.CHECK_MARK, Fore.GREEN),
            (ColorEnum.MODEL, Fore.YELLOW),
            (ColorEnum.TIME, Fore.BLUE),
        ],
    )
    def test_format_wraps_value_with_color_and_reset(
        self, member: ColorEnum, color: str
    ) -> None:
        result = member.format("hello")
        assert result == f"{color}hello{Fore.RESET}"

    def test_format_starts_with_color_and_ends_with_reset(self) -> None:
        result = ColorEnum.INFO.format("[INFO]")
        assert result.startswith(Fore.CYAN)
        assert result.endswith(Fore.RESET)
        assert "[INFO]" in result

    def test_format_preserves_empty_string_payload(self) -> None:
        result = ColorEnum.ERROR.format("")
        assert result == f"{Fore.RED}{Fore.RESET}"
