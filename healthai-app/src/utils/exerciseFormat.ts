import { WorkoutExercise } from '@/types/workout-exercises.type';

/** Ligne de méta d'un exercice : "Jambes · Force · Haltères". */
export function exerciseMeta(exercise: WorkoutExercise): string {
  return [exercise.body_part, exercise.category, exercise.equipment].filter(Boolean).join(' · ');
}

/** Prescription depuis le pivot : "3 séries × 12 reps". */
export function exercisePrescription(exercise: WorkoutExercise): string {
  const { sets, reps } = exercise.pivot ?? {};
  const parts: string[] = [];
  if (sets) parts.push(`${sets} ${sets > 1 ? 'séries' : 'série'}`);
  if (reps) parts.push(`${reps} reps`);
  return parts.join(' × ');
}

/** Temps de repos formaté depuis le pivot ("1 min 30" / "45 s"), ou null. */
export function exerciseRest(exercise: WorkoutExercise): string | null {
  const rest = exercise.pivot?.rest_sec;
  if (!rest) return null;
  if (rest < 60) return `${rest} s`;
  const min = Math.floor(rest / 60);
  const sec = rest % 60;
  return sec ? `${min} min ${sec}` : `${min} min`;
}
