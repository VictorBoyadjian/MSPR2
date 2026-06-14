import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import DateTimeField from '@/components/ui/DateTimeField';
import Input from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError, MealType } from '@/services/api';
import { dishService } from '@/services/dishService';
import { useAuthStore } from '@/stores/authStore';
import { ScanDishResponse } from '@/types/san-dish-response.type';

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
  calories: string;
  proteins: string;
  carbs: string;
  fats: string;
};

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

const emptyFood = (): FoodItem => ({
  id: nextId(),
  name: '',
  quantity_g: '',
  calories: '',
  proteins: '',
  carbs: '',
  fats: '',
});

const num = (v: string) => (v ? Number(v.replace(',', '.')) || 0 : 0);

function parseAliments(raw?: string): FoodItem[] {
  if (!raw) return [emptyFood()];
  try {
    const aliments = (JSON.parse(raw) as ScanDishResponse['aliments']) ?? {};
    const items = Object.entries(aliments).map(([name, food]) => ({
      id: nextId(),
      name,
      quantity_g: food.quantity_g != null ? String(food.quantity_g) : '',
      calories: food.calories_kcal != null ? String(food.calories_kcal) : '',
      proteins: food.proteins_g != null ? String(food.proteins_g) : '',
      carbs: food.carbs_g != null ? String(food.carbs_g) : '',
      fats: food.fats_g != null ? String(food.fats_g) : '',
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
  const [loading, setLoading] = useState(false);

  const totals = useMemo(
    () =>
      foods.reduce(
        (acc, f) => ({
          calories: acc.calories + num(f.calories),
          proteins: acc.proteins + num(f.proteins),
          carbs: acc.carbs + num(f.carbs),
          fats: acc.fats + num(f.fats),
        }),
        { calories: 0, proteins: 0, carbs: 0, fats: 0 },
      ),
    [foods],
  );

  const updateFood = (id: string, key: keyof FoodItem, value: string) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

  const removeFood = (id: string) => setFoods((prev) => prev.filter((f) => f.id !== id));

  const addFood = () => setFoods((prev) => [...prev, emptyFood()]);

  const onSubmit = async () => {
    const named = foods.map((f) => f.name.trim()).filter(Boolean);
    if (named.length === 0) {
      setError('Ajoutez au moins un aliment avec un nom.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await dishService.create({
        name: named.join(', '),
        meal_type: mealType,
        calories_kcal: totals.calories,
        proteins_g: totals.proteins,
        carbs_g: totals.carbs,
        fats_g: totals.fats,
        eated_at: eatedAt.toISOString(),
        user_id: authStore.user?.id || '',
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
                <View style={styles.row}>
                  <Input
                    label="Quantité (g)"
                    value={food.quantity_g}
                    onChangeText={(v) => updateFood(food.id, 'quantity_g', v)}
                    keyboardType="numeric"
                    style={styles.rowInput}
                  />
                  <Input
                    label="Calories (kcal)"
                    value={food.calories}
                    onChangeText={(v) => updateFood(food.id, 'calories', v)}
                    keyboardType="numeric"
                    style={styles.rowInput}
                  />
                </View>
                <View style={styles.row}>
                  <Input
                    label="Protéines (g)"
                    value={food.proteins}
                    onChangeText={(v) => updateFood(food.id, 'proteins', v)}
                    keyboardType="numeric"
                    style={styles.rowInput}
                  />
                  <Input
                    label="Glucides (g)"
                    value={food.carbs}
                    onChangeText={(v) => updateFood(food.id, 'carbs', v)}
                    keyboardType="numeric"
                    style={styles.rowInput}
                  />
                  <Input
                    label="Lipides (g)"
                    value={food.fats}
                    onChangeText={(v) => updateFood(food.id, 'fats', v)}
                    keyboardType="numeric"
                    style={styles.rowInput}
                  />
                </View>
              </ThemedView>
            ))}

            <Button label="+ Ajouter un aliment" variant="secondary" onPress={addFood} />

            <ThemedView style={[styles.totals, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">Total</ThemedText>
              <ThemedText type="small">
                {Math.round(totals.calories)} kcal · P {Math.round(totals.proteins)} g · G{' '}
                {Math.round(totals.carbs)} g · L {Math.round(totals.fats)} g
              </ThemedText>
            </ThemedView>

            {error ? (
              <ThemedText type="small" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Button label="Enregistrer" onPress={onSubmit} loading={loading} />
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
  row: { flexDirection: 'row', gap: Spacing.two },
  rowInput: { flex: 1, minWidth: 0 },
  totals: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  error: { color: '#e5484d' },
});
