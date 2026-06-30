// Service du « message du coach » IA. La génération passe par l'API Python
// (CONFIG.IMAGE_API_URL, même bearer que l'API métier, cf. calculDishService) ;
// la lecture/écriture du message du jour passe par l'API Laravel (stocké dans la
// métrique du jour). L'app génère et enregistre en arrière-plan, puis affiche.
import { CONFIG } from '@/constants/config';
import { getToken, sendRequest } from '@/services/api';
import { CoachMessageInput, CoachMessageOutput, CoachMessageStatus } from '@/types/coach.type';

export const coachService = {
  /** Message du jour + dernier message disponible (repli), pour décider quoi afficher/générer. */
  getStatus: async (): Promise<CoachMessageStatus> => {
    const res = await sendRequest<{ data: CoachMessageStatus }>('GET', '/me/coach-message');
    return res.data;
  },

  /** Enregistre le message du coach du jour dans la métrique du jour (upsert). */
  save: async (message: string): Promise<void> => {
    await sendRequest('PUT', '/me/coach-message', { coach_message: message });
  },

  /** Génère le message du coach via Mistral à partir du bilan de la semaine. */
  generate: async (input: CoachMessageInput): Promise<string> => {
    const token = getToken();
    if (!token) {
      throw new Error('Vous devez être connecté pour générer le message du coach');
    }

    const response = await fetch(`${CONFIG.IMAGE_API_URL}/coach-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la génération du message du coach (${response.status})`);
    }

    const data = (await response.json()) as CoachMessageOutput;
    const message = data.message?.trim();
    if (!message) {
      throw new Error('Réponse vide du coach');
    }
    return message;
  },
};
