import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutExercise } from '@/types/workout-exercises.type';
import { exerciseMeta, exercisePrescription, exerciseRest } from '@/utils/exerciseFormat';

/** Ligne compacte d'un exercice dans la liste d'une séance. */
export default function ExerciseRow({
  exercise,
  index,
}: {
  exercise: WorkoutExercise;
  index: number;
}) {
  const theme = useTheme();
  const meta = exerciseMeta(exercise);
  const prescription = exercisePrescription(exercise);
  const rest = exerciseRest(exercise);
  const subtitle = [prescription, rest ? `repos ${rest}` : null].filter(Boolean).join(' · ');

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
        <ThemedText type="smallBold">{index + 1}</ThemedText>
      </View>
      <View style={styles.body}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {exercise.name}
        </ThemedText>
        {meta ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {meta}
          </ThemedText>
        ) : null}
        {subtitle ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
});
