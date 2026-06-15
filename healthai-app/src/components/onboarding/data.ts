// Modèle de données de l'onboarding + helper de conversion vers PATCH /me.
import type { UpdateUserAttributes } from '@/services/userService';

/** Données collectées au fil des étapes de l'onboarding. */
export type OnboardingData = {
  age: number;
  height: number; // cm
  weight: number; // kg
  sport: number; // heures / semaine
  bodyFat: number | null; // index dans BODY_FAT_OPTIONS
  beats: number; // battements comptés sur 30 s
  allergies: string[]; // ids des allergies sélectionnées
};

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  age: 27,
  height: 175,
  weight: 70,
  sport: 3,
  bodyFat: null,
  beats: 35,
  allergies: [],
};

/** Tranches de masse grasse présentées via les silhouettes (label + % médian envoyé à l'API). */
export const BODY_FAT_OPTIONS = [
  { label: '10–13 %', value: 11.5 },
  { label: '14–17 %', value: 15.5 },
  { label: '18–21 %', value: 19.5 },
  { label: '22–25 %', value: 23.5 },
  { label: '26–31 %', value: 28.5 },
  { label: '32 %+', value: 34 },
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
    height_cm: data.height,
    weight_kg: data.weight,
    sport_per_week: data.sport,
    bodyfat: data.bodyFat != null ? BODY_FAT_OPTIONS[data.bodyFat].value : undefined,
    rest_bpm: beatsToBpm(data.beats),
  };
}
