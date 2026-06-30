#Libs
from typing import Union
from mistralai import Mistral
from dotenv import load_dotenv
import os

#Modules
from data_schemas import CoachMessageInput, CoachMessageOutput
from data_parser import Parser
from color_enum import ColorEnum
from logs_service import LogService

load_dotenv('.env')

class MistralCoachService():
    _client = Mistral(api_key=(os.getenv('MISTRAL_API_KEY') or '').strip())
    _model = os.getenv('MISTRAL_COACH_MODEL', 'mistral-large-latest')

    @classmethod
    def generate(cls, data : CoachMessageInput) -> Union[CoachMessageOutput, dict]:
        try:
            print(f"\n{ColorEnum.INFO.format('[INFO]')} : Mistral Coach is thinking ...")

            response = cls._client.chat.complete(
                model=cls._model,
                messages=[
                    {
                        'role' : 'user',
                        'content' : f"""
                            Tu es un coach sportif et nutritionnel bienveillant, motivant et concret.
                            À partir du bilan de la semaine de l'utilisateur ci-dessous, rédige UN message
                            de coach personnalisé, en français, qui :
                            - s'adresse directement à l'utilisateur (tutoiement) ;
                            - tient compte de son objectif ;
                            - félicite les efforts réels et encourage de façon positive ;
                            - donne UN conseil concret et actionnable pour la semaine à venir ;
                            - reste bienveillant, jamais culpabilisant.

                            Contraintes de format :
                            - 2 à 4 phrases maximum.
                            - Pas de liste, pas de markdown, pas de titre.
                            - Réponds UNIQUEMENT avec le texte du message, rien d'autre.

                            Bilan de la semaine :
                            - Prénom : {data.first_name or "l'athlète"}
                            - Objectif : {data.goal}
                            - Poids actuel : {data.current_weight_kg} kg
                            - Poids cible : {data.target_weight_kg} kg
                            - Heures de sport cette semaine : {data.sport_hours_this_week} h
                            - Moyenne hebdomadaire habituelle : {data.weekly_average_hours} h
                            - Nombre de séances cette semaine : {data.sessions_count}
                            - Repas enregistrés cette semaine : {data.meals_logged}
                            - Moyenne de calories par jour : {data.avg_daily_calories} kcal
                        """,
                    }
                ],
                temperature=0.7,
            )

            output_data = Parser.mistral_coach_reponse(response)

            if not output_data:
                print(f"{ColorEnum.WARNING.format('[Warning]')} : Mistral Coach has failed")
            else:
                print(f"{ColorEnum.INFO.format('[INFO]')} : Mistral Coach has finished")

            return output_data
        except Exception as e:
            LogService.send_log(e)
            return {}
