import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkouts } from '@/hooks/useWorkouts';
import { sessionService } from '@/services/sessionService';
import { UserSession } from '@/types/workout-sessions.type';
import { formatDateTime } from '@/utils/formatDate';

function SessionCard({ session, onDelete }: { session: UserSession; onDelete: () => void }) {
  const planned = new Date(session.performedAt).getTime() > Date.now();
  const count = session.exercises?.length ?? 0;
  return (
    <Card>
      <ThemedView style={styles.row}>
        <ThemedText type="smallBold" style={styles.flexText} numberOfLines={1}>
          {session.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {planned ? 'À venir' : 'Fait'}
        </ThemedText>
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        {formatDateTime(session.performedAt)}
        {count ? ` · ${count} exercice${count > 1 ? 's' : ''}` : ''}
      </ThemedText>
      <Pressable onPress={onDelete} hitSlop={8} style={styles.delete}>
        <ThemedText type="small" style={styles.deleteTx}>Supprimer</ThemedText>
      </Pressable>
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

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime(),
    );
    return {
      upcoming: sorted.filter((s) => new Date(s.performedAt).getTime() > now).reverse(),
      past: sorted.filter((s) => new Date(s.performedAt).getTime() <= now),
    };
  }, [sessions]);

  const onDelete = useCallback(
    async (s: UserSession) => {
      try {
        await sessionService.remove(s.userSessionId);
        refresh();
      } catch {
        /* un refresh ultérieur corrigera l'affichage */
      }
    },
    [refresh],
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Mes séances</ThemedText>
          <Button label="+ Planifier" onPress={() => router.push('/workout/add')} />
        </ThemedView>

        {loading ? (
          <Loader />
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {upcoming.length > 0 ? (
              <ThemedText type="smallBold" themeColor="textSecondary">À VENIR</ThemedText>
            ) : null}
            {upcoming.map((s) => (
              <SessionCard key={s.userSessionId} session={s} onDelete={() => onDelete(s)} />
            ))}

            {past.length > 0 ? (
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.pastLabel}>
                HISTORIQUE
              </ThemedText>
            ) : null}
            {past.map((s) => (
              <SessionCard key={s.userSessionId} session={s} onDelete={() => onDelete(s)} />
            ))}

            {sessions.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {error || 'Aucune séance. Planifie ou enregistre-en une.'}
              </ThemedText>
            ) : null}
          </ScrollView>
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
  list: { gap: Spacing.two, paddingBottom: BottomTabInset + Spacing.four },
  pastLabel: { marginTop: Spacing.three },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flexText: { flex: 1, marginRight: Spacing.two },
  delete: { alignSelf: 'flex-end', marginTop: Spacing.one },
  deleteTx: { color: '#e5484d' },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
