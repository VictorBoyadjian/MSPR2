// Déroulé d'une séance : un exercice par page, balayage horizontal (pagination).
// Les exercices sont rechargés depuis l'id de la séance (le pivot porte sets/reps/repos).
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Loader from '@/components/ui/Loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSessionExercises } from '@/hooks/useSessionExercises';
import { useTheme } from '@/hooks/use-theme';
import { WorkoutExercise } from '@/types/workout-exercises.type';
import { exerciseMeta, exercisePrescription, exerciseRest } from '@/utils/exerciseFormat';

export default function RunWorkoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ workoutSessionId: string; name: string }>();
  const { exercises, loading, error } = useSessionExercises(params.workoutSessionId);

  const listRef = useRef<FlatList<WorkoutExercise>>(null);
  const [index, setIndex] = useState(0);
  const total = exercises.length;

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(total - 1, i));
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    },
    [total],
  );

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const renderItem = ({ item }: { item: WorkoutExercise }) => (
    <ExercisePage exercise={item} width={width} />
  );

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.title}>
            {params.name}
          </ThemedText>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Icon name="close" size={24} color={theme.text} />
          </Pressable>
        </ThemedView>

        {loading ? (
          <Loader />
        ) : error || total === 0 ? (
          <View style={styles.center}>
            <ThemedText type="small" themeColor="textSecondary">
              {error || 'Aucun exercice pour cette séance.'}
            </ThemedText>
          </View>
        ) : (
          <>
            <FlatList
              ref={listRef}
              data={exercises}
              keyExtractor={(ex) => ex.id}
              renderItem={renderItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
              getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            />

            <ThemedView style={styles.footer}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.progress}>
                Exercice {index + 1} / {total}
              </ThemedText>
              <View style={styles.dots}>
                {exercises.map((ex, i) => (
                  <View
                    key={ex.id}
                    style={[
                      styles.dot,
                      { backgroundColor: i === index ? theme.text : theme.backgroundSelected },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.nav}>
                {index > 0 ? (
                  <View style={styles.navButton}>
                    <Button label="Précédent" variant="secondary" onPress={() => goTo(index - 1)} />
                  </View>
                ) : null}
                <View style={styles.navButton}>
                  {index < total - 1 ? (
                    <Button label="Suivant" onPress={() => goTo(index + 1)} />
                  ) : (
                    <Button label="Terminer" onPress={() => router.back()} />
                  )}
                </View>
              </View>
            </ThemedView>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

/** Page plein écran d'un exercice avec son détail complet. */
function ExercisePage({ exercise, width }: { exercise: WorkoutExercise; width: number }) {
  const theme = useTheme();
  const meta = exerciseMeta(exercise);
  const prescription = exercisePrescription(exercise);
  const rest = exerciseRest(exercise);
  const notes = exercise.pivot?.notes;

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}>
      <ThemedText type="subtitle" style={styles.exerciseName}>
        {exercise.name}
      </ThemedText>
      {meta ? (
        <ThemedText type="small" themeColor="textSecondary">
          {meta}
        </ThemedText>
      ) : null}

      <View style={styles.statsRow}>
        {prescription ? (
          <View style={[styles.stat, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">{prescription}</ThemedText>
          </View>
        ) : null}
        {rest ? (
          <View style={[styles.stat, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="smallBold">Repos {rest}</ThemedText>
          </View>
        ) : null}
      </View>

      {notes ? (
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Consignes
          </ThemedText>
          <ThemedText type="default">{notes}</ThemedText>
        </View>
      ) : null}

      {exercise.description ? (
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Description
          </ThemedText>
          <ThemedText type="default">{exercise.description}</ThemedText>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  title: { flex: 1, marginRight: Spacing.three },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  page: { padding: Spacing.four, gap: Spacing.three },
  exerciseName: { lineHeight: 40 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  stat: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  section: { gap: Spacing.one },
  footer: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.three },
  progress: { textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.one, flexWrap: 'wrap' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  nav: { flexDirection: 'row', gap: Spacing.three, paddingBottom: Spacing.three },
  navButton: { flex: 1 },
});
