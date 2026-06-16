// Helpers partagés autour du moteur de recommandation : construction de l'input,
// dérivation du niveau d'expérience, et classement des goals selon la reco.
import { Goal } from '@/types/goals.type';
import { RecommendInput, RecommendOutput } from '@/types/recommendation.type';
import { User } from '@/types/users.type';

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Déduit le niveau d'expérience des heures de sport hebdomadaires. */
export function experienceFromSport(hoursPerWeek: number): RecommendInput['experience_level'] {
  if (hoursPerWeek < 3) return 'beginner';
  if (hoursPerWeek > 8) return 'advanced';
  return 'intermediate';
}

/**
 * Construit l'entrée /recommend depuis l'utilisateur courant (stats du profil).
 * Valeurs bornées aux plages ML (sinon 422) ; 'other'/null → 'male' (le moteur
 * n'accepte que male|female) ; niveau déduit des heures de sport.
 */
export function buildRecommendInputFromUser(user: User): RecommendInput {
  return {
    age: clamp(Math.round(user.age ?? 30), 18, 65),
    gender: user.gender === 'female' ? 'female' : 'male',
    weight_kg: clamp(user.weight_kg ?? 70, 30.1, 199.9),
    height_cm: clamp(user.height_cm ?? 175, 140.1, 214.9),
    body_fat_pct: clamp(user.bodyfat ?? 20, 4, 55),
    resting_bpm: clamp(user.rest_bpm ?? 70, 40, 105),
    experience_level: experienceFromSport(user.sport_per_week ?? 3),
  };
}

export type GoalRank = Map<string, { rank: number; confidence: number }>;

/** Index rang + confidence par nom de profil issu du classement ML. */
export function rankByName(reco: RecommendOutput | null): GoalRank {
  const map: GoalRank = new Map();
  reco?.top_profiles.forEach((p, i) => map.set(p.profile, { rank: i, confidence: p.confidence }));
  return map;
}

/** Tri stable : profils classés d'abord (par rang), le reste dans l'ordre d'origine. */
export function orderGoals(goals: Goal[], rank: GoalRank): Goal[] {
  return [...goals].sort((a, b) => {
    const ra = rank.get(a.name)?.rank ?? Number.POSITIVE_INFINITY;
    const rb = rank.get(b.name)?.rank ?? Number.POSITIVE_INFINITY;
    return ra - rb;
  });
}
