import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Libellé du programme actuel, ou null si aucun n'est défini. */
  label: string | null;
  /** Poids cible (kg) associé au programme. L'API peut le renvoyer en chaîne. */
  targetWeight: number | string | null;
  onPress: () => void;
};

export default function ProgramBanner({ label, targetWeight, onPress }: Props) {
  const theme = useTheme();
  // L'API sérialise les FLOAT en chaîne : on normalise avant formatage.
  const weight = targetWeight != null ? Number(targetWeight) : NaN;
  const hasWeight = Number.isFinite(weight);
  const fmtWeight = (w: number) => `${w.toFixed(1).replace(/\.0$/, '')} kg`;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.text}>
        <ThemedText type="small" themeColor="textSecondary">MON PROGRAMME</ThemedText>
        <ThemedText type="subtitle">{label ?? 'Aucun programme'}</ThemedText>
      </View>
      {label && hasWeight ? (
        <View style={styles.target}>
          <ThemedText type="small" themeColor="textSecondary">Poids cible</ThemedText>
          <ThemedText type="smallBold">{fmtWeight(weight)}</ThemedText>
        </View>
      ) : null}
      <ThemedText type="small" themeColor="accentText" style={styles.cta}>
        {label ? 'Changer de programme →' : 'Choisir un programme →'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  text: { gap: Spacing.half },
  target: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cta: { fontWeight: '600' },
});
