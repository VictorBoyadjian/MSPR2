import { CONFIG } from '@/constants/config';
import { getToken } from '@/services/api';
import { CalculateDishResponse } from '@/types/calculate-dish-response';
import { analyzedDish, splittedDish } from '@/types/splittedDish';

export const calculDishService = {

  calculate: async (input: splittedDish): Promise<CalculateDishResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour analyser un plat");
    }

    const response = await fetch(`${CONFIG.IMAGE_API_URL}/dish-calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
        console.log('réponse erreir: ')
        console.log(response)
      throw new Error(
        `Erreur lors de l'analyse de l'image (${response.status})`,
      );
    }
    const castResponse = (await response.json()) as CalculateDishResponse;
    
    

    if (!castResponse.dish_name || !castResponse.kcal) {
      throw new Error("Réponse invalide lors du calcul nutritionnel");
    }

    return castResponse;
  },
  
};
