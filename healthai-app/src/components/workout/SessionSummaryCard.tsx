import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Card from '@/components/ui/Card';
import { SessionMeta } from '@/components/workout/SessionMeta';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutSession } from '@/types/workout-sessions.type';

type Props = {
  session: { name: string } & Partial<
    Pick<WorkoutSession, 'total_duration_min' | 'difficulty' | 'session_type' | 'objective' | 'exercises'>
  >;
  /** Nombre d'exercices, si la relation `exercises` n'est pas chargée. */
  exerciseCount?: number;
  /** Action secondaire en haut à droite (ex. « Changer »). */
  action?: { label: string; onPress: () => void };
  children?: ReactNode;
};

/** En-tête d'une séance sélectionnée : nom, métadonnées, objectif. */
export function SessionSummaryCard({ session, exerciseCount, action, children }: Props) {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.name}>
          {session.name}
        </ThemedText>
        {action ? (
          <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
            <ThemedText type="small" style={{ color: theme.accentText, fontWeight: '600' }}>
              {action.label}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <SessionMeta session={session} exerciseCount={exerciseCount} />

      {session.objective ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
          {session.objective}
        </ThemedText>
      ) : null}

      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: { flex: 1 },
});
