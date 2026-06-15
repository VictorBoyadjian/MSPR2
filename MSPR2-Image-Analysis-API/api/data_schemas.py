#Libs
from typing import Optional
from pydantic import BaseModel

class UploadDish(BaseModel):
    base64_image : str = ""

class Usage(BaseModel):
    prompt_tokens : int = 0
    completion_tokens : int = 0
    total_tokens : int = 0

class CalculFood(BaseModel):
    quantity_g : int = 100

class CalculDish(BaseModel):
    aliments : dict[str, CalculFood] = {
        "bread" : CalculFood()
    }

class Food(BaseModel):
    quantity : int = 1
    quantity_g : int = 20
    calories_kcal : int = 500
    proteins_g : float = 10.0
    carbs_g : float = 12.0
    fats_g : float = 2.0
    fiber_g : float = 5.6
    accuracy: float = 0.85
    

class ScannedFood(BaseModel):
    quantity : int = 1
    quantity_g : int = 20
    accuracy: float = 0.85

class OutputResponse(BaseModel):
    aliments : dict[str, ScannedFood] = {
        "bread" : ScannedFood()
    }
    usage : Optional[Usage] = None
    
class DishCalculateInput(BaseModel):
    aliments : dict[str, dict[str, int]] = {
        'pizza' : {
            'quantity_g' : 450
        }
    }
    
class DishCalculateOutput(BaseModel):
    dish_name : str = "Pizza"
    kcal : int = 400
    carbs_g : int = 20
    fats_g : int = 30
    fiber_g : float = 10.0
    proteins_g : int = 60