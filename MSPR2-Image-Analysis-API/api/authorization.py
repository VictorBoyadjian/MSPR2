import requests, os
from dotenv import load_dotenv
load_dotenv('.env')

class Authorization():    
    @staticmethod
    def verify_token(token : str) -> bool:
        response = requests.get(
            os.getenv('LARAVEL_HOST') + ':' + os.getenv('LARAVEL_PORT') + os.getenv('LARAVEL_ME_URL'),
            headers = {
                "Authorization": "Bearer " + token
            }
        )
        
        if response.status_code == 200:
            return True
        
        return False
        
        