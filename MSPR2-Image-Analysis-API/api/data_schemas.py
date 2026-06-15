#Libs
from pydantic import BaseModel

class UploadDish(BaseModel):
    base64_image : str = ""
    
class Food(BaseModel):
    quantity : int = 1
    quantity_g : int = 20
    calories_kcal : int = 500
    proteins_g : float = 10.0
    carbs_g : float = 12.0
    fats_g : float = 2.0
    fiber_g : float = 5.6
    accuracy: float = 0.85
    
class OutputResponse(BaseModel):
    aliments : dict[str, Food] = {
        "bread" : Food()
    }
    
class DishCalculateInput(BaseModel):
    aliments : dict[str, dict[str, int]]
    
class DishCalculateOutput(BaseModel):
    dish_name : str
    kcal : int
    carbs_g : int
    fats_g : int
    fiber_g : float
    proteins_g : int