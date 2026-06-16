import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Icon from '@/components/ui/Icon';
import { SessionMeta } from '@/components/workout/SessionMeta';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutSession } from '@/types/workout-sessions.type';

type Props = {
  session: WorkoutSession;
  onPress: () => void;
};

/** Résultat de recherche : nom de la séance + métadonnées + chevron. */
export function SessionResultRow({ session, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.body}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {session.name}
        </ThemedText>
        <SessionMeta session={session} />
      </View>
      <Icon name="chevron" size={18} color={theme.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  body: { flex: 1, gap: Spacing.one },
});
