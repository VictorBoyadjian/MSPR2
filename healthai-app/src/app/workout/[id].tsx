import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ExerciseRow from '@/components/workout/ExerciseRow';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DateTimeField from '@/components/ui/DateTimeField';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useGoals } from '@/hooks/useGoals';
import { useSessionExercises } from '@/hooks/useSessionExercises';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { sessionService } from '@/services/sessionService';
import { useAuthStore } from '@/stores/authStore';
import { WorkoutSession } from '@/types/workout-sessions.type';

type Picked = Pick<WorkoutSession, 'id' | 'name'>;

export default function EditWorkoutScreen() {
  const router = useRouter();
  const theme = useTheme();
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
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<WorkoutSession[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { exercises, loading: loadingExercises } = useSessionExercises(selected.id);

  const onLaunch = () =>
    router.push({
      pathname: '/workout/run',
      params: { workoutSessionId: selected.id, name: selected.name },
    });

  const runSearch = useCallback(
    async (t: string) => {
      setSearching(true);
      try {
        setResults(await sessionService.search(t, profile));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [profile],
  );

  const openPicker = () => {
    setPicking(true);
    runSearch('');
  };

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
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setError('');
    setDeleting(true);
    try {
      await sessionService.remove(params.id);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle">Modifier la séance</ThemedText>

            <Card>
              <ThemedView style={styles.row}>
                <ThemedText type="smallBold" style={styles.flexText}>{selected.name}</ThemedText>
                <Pressable onPress={() => (picking ? setPicking(false) : openPicker())} hitSlop={8}>
                  <ThemedText type="small" style={styles.change}>{picking ? 'Fermer' : 'Changer'}</ThemedText>
                </Pressable>
              </ThemedView>
              <ThemedView style={styles.dateField}>
                <ThemedText type="small" themeColor="textSecondary">Quand ?</ThemedText>
                <DateTimeField value={performedAt} onChange={setPerformedAt} mode="datetime" />
              </ThemedView>
            </Card>

            {!picking ? (
              <>
                <Button label="Lancer la séance" icon="pulse" onPress={onLaunch} />

                <ThemedView style={styles.exercises}>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Exercices{exercises.length ? ` (${exercises.length})` : ''}
                  </ThemedText>
                  {loadingExercises ? (
                    <ActivityIndicator />
                  ) : exercises.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Aucun exercice pour cette séance.
                    </ThemedText>
                  ) : (
                    <Card style={styles.exerciseList}>
                      {exercises.map((ex, i) => (
                        <ExerciseRow key={ex.id} exercise={ex} index={i} />
                      ))}
                    </Card>
                  )}
                </ThemedView>
              </>
            ) : null}

            {picking ? (
              <>
                <ThemedView style={styles.searchRow}>
                  <Input
                    value={term}
                    onChangeText={setTerm}
                    placeholder="Rechercher une séance"
                    onSubmitEditing={() => runSearch(term)}
                    style={styles.searchInput}
                  />
                  <Button label="OK" onPress={() => runSearch(term)} loading={searching} />
                </ThemedView>
                {searching ? (
                  <ActivityIndicator />
                ) : (
                  results.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => {
                        setSelected(s);
                        setPicking(false);
                      }}
                      style={[styles.result, { backgroundColor: theme.backgroundElement }]}>
                      <ThemedText type="small" style={styles.flexText} numberOfLines={1}>{s.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {s.total_duration_min ? `${s.total_duration_min} min` : ''}
                      </ThemedText>
                    </Pressable>
                  ))
                )}
              </>
            ) : null}

            {error ? <ThemedText type="small" style={styles.error}>{error}</ThemedText> : null}

            <Button label="Enregistrer" onPress={onSave} loading={loading} />
            <Button label="Annuler" variant="secondary" onPress={() => router.back()} />
            <Pressable onPress={onDelete} disabled={deleting} style={styles.delete}>
              <ThemedText type="smallBold" style={styles.deleteTx}>
                {confirmDelete ? 'Confirmer la suppression' : 'Supprimer la séance'}
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flexText: { flex: 1, marginRight: Spacing.two },
  change: { color: '#3b82f6' },
  dateField: { gap: Spacing.one, marginTop: Spacing.two, alignItems: 'flex-start' },
  exercises: { gap: Spacing.two },
  exerciseList: { gap: Spacing.three },
  searchRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-end' },
  searchInput: { flex: 1 },
  result: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: { color: '#e5484d' },
  delete: { alignItems: 'center', paddingVertical: Spacing.two },
  deleteTx: { color: '#e5484d' },
});
