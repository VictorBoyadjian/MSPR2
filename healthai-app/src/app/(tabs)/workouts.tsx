import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DayNavigator from '@/components/meal/DayNavigator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import DayTimetable from '@/components/workout/DayTimetable';
import SessionRecommendations from '@/components/workout/SessionRecommendations';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useGoals } from '@/hooks/useGoals';
import { useSessionRecommendations } from '@/hooks/useSessionRecommendations';
import { useTheme } from '@/hooks/use-theme';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useAuthStore } from '@/stores/authStore';
import { RecommendedSession, UserSession } from '@/types/workout-sessions.type';
import { isSameDay, startOfDay } from '@/utils/day';
import { apiDateToIso } from '@/utils/formatDate';

export default function WorkoutsScreen() {
  const { sessions, loading, error, refresh } = useWorkouts();
  const { user } = useAuthStore();
  const { items: goals } = useGoals();
  const theme = useTheme();
  const router = useRouter();
  const [day, setDay] = useState(() => startOfDay(new Date()));

  const profile = useMemo(
    () => goals.find((g) => g.id === user?.goal_id)?.name ?? null,
    [goals, user?.goal_id],
  );
  const { sessions: recommended } = useSessionRecommendations(profile);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const daySessions = useMemo(
    () => sessions.filter((s) => isSameDay(new Date(apiDateToIso(s.performedAt)), day)),
    [sessions, day],
  );

  const onEdit = useCallback(
    (s: UserSession) =>
      router.push({
        pathname: '/workout/[id]',
        params: {
          id: s.userSessionId,
          workoutSessionId: s.id,
          name: s.name,
          performedAt: s.performedAt,
        },
      }),
    [router],
  );

  // Tap sur une carte recommandée : ouvre la planification, séance pré-sélectionnée.
  const onPlanRecommended = useCallback(
    (s: RecommendedSession) =>
      router.push({
        pathname: '/workout/add',
        params: { workoutSessionId: String(s.session_id), name: s.name },
      }),
    [router],
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Mes séances</ThemedText>
          <Button label="+ Planifier" onPress={() => router.push('/workout/add')} />
        </ThemedView>

        <DayNavigator value={day} onChange={setDay} />

        {loading ? (
          <Loader />
        ) : (
          <>
            {daySessions.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                {error || 'Aucune séance ce jour-là.'}
              </ThemedText>
            ) : null}
            <DayTimetable day={day} sessions={daySessions} onPress={onEdit} />
          </>
        )}

        {/* Bloc discret en bas : idées de séances adaptées au profil. */}
        {recommended.length > 0 ? (
          <View style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.recoLabel}>
              Idées de séances
            </ThemedText>
            <SessionRecommendations sessions={recommended} onPress={onPlanRecommended} />
          </View>
        ) : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  empty: { textAlign: 'center', paddingVertical: Spacing.two },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset,
    gap: Spacing.one,
  },
  recoLabel: { fontSize: 11 },
});
