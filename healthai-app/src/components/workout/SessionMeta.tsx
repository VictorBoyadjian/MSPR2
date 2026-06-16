import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Icon, { IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutSession } from '@/types/workout-sessions.type';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Props = {
  session: Partial<
    Pick<WorkoutSession, 'total_duration_min' | 'difficulty' | 'session_type' | 'exercises'>
  >;
  /** Nombre d'exercices, si la relation `exercises` n'est pas chargée. */
  exerciseCount?: number;
};

/** Pastilles de métadonnées d'une séance (durée, exercices, difficulté, type). */
export function SessionMeta({ session, exerciseCount }: Props) {
  const theme = useTheme();
  const count = exerciseCount ?? session.exercises?.length;

  const pills: { icon: IconName; label: string }[] = [];
  if (session.total_duration_min) {
    pills.push({ icon: 'time', label: `${session.total_duration_min} min` });
  }
  if (count) {
    pills.push({ icon: 'workouts', label: `${count} exercice${count > 1 ? 's' : ''}` });
  }
  if (session.difficulty) {
    pills.push({ icon: 'flame', label: cap(session.difficulty) });
  }
  if (session.session_type) {
    pills.push({ icon: 'list', label: cap(session.session_type) });
  }

  if (pills.length === 0) return null;

  return (
    <View style={styles.row}>
      {pills.map((pill) => (
        <View key={pill.label} style={[styles.pill, { backgroundColor: theme.backgroundSelected }]}>
          <Icon name={pill.icon} size={13} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {pill.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: 2,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.five,
  },
});
