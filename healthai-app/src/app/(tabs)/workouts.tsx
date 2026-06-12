import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkouts } from '@/hooks/useWorkouts';
import { SportSession } from '@/services/api';
import { formatDuration } from '@/utils/formatDate';

function SessionRow({ session }: { session: SportSession }) {
  const exercises = session.exercises ?? [];
  return (
    <Card>
      <ThemedView style={styles.row}>
        <ThemedText type="smallBold">Séance #{session.id}</ThemedText>
        <ThemedText themeColor="textSecondary">{formatDuration(session.duration_min)}</ThemedText>
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        {exercises.length
          ? exercises.map((e) => e.name).join(', ')
          : 'Aucun exercice'}
      </ThemedText>
    </Card>
  );
}

export default function WorkoutsScreen() {
  const { sessions, loading, error, refresh } = useWorkouts();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Mes séances</ThemedText>
          <Button label="+ Ajouter" onPress={() => router.push('/workout/add')} />
        </ThemedView>

        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <SessionRow session={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {error || 'Aucune séance enregistrée pour le moment.'}
              </ThemedText>
            }
          />
        )}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: { gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
