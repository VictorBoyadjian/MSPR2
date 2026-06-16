import { useState } from 'react';

import { ApiError, MealType } from '@/services/api';
import { calculDishService } from '@/services/calculDishService';
import { dishService } from '@/services/dishService';
import { useAuthStore } from '@/stores/authStore';
import { CalculateDishResponse } from '@/types/calculate-dish-response';
import { splittedDish } from '@/types/splittedDish';

/** Un aliment saisi dans le formulaire (valeurs en texte, validées à l'envoi). */
export type FoodItem = {
  id: string;
  name: string;
  quantity_g: string;
};

/** Étapes de l'écran : saisie → analyse → récapitulatif. */
export type MealFormPhase = 'form' | 'loading' | 'result';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

const emptyFood = (): FoodItem => ({ id: nextId(), name: '', quantity_g: '' });

/** Convertit une saisie ("12,5") en nombre sûr (0 si vide / invalide). */
const num = (v: string) => (v ? Number(v.replace(',', '.')) || 0 : 0);

/** Hydrate la liste d'aliments depuis le paramètre `aliments` (issu du scan). */
function parseAliments(raw?: string): FoodItem[] {
  if (!raw) return [emptyFood()];
  try {
    const aliments = (JSON.parse(raw) as splittedDish['aliments']) ?? {};
    const items = Object.entries(aliments).map(([name, food]) => ({
      id: nextId(),
      name,
      quantity_g: food.quantity_g != null ? String(food.quantity_g) : '',
    }));
    return items.length ? items : [emptyFood()];
  } catch {
    return [emptyFood()];
  }
}

type Options = {
  /** JSON d'aliments pré-remplis (provenant du scan de repas). */
  aliments?: string;
};

/**
 * Centralise l'état et la logique du formulaire d'ajout de repas :
 * liste d'aliments, type, date, validation, appel d'analyse + création.
 */
export function useAddMealForm({ aliments }: Options = {}) {
  const authStore = useAuthStore();

  const [foods, setFoods] = useState<FoodItem[]>(() => parseAliments(aliments));
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [eatedAt, setEatedAt] = useState(() => new Date());
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<MealFormPhase>('form');
  const [analyzed, setAnalyzed] = useState<CalculateDishResponse | null>(null);
  /** Dernier aliment ajouté : permet de lui donner le focus automatiquement. */
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const updateFood = (id: string, key: keyof FoodItem, value: string) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  const removeFood = (id: string) =>
    setFoods((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));

  const addFood = () => {
    const food = emptyFood();
    setFoods((prev) => [...prev, food]);
    setFocusedId(food.id);
  };

  /** Nombre d'aliments réellement nommés (sert au CTA et à la validation). */
  const namedCount = foods.filter((f) => f.name.trim()).length;
  const canSubmit = namedCount > 0;

  const submit = async () => {
    const named = foods.filter((f) => f.name.trim());
    if (named.length === 0) {
      setError('Ajoutez au moins un aliment avec un nom.');
      return;
    }
    setError('');
    setPhase('loading');

    try {
      const input: splittedDish = {
        aliments: named.reduce<splittedDish['aliments']>((acc, f) => {
          acc[f.name.trim()] = { quantity_g: num(f.quantity_g) };
          return acc;
        }, {}),
      };

      const result = await calculDishService.calculate(input);

      await dishService.create({
        name: result.dish_name,
        meal_type: mealType,
        calories_kcal: Math.round(result.kcal),
        proteins_g: Math.round(result.proteins_g),
        carbs_g: Math.round(result.carbs_g),
        fats_g: Math.round(result.fats_g),
        eated_at: eatedAt.toISOString(),
        user_id: authStore.user?.id || '',
      });

      setAnalyzed(result);
      setPhase('result');
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : 'Une erreur est survenue.');
      setPhase('form');
    }
  };

  return {
    foods,
    mealType,
    eatedAt,
    error,
    phase,
    analyzed,
    focusedId,
    namedCount,
    canSubmit,
    setMealType,
    setEatedAt,
    updateFood,
    removeFood,
    addFood,
    submit,
  };
}
