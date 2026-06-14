import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
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
import { isNotEmpty } from '@/utils/validators';
import { useAuthStore } from '@/stores/authStore';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Petit déj' },
  { value: 'lunch', label: 'Déjeuner' },
  { value: 'dinner', label: 'Dîner' },
  { value: 'snack', label: 'Collation' },
];

export default function AddMealScreen() {
  const router = useRouter();
  const theme = useTheme();
  const authStore = useAuthStore();

  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [calories, setCalories] = useState('');
  const [proteins, setProteins] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [eatedAt, setEatedAt] = useState(() => new Date());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const num = (v: string) => (v ? Number(v.replace(',', '.')) : undefined);

  const onSubmit = async () => {
    if (!isNotEmpty(name)) {
      setError('Donnez un nom à votre repas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await dishService.create({
        name: name.trim(),
        meal_type: mealType,
        calories_kcal: num(calories),
        proteins_g: num(proteins),
        carbs_g: num(carbs),
        fats_g: num(fats),
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

            <Input label="Nom du plat" value={name} onChangeText={setName} placeholder="Poulet riz" />

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

            <Input
              label="Calories (kcal)"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
            <ThemedView style={styles.macros}>
              <Input
                label="Protéines (g)"
                value={proteins}
                onChangeText={setProteins}
                keyboardType="numeric"
                style={styles.macroInput}
              />
              <Input
                label="Glucides (g)"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
                style={styles.macroInput}
              />
              <Input
                label="Lipides (g)"
                value={fats}
                onChangeText={setFats}
                keyboardType="numeric"
                style={styles.macroInput}
              />
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
  macros: { flexDirection: 'row', gap: Spacing.two },
  macroInput: { flex: 1, minWidth: 0 },
  error: { color: '#e5484d' },
});
