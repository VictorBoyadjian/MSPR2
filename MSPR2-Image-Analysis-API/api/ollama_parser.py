from typing import Union
from ollama import ChatResponse
import json

from ollama_schemas import OutputResponse
from color_enum import ColorEnum

class Parser():
    @staticmethod
    def parse(response : ChatResponse) -> Union[OutputResponse, dict]:
        try:            
            return OutputResponse(
                aliments=json.loads(
                    str(response.message.content).replace('`', '').replace('json', '')
                )
            )
        except Exception as e:
            print(response.message.content)
            print(f"{ColorEnum.ERROR.format('[ERROR]')}: An error occurred while parsing the model response : {e}")
            return {}