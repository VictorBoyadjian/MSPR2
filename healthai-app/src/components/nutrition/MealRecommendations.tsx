// Recommandations de repas en cartes horizontales balayables à l'infini.
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RecommendedMeal } from '@/types/nutrition.type';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(300, width * 0.78);
const GAP = Spacing.three;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MealRecommendations({ meals }: { meals: RecommendedMeal[] }) {
  const theme = useTheme();
  const [data, setData] = useState<RecommendedMeal[]>([]);

  // Réinitialise (ordre aléatoire) quand la liste source change.
  useEffect(() => {
    setData(meals.length ? shuffle(meals) : []);
  }, [meals]);

  if (!meals.length) return null;

  // Balayage infini : on ajoute un nouveau lot mélangé en fin de liste,
  // en gardant une fenêtre bornée pour éviter une croissance illimitée.
  const appendMore = () =>
    setData((prev) => {
      const next = [...prev, ...shuffle(meals)];
      return next.length > 60 ? next.slice(next.length - 40) : next;
    });

  return (
    <FlatList
      data={data}
      keyExtractor={(item, i) => `${item.name}-${i}`}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_W + GAP}
      decelerationRate="fast"
      contentContainerStyle={styles.list}
      onEndReachedThreshold={0.5}
      onEndReached={appendMore}
      renderItem={({ item }) => (
        <View style={[styles.card, { width: CARD_W, backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="smallBold" numberOfLines={2} style={styles.name}>
            {item.name}
          </ThemedText>
          <View style={styles.kcalRow}>
            <ThemedText type="subtitle">{Math.round(item.calories_kcal)}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary"> kcal</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            P {Math.round(item.proteins_g)}g · G {Math.round(item.carbs_g)}g · L {Math.round(item.fats_g)}g
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {item.allergens.length ? `Contient : ${item.allergens.join(', ')}` : 'Sans allergène'}
          </ThemedText>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: GAP, paddingVertical: Spacing.one },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  name: { minHeight: 40 },
  kcalRow: { flexDirection: 'row', alignItems: 'baseline' },
});
