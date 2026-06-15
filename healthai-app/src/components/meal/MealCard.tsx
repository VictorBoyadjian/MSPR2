import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/ui/Card';
import { Dish } from '@/services/api';

export default function MealCard({ dish }: { dish: Dish }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/meal/${dish.id}`)}
      style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <ThemedView style={styles.row}>
          <ThemedText type="smallBold">{dish.name}</ThemedText>
          <ThemedText themeColor="textSecondary">{dish.calories_kcal ?? 0} kcal</ThemedText>
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          P {dish.proteins_g ?? 0}g · G {dish.carbs_g ?? 0}g · L {dish.fats_g ?? 0}g
        </ThemedText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pressed: { opacity: 0.5 },
});
