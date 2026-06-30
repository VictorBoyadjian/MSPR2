// Étape programme : recommandation ML (/recommend) + choix d'un goal.
// Tous les goals sont affichés ; ceux classés par le moteur passent en premier,
// avec leur confidence en pourcentage. Le goal recommandé est présélectionné.
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useGoals } from '@/hooks/useGoals';
import { useRecommendation } from '@/hooks/useRecommendation';
import { orderGoals, rankByName } from '@/utils/recommendation';

import StepHeader from '../components/StepHeader';
import { buildRecommendInput, OnboardingData } from '../data';
import { accent, accentA, colors } from '../theme';

type ProgramStepProps = {
  data: OnboardingData;
  selectedGoalId: string | null;
  onSelect: (goalId: string) => void;
};

export default function ProgramStep({ data, selectedGoalId, onSelect }: ProgramStepProps) {
  // Input figé à l'entrée de l'étape : évite de relancer /recommend à chaque rendu.
  const [input] = useState(() => buildRecommendInput(data));
  const { items: goals, loading: goalsLoading, error: goalsError, refresh } = useGoals();
  const { data: reco, loading: recoLoading } = useRecommendation(input);

  // Classement issu du moteur : rang + confidence par nom de profil.
  const rank = useMemo(() => rankByName(reco), [reco]);
  const orderedGoals = useMemo(() => orderGoals(goals, rank), [goals, rank]);

  // Présélection du goal recommandé une fois la reco et les goals chargés.
  useEffect(() => {
    if (selectedGoalId || !reco || goals.length === 0) return;
    const recommended = goals.find((g) => g.name === reco.profile);
    if (recommended) onSelect(recommended.id);
  }, [selectedGoalId, reco, goals, onSelect]);

  const loading = goalsLoading || recoLoading;

  return (
    <View>
      <StepHeader
        eyebrow="TON PROGRAMME"
        title="Quel programme veux-tu suivre ?"
        sub="Proposition de programme selon notre modèle privé d'Intelligence artificielle. Tu peux en choisir un autre."
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={accent} />
        </View>
      ) : goalsError ? (
        <View style={styles.center}>
          <Text style={styles.error}>{goalsError}</Text>
          <Pressable onPress={refresh} style={styles.retry}>
            <Text style={styles.retryTx}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {orderedGoals.map((goal) => {
            const selected = selectedGoalId === goal.id;
            const score = rank.get(goal.name);
            const recommended = reco?.profile === goal.name;
            return (
              <Pressable
                key={goal.id}
                onPress={() => onSelect(goal.id)}
                style={[styles.cell, selected && styles.cellSel]}>
                <View style={styles.cellMain}>
                  <Text style={[styles.label, selected && styles.labelSel]}>
                    {goal.label ?? goal.name}
                  </Text>
                  {recommended ? <Text style={styles.tag}>Recommandé</Text> : null}
                </View>
                {score ? (
                  <Text style={[styles.pct, selected && styles.pctSel]}>
                    {Math.round(score.confidence * 100)}%
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 16 },
  error: { color: colors.tx2, fontSize: 14, textAlign: 'center' },
  retry: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1, borderColor: colors.line2 },
  retryTx: { color: colors.tx, fontSize: 14, fontWeight: '600' },
  list: { gap: 12 },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: colors.bg1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 16,
    gap: 12,
  },
  cellSel: { borderColor: accent, backgroundColor: accentA(0.09) },
  cellMain: { flex: 1, gap: 4 },
  label: { fontSize: 16, color: colors.tx2 },
  labelSel: { color: colors.tx, fontWeight: '600' },
  tag: { fontSize: 11.5, fontWeight: '600', color: accent, letterSpacing: 0.4 },
  pct: { fontSize: 16, fontWeight: '700', color: colors.tx2 },
  pctSel: { color: colors.tx },
});
