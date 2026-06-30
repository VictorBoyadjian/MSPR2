import { useCallback, useEffect, useRef, useState } from 'react';

import { coachService } from '@/services/coachService';
import { dishService } from '@/services/dishService';
import { goalService } from '@/services/goalService';
import { healthService } from '@/services/healthService';
import { useAuthStore } from '@/stores/authStore';
import { CoachMessageInput } from '@/types/coach.type';

/** Heure (locale) à partir de laquelle le message du coach peut être généré. */
const COACH_GENERATION_HOUR = 18;

/** Lundi 00:00 (heure locale) de la semaine en cours. */
function startOfWeek(now: Date): Date {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7; // 0 = lundi
  date.setDate(date.getDate() - day);
  return date;
}

/**
 * Message du coach IA affiché sur l'accueil. Comportement :
 *  - si le message du jour existe déjà → on l'affiche (1 génération max par jour) ;
 *  - sinon, s'il n'existe AUCUN message précédent → on génère dès la connexion,
 *    quelle que soit l'heure ;
 *  - sinon (un message précédent existe) → on l'affiche tout de suite comme repli, et
 *    on régénère le message du jour à partir de 18h.
 * La génération se fait via Mistral (bilan de la semaine) puis l'enregistre en arrière-plan.
 */
export function useCoachMessage() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Évite une double génération concurrente dans la même session.
  const generatingRef = useRef(false);

  const buildWeeklyInput = useCallback(async (): Promise<CoachMessageInput> => {
    const [sportStats, dishes, goals] = await Promise.all([
      healthService.getSportStats(),
      userId ? dishService.list(userId) : Promise.resolve([]),
      goalService.list(),
    ]);

    const sportHoursThisWeek = sportStats.week.reduce((sum, d) => sum + (d.hours || 0), 0);
    const sessionsCount = sportStats.week.filter((d) => (d.hours || 0) > 0).length;

    const weekStart = startOfWeek(new Date());
    const weekDishes = dishes.filter((d) => {
      const eaten = new Date(d.eated_at ?? d.created_at);
      return eaten >= weekStart;
    });
    const weekCalories = weekDishes.reduce((sum, d) => sum + (Number(d.calories_kcal) || 0), 0);

    const goalLabel = goals.find((g) => String(g.id) === String(user?.goal_id))?.label;

    return {
      first_name: user?.first_name ?? '',
      goal: goalLabel ?? 'Maintien et bien-être',
      current_weight_kg: user?.weight_kg ?? null,
      target_weight_kg: user?.target_weight ?? null,
      sport_hours_this_week: Math.round(sportHoursThisWeek * 100) / 100,
      weekly_average_hours: sportStats.weekly_average_hours,
      sessions_count: sessionsCount,
      meals_logged: weekDishes.length,
      avg_daily_calories: Math.round(weekCalories / 7),
    };
  }, [userId, user?.first_name, user?.goal_id, user?.weight_kg, user?.target_weight]);

  const generate = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setLoading(true);
    try {
      const input = await buildWeeklyInput();
      const generated = await coachService.generate(input);
      await coachService.save(generated);
      setMessage(generated);
    } catch (err) {
      console.error('useCoachMessage.generate error:', err);
    } finally {
      setLoading(false);
      generatingRef.current = false;
    }
  }, [buildWeeklyInput]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const status = await coachService.getStatus();

      // Déjà généré aujourd'hui : on l'affiche, pas de régénération (1/jour).
      if (status.today) {
        setMessage(status.today);
        return;
      }

      if (status.latest) {
        // Un message précédent existe : on l'affiche en repli...
        setMessage(status.latest.message);
        // ...et on régénère le message du jour à partir de 18h.
        if (new Date().getHours() >= COACH_GENERATION_HOUR) {
          await generate();
        }
      } else {
        // Aucun message existant : on génère dès la connexion, quelle que soit l'heure.
        setMessage(null);
        await generate();
      }
    } catch (err) {
      console.error('useCoachMessage.refresh error:', err);
    }
  }, [userId, generate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { message, loading, refresh };
}
