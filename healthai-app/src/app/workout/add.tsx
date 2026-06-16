import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import DateTimeField from '@/components/ui/DateTimeField';
import { SessionExerciseList } from '@/components/workout/SessionExerciseList';
import { SessionSearch } from '@/components/workout/SessionSearch';
import { SessionSummaryCard } from '@/components/workout/SessionSummaryCard';
import { Spacing } from '@/constants/theme';
import { useGoals } from '@/hooks/useGoals';
import { useSessionExercises } from '@/hooks/useSessionExercises';
import { ApiError } from '@/services/api';
import { sessionService } from '@/services/sessionService';
import { useAuthStore } from '@/stores/authStore';
import { WorkoutSession } from '@/types/workout-sessions.type';

export default function AddWorkoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items: goals } = useGoals();
  // Pré-sélection éventuelle (depuis une carte de recommandation).
  const params = useLocalSearchParams<{ workoutSessionId?: string; name?: string }>();

  // Profil de l'utilisateur (goal) : on propose d'abord les séances de son programme.
  const profile = useMemo(
    () => goals.find((g) => g.id === user?.goal_id)?.name ?? null,
    [goals, user?.goal_id],
  );

  const [selected, setSelected] = useState<WorkoutSession | null>(
    params.workoutSessionId
      ? ({ id: params.workoutSessionId, name: params.name ?? 'Séance' } as WorkoutSession)
      : null,
  );
  const [performedAt, setPerformedAt] = useState(() => new Date());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Étapes de la séance sélectionnée (affichées même tant qu'elle n'est pas planifiée).
  const { exercises, loading: loadingExercises } = useSessionExercises(selected?.id);

  const onSubmit = async () => {
    if (!selected) {
      setError('Choisis une séance.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sessionService.record(selected.id, performedAt.toISOString());
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle">Planifier une séance</ThemedText>

            {selected ? (
              <>
                <SessionSummaryCard
                  session={selected}
                  exerciseCount={exercises.length}
                  action={{ label: 'Changer', onPress: () => setSelected(null) }}>
                  <View style={styles.dateField}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Quand ?
                    </ThemedText>
                    <DateTimeField value={performedAt} onChange={setPerformedAt} mode="datetime" />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Une date future planifie la séance, une date passée l&apos;enregistre comme faite.
                  </ThemedText>
                </SessionSummaryCard>

                <ThemedView style={styles.exercises}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Exercices{exercises.length ? ` (${exercises.length})` : ''}
                  </ThemedText>
                  <SessionExerciseList exercises={exercises} loading={loadingExercises} />
                </ThemedView>
              </>
            ) : (
              <SessionSearch profile={profile} onSelect={setSelected} autoFocus />
            )}

            {error ? <ThemedText type="small" style={styles.error}>{error}</ThemedText> : null}

            <Button label="Enregistrer" onPress={onSubmit} loading={loading} disabled={!selected} />
            <Button label="Annuler" variant="secondary" onPress={() => router.back()} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  form: { padding: Spacing.four, gap: Spacing.three },
  dateField: { gap: Spacing.one, marginTop: Spacing.two, alignItems: 'flex-start' },
  exercises: { gap: Spacing.two },
  error: { color: '#e5484d' },
});
