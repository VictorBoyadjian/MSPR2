import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import DateTimeField from '@/components/ui/DateTimeField';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, MealType } from '@/services/api';
import { calculDishService } from '@/services/calculDishService';
import { dishService } from '@/services/dishService';
import { useAuthStore } from '@/stores/authStore';
import { analyzedDish, splittedDish } from '@/types/splittedDish';
import { CalculateDishResponse } from '@/types/calculate-dish-response';
import { AnnalysedMeal } from '@/components/meal/AnnalysedMeal';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Petit déj' },
  { value: 'lunch', label: 'Déjeuner' },
  { value: 'dinner', label: 'Dîner' },
  { value: 'snack', label: 'Collation' },
];

type FoodItem = {
  id: string;
  name: string;
  quantity_g: string;
};

type Phase = 'form' | 'loading' | 'result';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

const emptyFood = (): FoodItem => ({
  id: nextId(),
  name: '',
  quantity_g: '',
});

const num = (v: string) => (v ? Number(v.replace(',', '.')) || 0 : 0);

function parseAliments(raw?: string): FoodItem[] {
  if (!raw) return [emptyFood()];
  try {
    const aliments = (JSON.parse(raw) as splittedDish['aliments']) ?? {};
    const items = Object.entries(aliments).map(([name, food]) => ({
      id: nextId(),
      name,
      quantity_g: food.quantity_g != null ? String(food.quantity_g) : '',
    }));
    return items.length ? items : [emptyFood()];
  } catch {
    return [emptyFood()];
  }
}

export default function AddMealScreen() {
  const router = useRouter();
  const theme = useTheme();
  const authStore = useAuthStore();
  const { aliments } = useLocalSearchParams<{ aliments?: string }>();

  const [foods, setFoods] = useState<FoodItem[]>(() => parseAliments(aliments));
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [eatedAt, setEatedAt] = useState(() => new Date());
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [analyzed, setAnalyzed] = useState<CalculateDishResponse | null>(null);

  const updateFood = (id: string, key: keyof FoodItem, value: string) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  const removeFood = (id: string) => setFoods((prev) => prev.filter((f) => f.id !== id));

  const addFood = () => setFoods((prev) => [...prev, emptyFood()]);

  const analyzedTotals = useMemo(
    () => (analyzed ? analyzed : null),
    [analyzed],
  );

  const onSubmit = async () => {
    const named = foods.filter((f) => f.name.trim());
    if (named.length === 0) {
      setError('Ajoutez au moins un aliment avec un nom.');
      return;
    }
    setError('');
    setPhase('loading');

    try {
      const input: splittedDish = {
        aliments: named.reduce<splittedDish['aliments']>((acc, f) => {
          acc[f.name.trim()] = { quantity_g: num(f.quantity_g) };
          return acc;
        }, {}),
      };

      const result = await calculDishService.calculate(input);

      await dishService.create({
        name: result.dish_name,
        meal_type: mealType,
        calories_kcal: Math.round(result.kcal),
        proteins_g: Math.round(result.proteins_g),
        carbs_g: Math.round(result.carbs_g),
        fats_g: Math.round(result.fats_g),
        eated_at: eatedAt.toISOString(),
        user_id: authStore.user?.id || '',
      });

      setAnalyzed(result);
      setPhase('result');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Une erreur est survenue.');
      setPhase('form');
    }
  };

  // --- Écran de chargement pendant l'analyse nutritionnelle ---
  if (phase === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.text} />
        <ThemedText type="small" themeColor="textSecondary">
          Analyse de votre repas…
        </ThemedText>
      </ThemedView>
    );
  }

  // --- Repas analysé : récapitulatif + bouton OK ---
  if (phase === 'result' && analyzed) {
    return (
      <AnnalysedMeal analyzed={analyzed} />
    );
  }

  // --- Formulaire : nom + quantité uniquement ---
  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle">Enregistrer mon repas</ThemedText>

            <ThemedView style={styles.dateField}>
              <DateTimeField value={eatedAt} onChange={setEatedAt} />
            </ThemedView>

            <ThemedText type="smallBold" themeColor="textSecondary">
              Type de repas
            </ThemedText>
            <ThemedView style={styles.chips}>
              {MEAL_TYPES.map((t) => {
                const active = t.value === mealType;
                return (
                  <Pressable
                    key={t.value}
                    onPress={() => setMealType(t.value)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? theme.text : theme.backgroundElement },
                    ]}>
                    <ThemedText
                      type="small"
                      style={{ color: active ? theme.background : theme.text }}>
                      {t.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>

            <ThemedText type="smallBold" themeColor="textSecondary">
              Aliments
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Indiquez le nom et la quantité, les calories sont calculées automatiquement.
            </ThemedText>

            {foods.map((food, index) => (
              <ThemedView
                key={food.id}
                style={[styles.foodCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.foodHeader}>
                  <ThemedText type="smallBold">Aliment {index + 1}</ThemedText>
                  <Pressable onPress={() => removeFood(food.id)} hitSlop={8}>
                    <ThemedText type="small" style={styles.remove}>
                      Supprimer
                    </ThemedText>
                  </Pressable>
                </View>

                <Input
                  label="Nom"
                  value={food.name}
                  onChangeText={(v) => updateFood(food.id, 'name', v)}
                  placeholder="Poulet"
                />
                <Input
                  label="Quantité (g)"
                  value={food.quantity_g}
                  onChangeText={(v) => updateFood(food.id, 'quantity_g', v)}
                  keyboardType="numeric"
                />
              </ThemedView>
            ))}

            <Button label="+ Ajouter un aliment" variant="secondary" onPress={addFood} />

            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Button label="Enregistrer" onPress={onSubmit} />
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  form: { padding: Spacing.four, gap: Spacing.three },
  dateField: { width: '50%', alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  foodCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  foodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remove: { color: '#e5484d' },
  totals: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.one, alignItems: 'center' },
  error: { color: '#e5484d' },
});
