import { useEffect, useState } from 'react';

import { sessionService } from '@/services/sessionService';
import { WorkoutExercise } from '@/types/workout-exercises.type';

/**
 * Exercices d'une séance du catalogue (relation `exercises`, triés par `order_num`).
 * `workoutSessionId` peut être absent (rien n'est chargé tant qu'il manque).
 */
export function useSessionExercises(workoutSessionId?: string | null) {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workoutSessionId) {
      setExercises([]);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const list = await sessionService.getExercises(workoutSessionId);
        if (active) setExercises(list);
      } catch {
        if (active) setError('Impossible de charger les exercices.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [workoutSessionId]);

  return { exercises, loading, error };
}
