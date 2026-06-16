import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/ConfirmDialog';
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

type Picked = Pick<WorkoutSession, 'id' | 'name'>;

export default function EditWorkoutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items: goals } = useGoals();
  const params = useLocalSearchParams<{
    id: string;
    workoutSessionId: string;
    name: string;
    performedAt: string;
  }>();

  const profile = goals.find((g) => g.id === user?.goal_id)?.name ?? null;

  const [selected, setSelected] = useState<Picked>({ id: params.workoutSessionId, name: params.name });
  const [performedAt, setPerformedAt] = useState(() =>
    params.performedAt ? new Date(params.performedAt) : new Date(),
  );
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirm = useConfirm();

  const { exercises, loading: loadingExercises } = useSessionExercises(selected.id);

  const onLaunch = () =>
    router.push({
      pathname: '/workout/run',
      params: { workoutSessionId: selected.id, name: selected.name },
    });

  const onSave = async () => {
    setError('');
    setLoading(true);
    try {
      await sessionService.update(params.id, {
        workoutSessionId: selected.id,
        performedAt: performedAt.toISOString(),
      });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer la séance',
      message: 'Cette séance sera définitivement supprimée.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    setError('');
    setDeleting(true);
    try {
      await sessionService.remove(params.id);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
      setDeleting(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle">Modifier la séance</ThemedText>

            <SessionSummaryCard
              session={selected}
              exerciseCount={exercises.length}
              action={{
                label: picking ? 'Fermer' : 'Changer',
                onPress: () => setPicking((p) => !p),
              }}>
              <View style={styles.dateField}>
                <ThemedText type="small" themeColor="textSecondary">
                  Quand ?
                </ThemedText>
                <DateTimeField value={performedAt} onChange={setPerformedAt} mode="datetime" />
              </View>
            </SessionSummaryCard>

            {picking ? (
              <SessionSearch
                profile={profile}
                autoFocus
                onSelect={(s) => {
                  setSelected(s);
                  setPicking(false);
                }}
              />
            ) : (
              <>
                <Button label="Lancer la séance" icon="pulse" onPress={onLaunch} />

                <ThemedView style={styles.exercises}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Exercices{exercises.length ? ` (${exercises.length})` : ''}
                  </ThemedText>
                  <SessionExerciseList exercises={exercises} loading={loadingExercises} />
                </ThemedView>
              </>
            )}

            {error ? <ThemedText type="small" style={styles.error}>{error}</ThemedText> : null}

            <Button label="Enregistrer" onPress={onSave} loading={loading} />
            <Button label="Annuler" variant="secondary" onPress={() => router.back()} />
            <Pressable onPress={onDelete} disabled={deleting} style={styles.delete}>
              <ThemedText type="smallBold" style={styles.deleteTx}>
                Supprimer la séance
              </ThemedText>
            </Pressable>
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
  delete: { alignItems: 'center', paddingVertical: Spacing.two },
  deleteTx: { color: '#e5484d' },
});
