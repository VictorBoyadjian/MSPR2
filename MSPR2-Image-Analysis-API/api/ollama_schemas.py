from pydantic import BaseModel

class UploadDish(BaseModel):
    base64_image : str = ""
    
class Food(BaseModel):
    quantity: int = 1
    kcal: float = 150.0
    accuracy: float = 0.85
    
class OutputResponse(BaseModel):
    aliments : dict[str, Food] = {
        "bread" : Food()
    }