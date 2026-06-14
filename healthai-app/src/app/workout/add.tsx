import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/api';
import { workoutService } from '@/services/sessionService';
import { Exercise } from '@/types/exercises.type';

type Selected = {
  uid: string;
  exerciseId: string;
  name: string;
  sets?: number;
  reps?: number;
};

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
  const uidRef = useRef(0);

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
    const uid = String(uidRef.current++);
    setSelected((prev) => [
      ...prev,
      { uid, exerciseId: exercise.id, name: exercise.name, sets: 3, reps: 10 },
    ]);
  };

  const updateField = (uid: string, field: 'sets' | 'reps', value: string) => {
    const n = value ? Number(value) : undefined;
    setSelected((prev) => prev.map((s) => (s.uid === uid ? { ...s, [field]: n } : s)));
  };

  const removeExercise = (uid: string) => {
    setSelected((prev) => prev.filter((s) => s.uid !== uid));
  };

  const moveExercise = (uid: string, direction: -1 | 1) => {
    setSelected((prev) => {
      const index = prev.findIndex((s) => s.uid === uid);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
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
      // L'ordre des exercices correspond à leur position dans `selected`.
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
              selected.map((s, index) => (
                <Card key={s.uid}>
                  <ThemedView style={styles.rowBetween}>
                    <ThemedView style={styles.titleRow}>
                      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.order}>
                        {index + 1}.
                      </ThemedText>
                      <ThemedText type="smallBold" style={styles.flexText}>
                        {s.name}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.actions}>
                      <Pressable
                        onPress={() => moveExercise(s.uid, -1)}
                        disabled={index === 0}
                        hitSlop={8}>
                        <ThemedText type="small" style={index === 0 ? styles.arrowDisabled : styles.arrow}>
                          ↑
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => moveExercise(s.uid, 1)}
                        disabled={index === selected.length - 1}
                        hitSlop={8}>
                        <ThemedText
                          type="small"
                          style={index === selected.length - 1 ? styles.arrowDisabled : styles.arrow}>
                          ↓
                        </ThemedText>
                      </Pressable>
                      <Pressable onPress={() => removeExercise(s.uid)} hitSlop={8}>
                        <ThemedText type="small" style={styles.remove}>
                          Retirer
                        </ThemedText>
                      </Pressable>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView style={styles.macros}>
                    <Input
                      label="Séries"
                      value={s.sets ? String(s.sets) : ''}
                      onChangeText={(v) => updateField(s.uid, 'sets', v)}
                      keyboardType="numeric"
                      style={styles.macroInput}
                    />
                    <Input
                      label="Reps"
                      value={s.reps ? String(s.reps) : ''}
                      onChangeText={(v) => updateField(s.uid, 'reps', v)}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: Spacing.one },
  order: { minWidth: 20 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  arrow: { fontSize: 18 },
  arrowDisabled: { fontSize: 18, opacity: 0.3 },
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
