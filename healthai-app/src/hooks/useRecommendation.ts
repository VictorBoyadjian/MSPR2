import { useEffect, useState } from 'react';

import { recommendationService } from '@/services/recommendationService';
import { RecommendInput, RecommendOutput } from '@/types/recommendation.type';

/** Appelle /recommend une fois pour l'input donné (mémoïser l'input côté appelant). */
export function useRecommendation(input: RecommendInput | null) {
  const [data, setData] = useState<RecommendOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!input) return;
    let active = true;
    setLoading(true);
    setError('');
    recommendationService
      .recommend(input)
      .then((res) => active && setData(res))
      .catch(() => active && setError('Impossible de générer la recommandation.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [input]);

  return { data, loading, error };
}
