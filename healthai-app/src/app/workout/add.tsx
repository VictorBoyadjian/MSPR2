import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DateTimeField from '@/components/ui/DateTimeField';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useGoals } from '@/hooks/useGoals';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { sessionService } from '@/services/sessionService';
import { useAuthStore } from '@/stores/authStore';
import { WorkoutSession } from '@/types/workout-sessions.type';

export default function AddWorkoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { items: goals } = useGoals();
  // Pré-sélection éventuelle (depuis une carte de recommandation).
  const params = useLocalSearchParams<{ workoutSessionId?: string; name?: string }>();

  // Profil de l'utilisateur (goal) : on propose d'abord les séances de son programme.
  const profile = useMemo(
    () => goals.find((g) => g.id === user?.goal_id)?.name ?? null,
    [goals, user?.goal_id],
  );

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<WorkoutSession[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<WorkoutSession | null>(
    params.workoutSessionId
      ? ({ id: params.workoutSessionId, name: params.name ?? 'Séance' } as WorkoutSession)
      : null,
  );
  const [performedAt, setPerformedAt] = useState(() => new Date());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Chargement initial : séances du programme de l'utilisateur.
  useEffect(() => {
    runSearch('');
  }, [runSearch]);

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
              <Card>
                <ThemedView style={styles.row}>
                  <ThemedText type="smallBold" style={styles.flexText}>{selected.name}</ThemedText>
                  <Pressable onPress={() => setSelected(null)} hitSlop={8}>
                    <ThemedText type="small" style={[styles.change, { color: theme.accentText }]}>Changer</ThemedText>
                  </Pressable>
                </ThemedView>
                {selected.exercises?.length ? (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                    {selected.exercises.map((e) => e.name).join(', ')}
                  </ThemedText>
                ) : null}
                <ThemedView style={styles.dateField}>
                  <ThemedText type="small" themeColor="textSecondary">Quand ?</ThemedText>
                  <DateTimeField value={performedAt} onChange={setPerformedAt} mode="datetime" />
                </ThemedView>
                <ThemedText type="small" themeColor="textSecondary">
                  Une date future planifie la séance, une date passée l&apos;enregistre comme faite.
                </ThemedText>
              </Card>
            ) : (
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
                      onPress={() => setSelected(s)}
                      style={[styles.result, { backgroundColor: theme.backgroundElement }]}>
                      <ThemedText type="small" style={styles.flexText} numberOfLines={1}>{s.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {s.total_duration_min ? `${s.total_duration_min} min` : ''}
                      </ThemedText>
                    </Pressable>
                  ))
                )}
                {!searching && results.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">Aucune séance trouvée.</ThemedText>
                ) : null}
              </>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flexText: { flex: 1, marginRight: Spacing.two },
  change: { fontWeight: '600' },
  dateField: { gap: Spacing.one, marginTop: Spacing.two, alignItems: 'flex-start' },
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
});
