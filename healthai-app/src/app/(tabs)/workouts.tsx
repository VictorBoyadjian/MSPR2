import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DayNavigator from '@/components/meal/DayNavigator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkouts } from '@/hooks/useWorkouts';
import { SportSession } from '@/types/sport-sessions.type';
import { isSameDay, startOfDay } from '@/utils/day';
import { formatDuration } from '@/utils/formatDate';

function SessionRow({ session }: { session: SportSession }) {
  const exercises = session.exercises ?? [];
  return (
    <Card>
      <ThemedView style={styles.row}>
        <ThemedText type="smallBold">Séance #{session.id}</ThemedText>
        <ThemedText themeColor="textSecondary">{formatDuration(Number(session.duration_min))}</ThemedText>
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        {exercises.length ? exercises.map((e) => e.name).join(', ') : 'Aucun exercice'}
      </ThemedText>
    </Card>
  );
}

export default function WorkoutsScreen() {
  const { sessions, loading, error, refresh } = useWorkouts();
  const router = useRouter();
  const [day, setDay] = useState(() => startOfDay(new Date()));

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const daySessions = useMemo(
    () =>
      sessions.filter((session) =>
        session.performed_at ? isSameDay(new Date(session.performed_at), day) : false,
      ),
    [sessions, day],
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Mes séances</ThemedText>
          <Button label="+ Ajouter" onPress={() => router.push('/workout/add')} />
        </ThemedView>

        <ThemedView style={styles.panel}>
          <DayNavigator value={day} onChange={setDay} />

          {loading ? (
            <Loader />
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {daySessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
              {daySessions.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.empty}>
                  {error || 'Aucune séance ce jour-là.'}
                </ThemedText>
              ) : null}
            </ScrollView>
          )}
        </ThemedView>
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
  panel: {
    height: '52%',
    backgroundColor: 'transparent',
    borderRadius: Spacing.three,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
