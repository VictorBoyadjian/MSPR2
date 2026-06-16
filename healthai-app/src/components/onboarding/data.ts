// Modèle de données de l'onboarding + helper de conversion vers PATCH /me.
import type { UpdateUserAttributes } from '@/services/userService';
import type { GenderEnum } from '@/types/users.type';
import type { RecommendInput } from '@/types/recommendation.type';
import { clamp, experienceFromSport } from '@/utils/recommendation';

/** Données collectées au fil des étapes de l'onboarding. */
export type OnboardingData = {
  age: number;
  gender: GenderEnum | null;
  height: number; // cm
  weight: number; // kg
  sport: number; // heures / semaine
  bodyFat: number | null; // index dans BODY_FAT_OPTIONS
  beats: number; // battements comptés sur 30 s
  allergies: string[]; // ids des allergies sélectionnées
  handicaps: string[]; // ids des handicaps sélectionnés
  goalId: string | null; // id du goal (programme) choisi
};

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  age: 27,
  gender: null,
  height: 175,
  weight: 70,
  sport: 3,
  bodyFat: null,
  beats: 35,
  allergies: [],
  handicaps: [],
  goalId: null,
};

/** Tranches de masse grasse présentées via les silhouettes (label + % médian envoyé à l'API). */
export const BODY_FAT_OPTIONS = [
  { label: '4–9 %', value: 6.5 },
  { label: '10–14 %', value: 12 },
  { label: '15–19 %', value: 17 },
  { label: '20–24 %', value: 22 },
  { label: '25–29 %', value: 27 },
  { label: '30 %+', value: 32 },
] as const;

/** BPM au repos = battements comptés sur 30 s × 2. */
export const beatsToBpm = (beats: number) => beats * 2;

/** Indice de masse corporelle, arrondi à une décimale. */
export const computeBmi = (weightKg: number, heightCm: number) =>
  +(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);

/** Construit les attributs santé envoyés à PATCH /me à la fin de l'onboarding. */
export function buildOnboardingUpdate(data: OnboardingData): UpdateUserAttributes {
  return {
    age: data.age,
    gender: data.gender ?? undefined,
    height_cm: data.height,
    weight_kg: data.weight,
    sport_per_week: data.sport,
    bodyfat: data.bodyFat != null ? BODY_FAT_OPTIONS[data.bodyFat].value : undefined,
    rest_bpm: beatsToBpm(data.beats),
    goal_id: data.goalId != null ? Number(data.goalId) : undefined,
  };
}

/**
 * Construit l'entrée du moteur de recommandation depuis les données de l'onboarding.
 * Les valeurs sont bornées aux plages acceptées par l'API ML (sinon 422). Le moteur
 * n'accepte que male|female : 'other'/null retombe sur 'male'. Le niveau d'expérience
 * est déduit des heures de sport par semaine.
 */
export function buildRecommendInput(data: OnboardingData): RecommendInput {
  return {
    age: clamp(Math.round(data.age), 18, 65),
    gender: data.gender === 'female' ? 'female' : 'male',
    weight_kg: clamp(data.weight, 30.1, 199.9),
    height_cm: clamp(data.height, 140.1, 214.9),
    body_fat_pct: clamp(data.bodyFat != null ? BODY_FAT_OPTIONS[data.bodyFat].value : 20, 4, 55),
    resting_bpm: clamp(beatsToBpm(data.beats), 40, 105),
    experience_level: experienceFromSport(data.sport),
  };
}
