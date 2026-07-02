#Libs
from typing import Union
from mistralai import Mistral
from dotenv import load_dotenv
import os

#Modules
from data_schemas import DishCalculateInput, DishCalculateOutput
from data_parser import Parser
from color_enum import ColorEnum
from logs_service import LogService

load_dotenv('.env')

class MistralService():
    _client = Mistral(api_key=(os.getenv('MISTRAL_API_KEY') or '').strip())
    
    @classmethod
    def generate(cls, data : DishCalculateInput) -> Union[DishCalculateOutput, dict]:
        try:
            response = cls._client.chat.complete(
            model="mistral-large-latest",
            messages=[
                {
                    'role' : 'user',
                    'content' : f"""
                        You are a professional nutritionist and nutrition data aggregator.
                        You will receive a JSON object containing a list of foods and their quantities in grams.
                        Your task is to analyze the given ingredients and return the most likely final dish with its total nutritional values.
                        
                        Rules : 
                        - Interpret the ingredients as a single coherent dish.
                        - Infer the most likely dish name based on the combination.
                        - Calculate total nutritional values based on standard nutrition knowledge.
                        - Do NOT ask questions.
                        - Do NOT return explanations.
                        - Do NOT return intermediate steps.
                        - Do NOT include assumptions or reasoning.
                        - If uncertain, still return the best estimate.
                        - Return the dish name in french
                        
                        Input format:
                        
                        {data}
                    """
                    +
                    """
                        Expected format:
                        
                        {
                            "dish_name': <string>,
                            "kcal": <int>,
                            "carbs_g": <int>,
                            "fats_g": <int>,
                            "fiber_g": <float>,
                            "proteins_g": <int>
                        }

                        Your entire response must be valid JSON and nothing else.
                        """,
                    }
            ],
            temperature=0.4,
        )

            output_data = Parser.mistral_reponse(response)

            if not output_data:
                print(f"{ColorEnum.WARNING.format('[Warning]')} : Mistral has failed")
            else:
                print(f"{ColorEnum.INFO.format('[INFO]')} : Mistral has finished")

            return output_data
        except Exception as e:
            LogService.send_log(e)
            return DishCalculateOutput(
                dish_name="Plat estimé",
                kcal=500,
                carbs_g=50,
                fats_g=20,
                fiber_g=5.0,
                proteins_g=25,
            )
    