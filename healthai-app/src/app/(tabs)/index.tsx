import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon, { IconName } from '@/components/ui/Icon';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useCoachMessage } from '@/hooks/useCoachMessage';
import { useTheme } from '@/hooks/use-theme';
import { useDishes } from '@/hooks/useDishes';
import { useWorkouts } from '@/hooks/useWorkouts';
import { isSameDay } from '@/utils/day';
import { formatDuration } from '@/utils/formatDate';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { dishes, refresh: refreshDishes } = useDishes();
  const { sessions, refresh: refreshWorkouts } = useWorkouts();
  const { message: coachMessage, loading: coachLoading } = useCoachMessage();

  useFocusEffect(
    useCallback(() => {
      refreshDishes();
      refreshWorkouts();
    }, [refreshDishes, refreshWorkouts]),
  );

  const mealSummary = useMemo(() => {
    const today = new Date();
    const todayDishes = dishes.filter((dish) =>
      isSameDay(new Date(dish.eated_at ?? dish.created_at), today),
    );
    return {
      count: todayDishes.length,
      calories: todayDishes.reduce((sum, d) => sum + (Number(d.calories_kcal) || 0), 0),
      proteins: todayDishes.reduce((sum, d) => sum + (Number(d.proteins_g) || 0), 0),
      carbs: todayDishes.reduce((sum, d) => sum + (Number(d.carbs_g) || 0), 0),
      fats: todayDishes.reduce((sum, d) => sum + (Number(d.fats_g) || 0), 0),
    };
  }, [dishes]);

  const sportSummary = useMemo(() => {
    const today = new Date();
    const todaySessions = sessions.filter((s) =>
      s.performedAt ? isSameDay(new Date(s.performedAt), today) : false,
    );
    return {
      count: todaySessions.length,
      minutes: todaySessions.reduce((sum, s) => sum + (Number(s.total_duration_min) || 0), 0),
    };
  }, [sessions]);

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ThemedView style={styles.greeting}>
          <ThemedText themeColor="textSecondary">Bonjour,</ThemedText>
          <ThemedText type="subtitle">{user?.first_name ?? 'Athlète'}</ThemedText>
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            AUJOURD&apos;HUI
          </ThemedText>

          <ThemedView style={styles.summaryRow}>
            <SummaryCard
              icon="meals"
              title="Repas"
              value={String(mealSummary.count)}
              caption={`${Math.round(mealSummary.calories)} kcal`}
              onPress={() => router.push('/meals')}
            />
            <SummaryCard
              icon="workouts"
              title="Séances"
              value={String(sportSummary.count)}
              caption={sportSummary.minutes ? formatDuration(sportSummary.minutes) : 'Aucune'}
              onPress={() => router.push('/workouts')}
            />
          </ThemedView>

          <Card style={{ backgroundColor: 'transparent'}}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Macros du jour
            </ThemedText>
            <ThemedView style={styles.macros}>
              <Macro label="Protéines" value={`${Math.round(mealSummary.proteins)} g`} />
              <Macro label="Glucides" value={`${Math.round(mealSummary.carbs)} g`} />
              <Macro label="Lipides" value={`${Math.round(mealSummary.fats)} g`} />
            </ThemedView>
          </Card>

          <ThemedView style={styles.actions}>
            <Button icon="meals" label="Enregistrer un repas" onPress={() => router.push('/meal/add')} />
            <Button
              icon="workouts"
              label="Nouvelle séance"
              variant="secondary"
              onPress={() => router.push('/workout/add')}
            />
          </ThemedView>

          <CoachMessageCard message={coachMessage} loading={coachLoading} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  caption,
  onPress,
}: {
  icon: IconName;
  title: string;
  value: string;
  caption: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable style={styles.summaryCardPressable} onPress={onPress}>
      <Card style={styles.summaryCard}>
        <ThemedView style={styles.summaryTitle}>
          <Icon name={icon} size={16} color={theme.textSecondary} />
          <ThemedText themeColor="textSecondary">{title}</ThemedText>
        </ThemedView>
        <ThemedText type="title" style={styles.summaryValue}>
          {value}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {caption}
        </ThemedText>
      </Card>
    </Pressable>
  );
}

function CoachMessageCard({ message, loading }: { message: string | null; loading: boolean }) {
  const theme = useTheme();

  // Tant qu'aucun message n'est disponible pour aujourd'hui (et qu'on n'est pas en
  // train d'en générer un), on n'affiche pas la carte.
  if (!message && !loading) return null;

  return (
    <Card style={styles.coachCard}>
      <ThemedView style={styles.coachHeader}>
        <Icon name="coach" size={18} color={theme.accent} />
        <ThemedText type="smallBold" themeColor="textSecondary">
          MESSAGE DU COACH · IA
        </ThemedText>
      </ThemedView>
      {message ? (
        <ThemedText style={styles.coachText}>{message}</ThemedText>
      ) : (
        <ThemedView style={styles.coachLoading}>
          <ActivityIndicator color={theme.accent} />
          <ThemedText type="small" themeColor="textSecondary">
            Ton coach prépare son message…
          </ThemedText>
        </ThemedView>
      )}
    </Card>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundSelected" style={styles.macro}>
      <ThemedText type="smallBold">{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  greeting: { gap: Spacing.one, marginBottom: Spacing.four },
  content: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  summaryCardPressable: { flex: 1 },
  summaryCard: {
    gap: Spacing.half,
  },
  summaryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  summaryValue: {
    fontSize: 40,
    lineHeight: 44,
  },
  macros: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
    backgroundColor: 'transparent',
  },
  macro: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.half,
  },
  actions: { gap: Spacing.three, marginTop: Spacing.two },
  coachCard: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  coachText: {
    lineHeight: 22,
  },
  coachLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'transparent',
  },
});
