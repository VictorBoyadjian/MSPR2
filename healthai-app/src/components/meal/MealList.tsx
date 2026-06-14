import { StyleSheet } from 'react-native';

import MealCard from '@/components/meal/MealCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MEAL_LABELS, MEAL_TYPE_ORDER } from '@/constants/meals';
import { Spacing } from '@/constants/theme';
import { Dish } from '@/services/api';

export default function MealList({ dishes }: { dishes: Dish[] }) {
  const sections = MEAL_TYPE_ORDER.map((type) => ({
    type,
    items: dishes.filter((dish) => dish.meal_type === type),
  })).filter((section) => section.items.length > 0);

  return (
    <ThemedView style={styles.container}>
      {sections.map((section) => (
        <ThemedView key={section.type} style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {MEAL_LABELS[section.type]}
          </ThemedText>
          {section.items.map((dish) => (
            <MealCard key={dish.id} dish={dish} />
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  section: { gap: Spacing.two },
});
