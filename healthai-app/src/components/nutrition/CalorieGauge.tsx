// Jauge calorique du jour (compacte) : objectif vs calories déjà mangées.
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
      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Choisis un programme pour ton objectif calorique.
      </ThemedText>
    );
  }

  const ratio = target > 0 ? eaten / target : 0;
  const over = eaten > target;
  const remaining = Math.round(target - eaten);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          {Math.round(eaten)} / {Math.round(target)} kcal
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          {over ? `+${Math.abs(remaining)}` : `${remaining} restantes`}
        </ThemedText>
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
  wrap: { gap: Spacing.one },
  hint: { fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 12 },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});
