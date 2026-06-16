import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Card from '@/components/ui/Card';
import ExerciseRow from '@/components/workout/ExerciseRow';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutExercise } from '@/types/workout-exercises.type';

type Props = {
  exercises: WorkoutExercise[];
  loading?: boolean;
};

/** Liste des exercices d'une séance, séparés par un filet (états chargement/vide). */
export function SessionExerciseList({ exercises, loading }: Props) {
  const theme = useTheme();

  if (loading) return <ActivityIndicator />;

  if (exercises.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        Aucun exercice pour cette séance.
      </ThemedText>
    );
  }

  return (
    <Card style={styles.list}>
      {exercises.map((exercise, index) => (
        <View key={exercise.id}>
          {index > 0 ? (
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          ) : null}
          <ExerciseRow exercise={exercise} index={index} />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.three },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.three,
  },
});
