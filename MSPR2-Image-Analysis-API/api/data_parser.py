#Libs
from typing import Union
from ollama import ChatResponse
import json
from mistralai import ChatCompletionResponse
import re

#Modules
from data_schemas import OutputResponse, DishCalculateOutput, Food, ScannedFood
from color_enum import ColorEnum
from logs_service import LogService

class Parser():
    _mistral_dict_keys = [
        'dish_name',
        'kcal',
        'carbs_g',
        'fats_g',
        'fiber_g',
        'proteins_g',
    ]
    
    _CONFIDENCE_MAP = {"high": 0.9, "medium": 0.6, "low": 0.3}

    @staticmethod
    def _clean(content: str) -> str:
        try:
            return (
                str(content)
                .replace('`', '')
                .replace('json', '')
                .replace('\\', '')
                .strip()
            )
        except Exception as e:
            LogService.send_log(e)
            return str(content)

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
        try:
            if "accuracy" in entry:
                return cls._to_float(entry.get("accuracy"), 0.85)
            confidence = str(entry.get("confidence", "")).lower()
            return cls._CONFIDENCE_MAP.get(confidence, 0.6)
        except Exception as e:
            LogService.send_log(e)
            return 0.6

    @classmethod
    def _extract_entries(cls, content: str) -> list:
        """Return a list of food objects, tolerating a truncated JSON tail."""
        try:
            content = cls._clean(content)

            try:
                data = json.loads(content)
                if isinstance(data, dict) and isinstance(data.get("foods"), list):
                    return data["foods"]
                if isinstance(data, list):
                    return data
                if isinstance(data, dict):
                    return [{"name_fr": k, **v} for k, v in data.items() if isinstance(v, dict)]
            except json.JSONDecodeError:
                pass

            entries = []
            for match in re.findall(r'\{[^{}]*\}', content):
                try:
                    obj = json.loads(match)
                except json.JSONDecodeError:
                    continue
                if isinstance(obj, dict) and any(k in obj for k in ( "name_fr", "name")):
                    entries.append(obj)
            return entries
        except Exception as e:
            LogService.send_log(e)
            return []

    @classmethod
    def _foods_response(cls, content: str) -> Union[OutputResponse, dict]:
        try:
            entries = cls._extract_entries(content)
            if not entries:
                raise ValueError("no food entries found in model response")

            aliments: dict[str, ScannedFood] = {}
            for entry in entries:
                name = entry.get("name_fr") or entry.get("name")
                if not name:
                    continue

                food = ScannedFood(
                    quantity=cls._to_int(entry.get("quantity"), 1),
                    quantity_g=cls._to_int(entry.get("quantity_g"), 20),
                    accuracy=cls._accuracy(entry),
                )

                if name in aliments:
                    existing = aliments[name]
                    existing.quantity += food.quantity
                    existing.quantity_g += food.quantity_g
                    existing.accuracy = max(existing.accuracy, food.accuracy)
                else:
                    aliments[name] = food

            return OutputResponse(aliments=aliments)
        except Exception as e:
            print(f"{ColorEnum.ERROR.format('[ERROR]')}: An error occurred while parsing the model response : {e}")
            LogService.send_log(e)
            return {}

    @classmethod
    def ollama_reponse(cls, response: ChatResponse) -> Union[OutputResponse, dict]:
        try:
            return cls._foods_response(response.message.content)
        except Exception as e:
            LogService.send_log(e)
            return {}

    @classmethod
    def mistral_vision_reponse(cls, response: ChatCompletionResponse) -> Union[OutputResponse, dict]:
        try:
            content = response.choices[0].message.content
        except Exception as e:
            print(f"{ColorEnum.ERROR.format('[ERROR]')}: An error occurred while parsing the model response : {e}")
            LogService.send_log(e)
            return {}
        return cls._foods_response(content)
        
    @classmethod
    def mistral_reponse(cls, response : ChatCompletionResponse) -> Union[DishCalculateOutput, dict]:
        try:    
            content = response.choices[0].message.content
            
            if(content):  
                json_content = json.loads(cls._clean(content))
                           
                return DishCalculateOutput(
                    dish_name=json_content[cls._mistral_dict_keys[0]] if cls._mistral_dict_keys[0] in json_content.keys() else 0,
                    kcal=json_content[cls._mistral_dict_keys[1]] if cls._mistral_dict_keys[1] in json_content.keys() else 0,
                    carbs_g=json_content[cls._mistral_dict_keys[2]] if cls._mistral_dict_keys[2] in json_content.keys() else 0,
                    fats_g=json_content[cls._mistral_dict_keys[3]] if cls._mistral_dict_keys[3] in json_content.keys() else 0,
                    fiber_g=json_content[cls._mistral_dict_keys[4]] if cls._mistral_dict_keys[4] in json_content.keys() else 0,
                    proteins_g=json_content[cls._mistral_dict_keys[5]] if cls._mistral_dict_keys[5] in json_content.keys() else 0,
                )
                
            return {}
        except Exception as e:
            print(f"{ColorEnum.ERROR.format('[ERROR]')}: An error occurred while parsing the model response : {e}")
            LogService.send_log(e)
            return {}