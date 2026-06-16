import { useEffect, useState } from 'react';

import { recommendationService } from '@/services/recommendationService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { RecommendedSession } from '@/types/workout-sessions.type';

/**
 * Séances de sport recommandées pour le profil (goal) de l'utilisateur,
 * en excluant les parties du corps liées à ses handicaps.
 * `profile` = nom du goal courant (null si aucun programme).
 */
export function useSessionRecommendations(profile: string | null) {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<RecommendedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        // Handicaps de l'utilisateur (le endpoint /me ne charge pas les relations).
        const withRel = await userService.getWithRelations(user.id);
        const bodyParts = (withRel?.handicaps ?? [])
          .map((h) => h.name)
          .filter((n): n is string => !!n);

        const res = await recommendationService.sessions({
          profile,
          body_parts_to_exclude: bodyParts,
        });
        if (active) setSessions(res.sessions);
      } catch {
        if (active) setError('Impossible de charger les recommandations.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  return { sessions, loading, error };
}
