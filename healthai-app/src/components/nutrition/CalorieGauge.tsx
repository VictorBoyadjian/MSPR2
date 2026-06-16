// Jauge calorique du jour : objectif vs calories déjà mangées.
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Objectif calorique journalier, ou null si aucun programme/poids cible. */
  target: number | null;
  /** Calories déjà consommées dans la journée. */
  eaten: number;
};

const FILL_OK = '#30a46c';
const FILL_OVER = '#e5484d';

export default function CalorieGauge({ target, eaten }: Props) {
  const theme = useTheme();

  if (!target) {
    return (
      <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" themeColor="textSecondary">OBJECTIF DU JOUR</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Choisis un programme pour obtenir ton objectif calorique.
        </ThemedText>
      </View>
    );
  }

  const ratio = target > 0 ? eaten / target : 0;
  const over = eaten > target;
  const remaining = Math.round(target - eaten);

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.head}>
        <ThemedText type="smallBold" themeColor="textSecondary">OBJECTIF DU JOUR</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {over ? `${Math.abs(remaining)} kcal au-dessus` : `${remaining} kcal restantes`}
        </ThemedText>
      </View>

      <View style={styles.numbers}>
        <ThemedText type="title">{Math.round(eaten)}</ThemedText>
        <ThemedText type="subtitle" themeColor="textSecondary"> / {Math.round(target)} kcal</ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(1, Math.max(0, ratio)) * 100}%`,
              backgroundColor: over ? FILL_OVER : FILL_OK,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  numbers: { flexDirection: 'row', alignItems: 'baseline' },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});
