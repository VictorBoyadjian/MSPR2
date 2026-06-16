// Recommandations de séances en pile de cartes : une seule carte visible, la suivante
// apparaît derrière. On balaie la carte du dessus sur le côté pour passer à la suivante
// (infini) ; un simple tap ouvre la page de planification de la séance.
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RecommendedSession } from '@/types/workout-sessions.type';

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

function SessionCardBody({ session }: { session: RecommendedSession }) {
  const meta = [
    session.session_type,
    session.total_duration_min ? `${session.total_duration_min} min` : null,
    session.difficulty,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <>
      <ThemedText type="small" numberOfLines={2} style={styles.name}>
        {session.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
        {meta}
      </ThemedText>
    </>
  );
}

export default function SessionRecommendations({
  sessions,
  onPress,
}: {
  sessions: RecommendedSession[];
  onPress: (session: RecommendedSession) => void;
}) {
  const theme = useTheme();
  const [deck, setDeck] = useState<RecommendedSession[]>([]);
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  // La carte n'est cliquable que lorsqu'elle est à sa position de repos (pas en plein
  // balayage / animation) : évite un clic parasite après un drag, surtout sur le web.
  const atRest = useRef(true);

  // Réinitialise (ordre aléatoire) quand la liste source change.
  useEffect(() => {
    setDeck(sessions.length ? shuffle(sessions) : []);
    setIndex(0);
    position.setValue({ x: 0, y: 0 });
  }, [sessions, position]);

  useEffect(() => {
    const id = position.addListener(({ x, y }) => {
      atRest.current = Math.abs(x) < 1 && Math.abs(y) < 1;
    });
    return () => position.removeListener(id);
  }, [position]);

  const panResponder = useRef(
    PanResponder.create({
      // Ne prend la main que sur un vrai balayage : un tap reste géré par le Pressable.
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
          { transform: [{ scale: backScale }, { translateY: backTranslateY }], opacity: backOpacity },
        ]}>
        <View style={[styles.cardInner, cardBg]}>
          <SessionCardBody session={back} />
        </View>
      </Animated.View>

      {/* Carte du dessus, balayable (swipe) et cliquable (tap → planification). */}
      <Animated.View
        key={`front-${index}`}
        {...panResponder.panHandlers}
        style={[
          styles.card,
          { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
        ]}>
        <Pressable
          onPress={() => atRest.current && onPress(front)}
          style={[styles.cardInner, cardBg]}>
          <SessionCardBody session={front} />
        </Pressable>
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
    borderRadius: Spacing.two,
  },
  cardInner: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: 4,
    justifyContent: 'center',
    userSelect: 'none',
  },
  name: { fontSize: 12.5, fontWeight: '600', userSelect: 'none' },
  meta: { fontSize: 11, userSelect: 'none' },
});
