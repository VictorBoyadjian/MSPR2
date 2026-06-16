// Helpers nutrition : construction de l'input calorique, type de repas du moment.
import { MealType } from '@/services/api';
import { CaloriesInput } from '@/types/nutrition.type';
import { User } from '@/types/users.type';
import { clamp } from '@/utils/recommendation';

/** L'API renvoie souvent les numériques en chaîne : on normalise. */
export const toNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : NaN;
};

/** Type de repas attendu selon l'heure (prochain repas de la journée). */
export function nextMealType(now: Date = new Date()): MealType {
  const h = now.getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 19) return 'dinner';
  return 'snack';
}

/**
 * Construit l'entrée /nutrition/calories depuis l'utilisateur + le profil choisi.
 * Retourne null si les données indispensables manquent (poids cible, programme).
 * Valeurs bornées aux plages ML ; 'other'/null → 'male'.
 */
export function buildCaloriesInput(user: User, profile: string | null): CaloriesInput | null {
  const targetWeight = toNumber(user.target_weight);
  if (!profile || !Number.isFinite(targetWeight)) return null;

  return {
    age: clamp(Math.round(toNumber(user.age) || 30), 18, 65),
    gender: user.gender === 'female' ? 'female' : 'male',
    weight_kg: clamp(toNumber(user.weight_kg) || 70, 30.1, 199.9),
    height_cm: clamp(toNumber(user.height_cm) || 175, 140.1, 214.9),
    target_weight_kg: clamp(targetWeight, 30.1, 199.9),
    weeks_to_goal: clamp(Math.round(toNumber(user.weeks_to_goal) || 12), 1, 104),
    profile,
  };
}
