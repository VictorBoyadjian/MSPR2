import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMeals } from '@/hooks/useMeals';
import { Dish, MealType } from '@/services/api';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Petit déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
};

function MealRow({ dish }: { dish: Dish }) {
  return (
    <Card>
      <ThemedView style={styles.row}>
        <ThemedText type="smallBold">{dish.name}</ThemedText>
        <ThemedText themeColor="textSecondary">{dish.calories_kcal ?? 0} kcal</ThemedText>
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        {dish.meal_type ? MEAL_LABELS[dish.meal_type] : 'Repas'} · P {dish.proteins_g ?? 0}g · G{' '}
        {dish.carbs_g ?? 0}g · L {dish.fats_g ?? 0}g
      </ThemedText>
    </Card>
  );
}

export default function MealsScreen() {
  const { meals, loading, error, refresh } = useMeals();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Mes repas</ThemedText>
          <Button label="+ Ajouter" onPress={() => router.push('/meal/add')} />
        </ThemedView>

        {loading ? (
          <Loader />
        ) : (
          <FlatList
            data={meals}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <MealRow dish={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {error || 'Aucun repas enregistré pour le moment.'}
              </ThemedText>
            }
          />
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: { gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
