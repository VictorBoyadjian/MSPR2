import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Icon from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  /** Titre affiché à côté du bouton retour. */
  title?: string;
  /** Action du bouton retour (défaut : `router.back()`). */
  onBack?: () => void;
};

/** En-tête d'écran avec bouton retour, pour les écrans sans header natif. */
export default function ScreenHeader({ title, onBack }: Props) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
        ]}>
        <Icon name="back" size={22} color={theme.text} />
      </Pressable>
      {title ? (
        <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
});
