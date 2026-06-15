#Libs
from ollama import Client
import os
from typing import Union
import ast
from dotenv import load_dotenv

#Modules
from data_schemas import UploadDish, OutputResponse
from color_enum import ColorEnum
from message_renderer import MessageRenderer
from data_parser import Parser

load_dotenv('.env')

class OllamaService:
    models = ast.literal_eval(os.getenv('OLLAMA_MODELS'))
    _selected_model = models[int(os.getenv('OLLAMA_SELECTED_MODEL'))]
    _client : Client = Client(host=os.getenv('OLLAMA_HOST') + ':' + os.getenv('OLLAMA_PORT'))

    @classmethod
    def check_model_availability(cls, model = None) -> bool:    
        return any(m['model'] == (cls._selected_model if model == None else model) for m in cls._client.list().models)
    
    @classmethod
    def pull_models(cls, all_models : bool = False) -> Union[bool, list]: 
        if all_models:
            if cls.models:
                pulled_models = []
                
                for model in cls.models:
                    if cls.check_model_availability(model):
                        continue
                    
                    print("")
                    
                    passed = cls.download_model(model)
                    if passed:
                        pulled_models.append(model)
                    
                return pulled_models
        else:
            if cls._selected_model:
                return cls.download_model(cls._selected_model)
                 
        return False

    @classmethod
    def download_model(cls, model_name : str) -> bool :
        try:
            print(f"{ColorEnum.INFO.format('[INFO]')} : Pulling {ColorEnum.MODEL.format(model_name)} ...")
            stream = cls._client.pull(model_name, stream=True)
            
            MessageRenderer.pulling_message(stream, model_name)
            return True
        except Exception as e:
            print(f"{ColorEnum.ERROR.format('[ERROR]')} : An error occurred while pulling the model : {e}")
            return False
    
    @classmethod       
    def generate(cls, data : UploadDish) -> Union[OutputResponse, dict]:    
        model_pass = True
        output_data = {}

        if not cls.check_model_availability():
            print(f"{ColorEnum.WARNING.format('[WARNING]')} : {cls._selected_model} is not found")
            model_pass = cls.pull_models()

        if model_pass:
            print(f"\n{ColorEnum.INFO.format('[INFO]')} : {cls._selected_model} is thinking ...")
            
            response = cls._client.chat( 
                model=cls._selected_model,
                messages=[
                    {
                        'role' : 'user',
                        'content' : """
                            You are a professional nutritionist. Look carefully at this specific meal photo and identify ONLY the foods you actually see in the image.

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
                                "calories_kcal": <integer>,
                                "proteins_g": <float>,
                                "carbs_g": <float>,
                                "fats_g": <float>,
                                "fiber_g": <float>,
                                "confidence": "<high|medium|low>"
                                }
                            ]
                            }""",
                        'images' : [data.base64_image]
                    }
                ],
                options={
                    "temperature": 0.4,
                    "num_predict" : 800
                }
            )

            output_data = Parser.ollama_reponse(response)
        
        if not output_data:
            print(f"{ColorEnum.WARNING.format('[Warning]')} : {cls._selected_model} has failed")
        else:
            print(f"{ColorEnum.INFO.format('[INFO]')} : {cls._selected_model} has finished")
        
        return output_data