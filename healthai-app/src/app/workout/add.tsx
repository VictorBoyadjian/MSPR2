import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, Exercise } from '@/services/api';
import { SessionExerciseInput, workoutService } from '@/services/workoutService';

type Selected = SessionExerciseInput & { name: string };

export default function AddWorkoutScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [duration, setDuration] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    setSearching(true);
    try {
      setResults(await workoutService.searchExercises(term.trim()));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addExercise = (exercise: Exercise) => {
    if (selected.some((s) => s.exerciseId === exercise.id)) return;
    setSelected((prev) => [...prev, { exerciseId: exercise.id, name: exercise.name, sets: 3, reps: 10 }]);
  };

  const updateField = (id: number, field: 'sets' | 'reps', value: string) => {
    const n = value ? Number(value) : undefined;
    setSelected((prev) => prev.map((s) => (s.exerciseId === id ? { ...s, [field]: n } : s)));
  };

  const removeExercise = (id: number) => {
    setSelected((prev) => prev.filter((s) => s.exerciseId !== id));
  };

  const onSubmit = async () => {
    const minutes = Number(duration);
    if (!minutes || minutes <= 0) {
      setError('Indiquez une durée valide.');
      return;
    }
    if (selected.length === 0) {
      setError('Ajoutez au moins un exercice.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await workoutService.create({
        duration_min: minutes,
        exercises: selected.map(({ exerciseId, sets, reps }) => ({ exerciseId, sets, reps })),
      });
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle">Nouvelle séance</ThemedText>

            <Input
              label="Durée (min)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="45"
            />

            <ThemedText type="smallBold" themeColor="textSecondary">
              Exercices sélectionnés
            </ThemedText>
            {selected.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aucun exercice. Recherchez-en ci-dessous.
              </ThemedText>
            ) : (
              selected.map((s) => (
                <Card key={s.exerciseId}>
                  <ThemedView style={styles.rowBetween}>
                    <ThemedText type="smallBold" style={styles.flexText}>
                      {s.name}
                    </ThemedText>
                    <Pressable onPress={() => removeExercise(s.exerciseId)}>
                      <ThemedText type="small" style={styles.remove}>
                        Retirer
                      </ThemedText>
                    </Pressable>
                  </ThemedView>
                  <ThemedView style={styles.macros}>
                    <Input
                      label="Séries"
                      value={s.sets ? String(s.sets) : ''}
                      onChangeText={(v) => updateField(s.exerciseId, 'sets', v)}
                      keyboardType="numeric"
                      style={styles.macroInput}
                    />
                    <Input
                      label="Reps"
                      value={s.reps ? String(s.reps) : ''}
                      onChangeText={(v) => updateField(s.exerciseId, 'reps', v)}
                      keyboardType="numeric"
                      style={styles.macroInput}
                    />
                  </ThemedView>
                </Card>
              ))
            )}

            <ThemedView style={styles.searchRow}>
              <Input
                value={term}
                onChangeText={setTerm}
                placeholder="Rechercher un exercice"
                onSubmitEditing={onSearch}
                style={styles.searchInput}
              />
              <Button label="OK" onPress={onSearch} loading={searching} />
            </ThemedView>

            {results.map((ex) => (
              <Pressable
                key={ex.id}
                onPress={() => addExercise(ex)}
                style={[styles.result, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small">{ex.name}</ThemedText>
                {ex.body_part ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {ex.body_part}
                  </ThemedText>
                ) : null}
              </Pressable>
            ))}

            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Button label="Enregistrer la séance" onPress={onSubmit} loading={loading} />
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flexText: { flex: 1 },
  remove: { color: '#e5484d' },
  macros: { flexDirection: 'row', gap: Spacing.two },
  macroInput: { flex: 1 },
  searchRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-end' },
  searchInput: { flex: 1 },
  result: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  error: { color: '#e5484d' },
});
