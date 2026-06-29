import requests, os
from dotenv import load_dotenv

load_dotenv('.env')

class LogService:
    API_HOST = os.getenv('LARAVEL_HOST')
    API_PORT = os.getenv('LARAVEL_PORT')
    API_URL = os.getenv('API_LOGS_URL')
    API_KEY = os.getenv('API_LOGS_KEY')
    API_NAME = os.getenv('API_NAME')
    
    @classmethod
    def send_log(cls, data : Exception, type : str = 'error', ip : str = None):
        try:
            if(not data) : return

            requests.post(
                cls.API_HOST + ':' + cls.API_PORT + cls.API_URL,
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + cls.API_KEY
                },
                json={
                    "mutate" : [
                        {
                            "operation" : "create",
                            "attributes" : {
                                "api_name" : cls.API_NAME,
                                "data" : str(data),
                                "type" : type,
                                "ip" : 'null' if ip == None else ip
                            }
                        }
                    ]
                }
            )
        except Exception as e:
            print("[LogService] Can't send log : " + str(e))