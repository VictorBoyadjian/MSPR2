import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DayNavigator from '@/components/meal/DayNavigator';
import MealList from '@/components/meal/MealList';
import CalorieGauge from '@/components/nutrition/CalorieGauge';
import MealRecommendations from '@/components/nutrition/MealRecommendations';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { MEAL_LABELS } from '@/constants/meals';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDishes } from '@/hooks/useDishes';
import { useGoals } from '@/hooks/useGoals';
import { useNutritionPlan } from '@/hooks/useNutritionPlan';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/authStore';
import { isSameDay, startOfDay } from '@/utils/day';
import { toNumber } from '@/utils/nutrition';

export default function MealsScreen() {
  const { dishes, loading, error, refresh } = useDishes();
  const { user } = useAuthStore();
  const { items: goals } = useGoals();
  const theme = useTheme();
  const router = useRouter();
  const [day, setDay] = useState(() => startOfDay(new Date()));

  const profile = useMemo(
    () => goals.find((g) => g.id === user?.goal_id)?.name ?? null,
    [goals, user?.goal_id],
  );
  const { calories, meals, mealType } = useNutritionPlan(profile);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const dayDishes = useMemo(
    () => dishes.filter((dish) => isSameDay(new Date(dish.eated_at ?? dish.created_at), day)),
    [dishes, day],
  );

  const eaten = useMemo(
    () => dayDishes.reduce((sum, d) => sum + (toNumber(d.calories_kcal) || 0), 0),
    [dayDishes],
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Nutrition</ThemedText>
          <Button label="+ Ajouter" onPress={() => router.push('/meal/add')} />
        </ThemedView>

        <DayNavigator value={day} onChange={setDay} />

        {loading ? (
          <Loader />
        ) : (
          <ScrollView style={styles.flex} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            <MealList dishes={dayDishes} />
            {dayDishes.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {error || 'Aucun repas ce jour-là.'}
              </ThemedText>
            ) : null}
          </ScrollView>
        )}

        {/* Bloc discret en bas : objectif calorique + idées de repas. */}
        <View style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}>
          <CalorieGauge target={calories?.daily_calories_target ?? null} eaten={eaten} />
          {meals.length > 0 ? (
            <View style={styles.reco}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.recoLabel}>
                Idées pour le {MEAL_LABELS[mealType].toLowerCase()}
              </ThemedText>
              <MealRecommendations meals={meals} />
            </View>
          ) : null}
        </View>
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
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  list: { gap: Spacing.three, paddingVertical: Spacing.three },
  empty: { textAlign: 'center', marginTop: Spacing.six },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset,
    gap: Spacing.two,
  },
  reco: { gap: Spacing.one },
  recoLabel: { fontSize: 11 },
});
