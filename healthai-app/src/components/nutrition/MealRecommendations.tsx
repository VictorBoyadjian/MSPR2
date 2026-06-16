// Recommandations de repas en pile de cartes : une seule carte visible, la suivante
// apparaît derrière. On balaie la carte du dessus sur le côté pour passer à la suivante (infini).
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RecommendedMeal } from '@/types/nutrition.type';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const CARD_H = 78;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MealCardBody({ meal }: { meal: RecommendedMeal }) {
  return (
    <>
      <ThemedText type="small" numberOfLines={2} style={styles.name}>
        {meal.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
        {Math.round(meal.calories_kcal)} kcal · P{Math.round(meal.proteins_g)} G{Math.round(meal.carbs_g)} L{Math.round(meal.fats_g)}
      </ThemedText>
    </>
  );
}

export default function MealRecommendations({ meals }: { meals: RecommendedMeal[] }) {
  const theme = useTheme();
  const [deck, setDeck] = useState<RecommendedMeal[]>([]);
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

  // Réinitialise (ordre aléatoire) quand la liste source change.
  useEffect(() => {
    setDeck(meals.length ? shuffle(meals) : []);
    setIndex(0);
    position.setValue({ x: 0, y: 0 });
  }, [meals, position]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
          const toX = g.dx > 0 ? width * 1.3 : -width * 1.3;
          Animated.timing(position, {
            toValue: { x: toX, y: g.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            position.setValue({ x: 0, y: 0 });
            setIndex((i) => i + 1); // boucle infinie via modulo
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  if (!deck.length) return null;

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-7deg', '0deg', '7deg'],
  });
  const dragMag = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });
  const backScale = dragMag.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const backTranslateY = dragMag.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const backOpacity = dragMag.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  const front = deck[index % deck.length];
  const back = deck[(index + 1) % deck.length];
  const cardBg = { backgroundColor: theme.backgroundElement };

  return (
    <View style={styles.stack}>
      {/* Carte suivante, derrière, qui grandit à mesure que la carte du dessus part. */}
      <Animated.View
        key={`back-${index}`}
        style={[
          styles.card,
          cardBg,
          { transform: [{ scale: backScale }, { translateY: backTranslateY }], opacity: backOpacity },
        ]}>
        <MealCardBody meal={back} />
      </Animated.View>

      {/* Carte du dessus, balayable. */}
      <Animated.View
        key={`front-${index}`}
        {...panResponder.panHandlers}
        style={[
          styles.card,
          cardBg,
          { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
        ]}>
        <MealCardBody meal={front} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { height: CARD_H + 10, justifyContent: 'flex-start' },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CARD_H,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: 4,
    justifyContent: 'center',
  },
  name: { fontSize: 12.5, fontWeight: '600' },
  meta: { fontSize: 11 },
});
