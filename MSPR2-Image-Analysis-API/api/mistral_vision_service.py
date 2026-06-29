#Libs
from typing import Union
from mistralai import Mistral
from dotenv import load_dotenv
import os

#Modules
from data_schemas import UploadDish, OutputResponse, Usage
from data_parser import Parser
from color_enum import ColorEnum
from logs_service import LogService

load_dotenv('.env')

class MistralVisionService():
    _client = Mistral(api_key=os.getenv('MISTRAL_API_KEY'))
    _model = os.getenv('MISTRAL_VISION_MODEL', 'mistral-small-2506')

    _PROMPT = """
        Look carefully at this specific meal photo and identify ONLY the foods you actually see in the image.

        Rules:
        - List ONLY foods you can actually see in this photo.
        - Do NOT use placeholder or example foods.
        - Estimate quantity from the visual portion size.
        - quantity_g = estimated total weight in grams (integer).
        - confidence = "high" if clearly visible, "medium" if partially visible, "low" if uncertain.
        - Respond with ONLY a valid JSON object. No text, no markdown, no explanation before or after.

        Use exactly this schema:
        {
        "foods": [
            {
            "name_fr": "<french name of food you see>",
            "quantity_g": <integer>,
            "confidence": "<high|medium|low>"
            }
        ]
        }"""

    @classmethod
    def generate(cls, data: UploadDish) -> Union[OutputResponse, dict]:
        try:
            print(f"\n{ColorEnum.INFO.format('[INFO]')} : Mistral Vision is thinking ...")

            image = data.base64_image.strip()
            if not image.startswith(("data:image/", "http://", "https://")):
                image = f"data:image/jpeg;base64,{image}"

            try:
                response = cls._client.chat.complete(
                    model=cls._model,
                    messages=[
                        {
                            'role': 'user',
                            'content': [
                                {
                                    'type': 'text',
                                    'text': cls._PROMPT
                                },
                                {
                                    'type': 'image_url',
                                    'image_url': image
                                }
                            ]
                        }
                    ],
                    temperature=0.4,
                )
            except Exception as e:
                print(f"{ColorEnum.ERROR.format('[ERROR]')} : Mistral Vision request failed : {e}")
                LogService.send_log(e)
                return {}

            output_data = Parser.mistral_vision_reponse(response)

            if not output_data:
                print(f"{ColorEnum.WARNING.format('[Warning]')} : Mistral Vision has failed")
            else:
                output_data.usage = cls._extract_usage(response)
                print(
                    f"{ColorEnum.INFO.format('[INFO]')} : Mistral Vision has finished "
                    f"({output_data.usage.total_tokens} tokens)"
                )

            return output_data
        except Exception as e:
            LogService.send_log(e)
            return {}

    @staticmethod
    def _extract_usage(response) -> Usage:
        try:
            usage = getattr(response, "usage", None)
            if usage is None:
                return Usage()
            return Usage(
                prompt_tokens=getattr(usage, "prompt_tokens", 0) or 0,
                completion_tokens=getattr(usage, "completion_tokens", 0) or 0,
                total_tokens=getattr(usage, "total_tokens", 0) or 0,
            )
        except Exception as e:
            LogService.send_log(e)
            return Usage()
