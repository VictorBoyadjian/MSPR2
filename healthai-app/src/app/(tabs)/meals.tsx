import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DayNavigator from '@/components/meal/DayNavigator';
import MealList from '@/components/meal/MealList';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDishes } from '@/hooks/useDishes';
import { isSameDay, startOfDay } from '@/utils/day';

export default function MealsScreen() {
  const { dishes, loading, error, refresh } = useDishes();
  const router = useRouter();
  const [day, setDay] = useState(() => startOfDay(new Date()));

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const dayDishes = useMemo(
    () => dishes.filter((dish) => isSameDay(new Date(dish.eated_at ?? dish.created_at), day)),
    [dishes, day],
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Mes repas</ThemedText>
          <Button label="+ Ajouter" onPress={() => router.push('/meal/add')} />
        </ThemedView>

        <ThemedView style={styles.panel}>
          <DayNavigator value={day} onChange={setDay} />

          {loading ? (
            <Loader />
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              <MealList dishes={dayDishes} />
              {dayDishes.length === 0 ? (
                <ThemedText themeColor="textSecondary" style={styles.empty}>
                  {error || 'Aucun repas ce jour-là.'}
                </ThemedText>
              ) : null}
            </ScrollView>
          )}
        </ThemedView>
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
  panel: {
    height: '52%',
    backgroundColor: 'transparent',
    borderRadius: Spacing.three,
  },
  list: { gap: Spacing.three, paddingVertical: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  empty: { textAlign: 'center', marginTop: Spacing.six },
});
