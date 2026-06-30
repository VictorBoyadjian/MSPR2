#Libs
from fastapi import APIRouter, FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from typing import Union

#Modules
from data_schemas import UploadDish, OutputResponse
from ollama_service import OllamaService
from data_schemas import UploadDish, OutputResponse, DishCalculateInput, DishCalculateOutput, CoachMessageInput, CoachMessageOutput
from ollama_service import OllamaService
from color_enum import ColorEnum
from authorization import Authorization
from mistral_service import MistralService
from mistral_vision_service import MistralVisionService
from mistral_coach_service import MistralCoachService
from logs_service import LogService

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()
bearer_scheme = HTTPBearer()

@router.get('/health/')
async def health(request : Request):
    try:
        LogService.send_log('/health', 'request', request.client.host)
        return 'ok'
    except Exception as e:
        LogService.send_log(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post('/analyze', response_model=Union[OutputResponse, dict])
async def upload_dish(data : UploadDish, request : Request, credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        LogService.send_log('/analyze', 'request', request.client.host)
        if Authorization.verify_token(credentials.credentials):
            return OllamaService.generate(data)
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        LogService.send_log(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post('/analyze-by-mistral', response_model=Union[OutputResponse, dict])
async def upload_dish_mistral(data : UploadDish, request : Request, credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        LogService.send_log('/analyze-by-mistral', 'request', request.client.host)
        if Authorization.verify_token(credentials.credentials):
            return MistralVisionService.generate(data)
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        LogService.send_log(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post('/dish-calculate', response_model=DishCalculateOutput)
async def dish_calculate(data : DishCalculateInput, request : Request, credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        LogService.send_log('/dish-calculate', 'request', request.client.host)
        if Authorization.verify_token(credentials.credentials):
            return MistralService.generate(data)
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        LogService.send_log(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post('/coach-message', response_model=Union[CoachMessageOutput, dict])
async def coach_message(data : CoachMessageInput, request : Request, credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    try:
        LogService.send_log('/coach-message', 'request', request.client.host)
        if Authorization.verify_token(credentials.credentials):
            return MistralCoachService.generate(data)
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        LogService.send_log(e)
        raise HTTPException(status_code=500, detail="Internal server error")

app.include_router(router)

if __name__ == '__main__':
    print("""
 _____ __  __          _____ ______            _   _          _  __     _______ _____  _____            _____ _____ 
 |_   _|  \/  |   /\   / ____|  ____|     /\   | \ | |   /\   | | \ \   / / ____|_   _|/ ____|     /\   |  __ \_   _|
   | | | \  / |  /  \ | |  __| |__       /  \  |  \| |  /  \  | |  \ \_/ / (___   | | | (___      /  \  | |__) || |  
   | | | |\/| | / /\ \| | |_ |  __|     / /\ \ | . ` | / /\ \ | |   \   / \___ \  | |  \___ \    / /\ \ |  ___/ | |  
  _| |_| |  | |/ ____ \ |__| | |____   / ____ \| |\  |/ ____ \| |____| |  ____) |_| |_ ____) |  / ____ \| |    _| |_ 
 |_____|_|  |_/_/    \_\_____|______| /_/    \_\_| \_/_/    \_\______|_| |_____/|_____|_____/  /_/    \_\_|   |_____|
                                                                                                                                         
          """)
    
    try:
        models_list = OllamaService.models
        pull_models = []
        
        for model in models_list:
            if not OllamaService.check_model_availability(model=model):
                pull_models.append(model)
                
        if pull_models:
            models_len = len(pull_models)
            print(f"{ColorEnum.INFO.format('[INFO]')} : pulling {models_len} {'model' if models_len <= 1 else 'models'} : " + ColorEnum.MODEL.format(', '.join(pull_models)))
        
            pulled_models = OllamaService.pull_models(all_models=True)
        
            if(len(pulled_models) == models_len):
                print(f"\n{ColorEnum.INFO.format('[INFO]')} : All models are pulled {models_len}/{models_len} " + ColorEnum.CHECK_MARK.format('✔') * models_len + "\n")
            else:
                not_pulled_models = []
                
                for model in pull_models:
                    if model not in pulled_models:
                        not_pulled_models.append(model)
                
                print(f"{ColorEnum.ERROR.format('[ERROR]')} : pulled models {abs(models_len - len(not_pulled_models))} / {models_len}. These models were not pulled : " + ColorEnum.MODEL.format(', '.join(not_pulled_models)))
                    
                exit()
        else:
            models_len = len(models_list)
            print(f"\n{ColorEnum.INFO.format('[INFO]')} : All models are pulled {models_len}/{models_len} " + ColorEnum.CHECK_MARK.format('✔') * models_len + "\n")
            
        uvicorn.run('api:app', host='0.0.0.0', port=2021)
    except Exception as e:
        LogService.send_log(e)