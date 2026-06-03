from ollama import Client
import os
from typing import Union
import ast
from dotenv import load_dotenv

from ollama_schemas import UploadDish, OutputResponse
from color_enum import ColorEnum
from message_renderer import MessageRenderer
from ollama_parser import Parser

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
            print(f"{ColorEnum.INFO.format('[INFO]')} : {cls._selected_model} is thinking ...")
            
            response = cls._client.chat( 
                model=cls._selected_model,
                messages=[
                    {
                        'role' : 'user',
                        'content' : """
                            You are a professional nutritionist. Look carefully at this specific meal photo and identify ONLY what you actually see in the image.

                            Return a JSON object based solely on what you described.
                            
                            Rules:
                                - Return ONLY a valid JSON object.
                                - Do NOT return explanations.
                                - Do NOT return descriptions.
                                - Do NOT return markdown.
                                - Do NOT return code blocks.
                                - Do NOT write "Step 1", "Step 2" or any text outside the JSON.
                                - Do NOT guess foods that are not clearly visible.
                                - If uncertain, use a lower accuracy score.
                                - Accuracy must be a float between 0 and 1.
                                - Quantity must be an integer estimate.

                                Expected format:

                                {
                                    "<food_name>": {
                                        "quantity": <integer>,
                                        "kcal" : <float>
                                        "accuracy": <float>
                                    }
                                }

                                Your entire response must be valid JSON and nothing else.
                            """,
                        'image' : data.base64_image
                    }
                ],
                options={
                    "temperature": 0.4,
                    "num_predict" : 800
                }
            )

            output_data = Parser.parse(response)
        
        if not output_data:
            print(f"{ColorEnum.WARNING.format('[Warning]')} : {cls._selected_model} has failed")
        else:
            print(f"{ColorEnum.INFO.format('[INFO]')} : {cls._selected_model} has finished")
        
        return output_data