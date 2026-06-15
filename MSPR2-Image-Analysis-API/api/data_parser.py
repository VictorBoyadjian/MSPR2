from typing import Union
from ollama import ChatResponse
import json
from mistralai import ChatCompletionResponse

from data_schemas import OutputResponse, DishCalculateOutput
from color_enum import ColorEnum

class Parser():
    _mistral_dict_keys = [
        'dish_name',
        'kcal',
        'carbs_g',
        'fats_g',
        'fiber_g',
        'proteins_g',
    ]
    
    @staticmethod
    def ollama_reponse(response : ChatResponse) -> Union[OutputResponse, dict]:
        try:            
            return OutputResponse(
                aliments=json.loads(
                    str(response.message.content)
                        .replace('`', '')
                        .replace('json', '')
                        .replace('\\', '')
                        .replace('/', '')
                )
            )
        except Exception as e:
            print(f"{ColorEnum.ERROR.format('[ERROR]')}: An error occurred while parsing the model response : {e}")
            return {}
        
    @classmethod
    def mistral_reponse(cls, response : ChatCompletionResponse) -> Union[DishCalculateOutput, dict]:
        try:    
            content = response.choices[0].message.content
            
            if(content):  
                json_content = json.loads(
                    content
                    .replace('`', '')
                    .replace('json', '')
                    .replace('\\', '')
                    .replace('/', '')
                )
                           
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
            return {}