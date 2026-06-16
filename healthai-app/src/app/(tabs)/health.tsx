import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RestingHrEditorModal from '@/components/health/RestingHrEditorModal';
import WeeklySportChart from '@/components/health/WeeklySportChart';
import WeightEditorModal from '@/components/health/WeightEditorModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHealth } from '@/hooks/useHealth';
import { useAuthStore } from '@/stores/authStore';

const DEFAULT_WEIGHT = 70;
const DEFAULT_RESTING_BPM = 70;

export default function HealthScreen() {
  const { user } = useAuthStore();
  const { stats, metric, loading, error, refresh, save } = useHealth();
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingHr, setEditingHr] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Le poids et le pouls affichés viennent de la dernière métrique, avec repli sur le profil.
  const weight = metric?.weight_kg ?? user?.weight_kg ?? null;
  const restingHr = metric?.heart_rate_resting ?? user?.rest_bpm ?? null;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Santé</ThemedText>
        </ThemedView>

        {loading ? (
          <Loader />
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {error ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                {error}
              </ThemedText>
            ) : null}

            <Card style={styles.card}>
              <View style={styles.cardHead}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  SPORT CETTE SEMAINE
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  heures / jour
                </ThemedText>
              </View>
              {stats ? <WeeklySportChart week={stats.week} /> : null}
            </Card>

            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  Moyenne hebdo
                </ThemedText>
                <ThemedText type="title" style={styles.statValue}>
                  {stats ? formatHours(stats.weekly_average_hours) : '—'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  h de sport / semaine
                </ThemedText>
              </Card>

              <Pressable style={styles.statCard} onPress={() => setEditingHr(true)}>
                <Card style={styles.statCardFill}>
                  <ThemedText type="small" themeColor="textSecondary">
                    ❤️ Pouls au repos
                  </ThemedText>
                  <ThemedText type="title" style={styles.statValue}>
                    {restingHr ?? '—'}
                  </ThemedText>
                  <ThemedText type="smallBold" themeColor="textSecondary">
                    Mesurer ›
                  </ThemedText>
                </Card>
              </Pressable>
            </View>

            <Pressable onPress={() => setEditingWeight(true)}>
              <Card style={styles.weightCard}>
                <View style={styles.weightText}>
                  <ThemedText type="small" themeColor="textSecondary">
                    ⚖️ Poids
                  </ThemedText>
                  <ThemedText type="title" style={styles.statValue}>
                    {weight != null ? `${formatWeight(weight)} kg` : '—'}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  Modifier ›
                </ThemedText>
              </Card>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>

      <WeightEditorModal
        visible={editingWeight}
        initial={weight ?? DEFAULT_WEIGHT}
        onClose={() => setEditingWeight(false)}
        onSave={async (weightKg) => {
          await save({ weight_kg: weightKg });
        }}
      />

      <RestingHrEditorModal
        visible={editingHr}
        initialBpm={restingHr ?? DEFAULT_RESTING_BPM}
        onClose={() => setEditingHr(false)}
        onSave={async (restingBpm) => {
          await save({ heart_rate_resting: restingBpm });
        }}
      />
    </ThemedView>
  );
}

/** Nombre compact à la française (ex. « 3,5 » ou « 4 »). */
function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace('.', ',');
}

function formatWeight(kg: number): string {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1).replace('.', ',');
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  content: { gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  card: { gap: Spacing.three },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statCard: { flex: 1, gap: Spacing.half },
  statCardFill: { flex: 1, gap: Spacing.half },
  statValue: { fontSize: 36, lineHeight: 42 },
  weightCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weightText: { gap: Spacing.half },
  empty: { textAlign: 'center', marginVertical: Spacing.two },
});
