import { useEffect, useMemo, useState } from 'react';

import { recommendationService } from '@/services/recommendationService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { CaloriesOutput, RecommendedMeal } from '@/types/nutrition.type';
import { buildCaloriesInput, nextMealType } from '@/utils/nutrition';

/**
 * Plan nutritionnel du jour : objectif calorique (selon le programme + poids cible)
 * et repas recommandés pour le prochain repas, en excluant les allergènes de l'utilisateur.
 * `profile` = nom du goal courant (null si aucun programme).
 */
export function useNutritionPlan(profile: string | null) {
  const { user } = useAuthStore();
  const [calories, setCalories] = useState<CaloriesOutput | null>(null);
  const [meals, setMeals] = useState<RecommendedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mealType = useMemo(() => nextMealType(), []);

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Allergènes de l'utilisateur (le endpoint /me ne charge pas les relations).
        const withRel = await userService.getWithRelations(user.id);
        const allergens = (withRel?.allergies ?? [])
          .map((a) => a.name)
          .filter((n): n is string => !!n);

        const calInput = buildCaloriesInput(user, profile);
        const [cal, mealsRes] = await Promise.all([
          calInput ? recommendationService.calories(calInput) : Promise.resolve(null),
          recommendationService.meals({
            profile,
            allergens_to_exclude: allergens,
            meal_type: mealType,
          }),
        ]);
        if (!active) return;
        setCalories(cal);
        setMeals(mealsRes.meals);
      } catch {
        if (active) setError('Impossible de charger le plan nutritionnel.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile, mealType]);

  return { calories, meals, mealType, loading, error };
}
