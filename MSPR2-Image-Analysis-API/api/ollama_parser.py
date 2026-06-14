from typing import Union
from ollama import ChatResponse
import json
import re

from ollama_schemas import OutputResponse, Food
from color_enum import ColorEnum

class Parser():
    _CONFIDENCE_MAP = {"high": 0.9, "medium": 0.6, "low": 0.3}

    @staticmethod
    def _clean(content: str) -> str:
        # llava sometimes escapes underscores ("name\_fr"), which is invalid
        # JSON. Food data never contains real backslashes, so strip them all.
        return (
            str(content)
            .replace('`', '')
            .replace('json', '')
            .replace('\\', '')
            .strip()
        )

    @staticmethod
    def _to_float(value, default: float = 0.0) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _to_int(value, default: int = 0) -> int:
        try:
            return int(round(float(value)))
        except (TypeError, ValueError):
            return default

    @classmethod
    def _accuracy(cls, entry: dict) -> float:
        if "accuracy" in entry:
            return cls._to_float(entry.get("accuracy"), 0.85)
        confidence = str(entry.get("confidence", "")).lower()
        return cls._CONFIDENCE_MAP.get(confidence, 0.6)

    @classmethod
    def _extract_entries(cls, content: str) -> list:
        """Return a list of food objects, tolerating a truncated JSON tail."""
        content = cls._clean(content)

        # Try a clean parse first.
        try:
            data = json.loads(content)
            if isinstance(data, dict) and isinstance(data.get("foods"), list):
                return data["foods"]
            if isinstance(data, list):
                return data
            if isinstance(data, dict):
                # Old format: {name: {fields}}
                return [{"name_fr": k, **v} for k, v in data.items() if isinstance(v, dict)]
        except json.JSONDecodeError:
            pass

        # Fallback: the response is malformed/truncated. Food objects are flat
        # (no nested braces), so grab every complete `{...}` block.
        entries = []
        for match in re.findall(r'\{[^{}]*\}', content):
            try:
                obj = json.loads(match)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict) and any(k in obj for k in ( "name_fr", "name")):
                entries.append(obj)
        return entries

    @classmethod
    def parse(cls, response: ChatResponse) -> Union[OutputResponse, dict]:
        try:
            entries = cls._extract_entries(response.message.content)
            if not entries:
                raise ValueError("no food entries found in model response")

            aliments: dict[str, Food] = {}
            for entry in entries:
                name = entry.get("name_fr") or entry.get("name")
                if not name:
                    continue

                food = Food(
                    quantity_g=cls._to_int(entry.get("quantity_g"), 20),
                    calories_kcal=cls._to_int(entry.get("calories_kcal"), 0),
                    proteins_g=cls._to_float(entry.get("proteins_g")),
                    carbs_g=cls._to_float(entry.get("carbs_g")),
                    fats_g=cls._to_float(entry.get("fats_g")),
                    fiber_g=cls._to_float(entry.get("fiber_g")),
                    accuracy=cls._accuracy(entry),
                )

                if name in aliments:
                    # Aggregate duplicates instead of overwriting.
                    existing = aliments[name]
                    existing.quantity_g += food.quantity_g
                    existing.calories_kcal += food.calories_kcal
                    existing.proteins_g += food.proteins_g
                    existing.carbs_g += food.carbs_g
                    existing.fats_g += food.fats_g
                    existing.fiber_g += food.fiber_g
                    existing.accuracy = max(existing.accuracy, food.accuracy)
                else:
                    aliments[name] = food

            return OutputResponse(aliments=aliments)
        except Exception as e:
            print(response.message.content)
            print(f"{ColorEnum.ERROR.format('[ERROR]')}: An error occurred while parsing the model response : {e}")
            return {}
