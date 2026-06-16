import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Libellé du programme actuel, ou null si aucun n'est défini. */
  label: string | null;
  onPress: () => void;
};

export default function ProgramBanner({ label, onPress }: Props) {
  const theme = useTheme();
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
      <ThemedText type="small" themeColor="textSecondary">
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
});
