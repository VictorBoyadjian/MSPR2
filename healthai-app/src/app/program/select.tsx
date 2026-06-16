// Écran de changement de programme : rappelle /recommend avec les stats actuelles
// de l'utilisateur, affiche les goals classés, sauvegarde le choix puis revient au profil.
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useGoals } from '@/hooks/useGoals';
import { useRecommendation } from '@/hooks/useRecommendation';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';
import { userService } from '@/services/userService';
import { buildRecommendInputFromUser, orderGoals, rankByName } from '@/utils/recommendation';

export default function ProgramSelectScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, refreshUser } = useAuth();

  // Input figé à l'entrée : évite de relancer /recommend à chaque rendu.
  const [input] = useState(() => (user ? buildRecommendInputFromUser(user) : null));
  const { items: goals, loading: goalsLoading, error: goalsError, refresh } = useGoals();
  const { data: reco, loading: recoLoading } = useRecommendation(input);

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(user?.goal_id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const rank = useMemo(() => rankByName(reco), [reco]);
  const orderedGoals = useMemo(() => orderGoals(goals, rank), [goals, rank]);

  // Présélection du goal recommandé si l'utilisateur n'en a pas encore.
  useEffect(() => {
    if (selectedGoalId || !reco || goals.length === 0) return;
    const recommended = goals.find((g) => g.name === reco.profile);
    if (recommended) setSelectedGoalId(recommended.id);
  }, [selectedGoalId, reco, goals]);

  const onSave = async () => {
    if (!selectedGoalId) return;
    setError('');
    setSaving(true);
    try {
      await userService.update({ goal_id: Number(selectedGoalId) });
      await refreshUser();
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
      setSaving(false);
    }
  };

  if (!user) return <Loader />;

  const loading = goalsLoading || recoLoading;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <ThemedText type="subtitle">‹</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Changer de programme</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" style={styles.sub}>
          Classés selon ton profil actuel. Choisis celui que tu veux suivre.
        </ThemedText>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.text} />
            </View>
          ) : goalsError ? (
            <View style={styles.center}>
              <ThemedText type="small" themeColor="textSecondary">{goalsError}</ThemedText>
              <Button label="Réessayer" variant="secondary" onPress={refresh} />
            </View>
          ) : (
            orderedGoals.map((goal) => {
              const selected = selectedGoalId === goal.id;
              const score = rank.get(goal.name);
              const recommended = reco?.profile === goal.name;
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => setSelectedGoalId(goal.id)}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                      borderColor: selected ? theme.text : 'transparent',
                    },
                  ]}>
                  <View style={styles.cellMain}>
                    <ThemedText type="smallBold">{goal.label ?? goal.name}</ThemedText>
                    {recommended ? (
                      <ThemedText type="small" themeColor="textSecondary">Recommandé</ThemedText>
                    ) : null}
                  </View>
                  {score ? (
                    <ThemedText type="smallBold">{Math.round(score.confidence * 100)}%</ThemedText>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <View style={styles.footer}>
          {error ? <ThemedText type="small" style={styles.error}>{error}</ThemedText> : null}
          <Button label="Enregistrer" onPress={onSave} loading={saving} disabled={!selectedGoalId} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  back: { paddingRight: Spacing.one },
  sub: { marginTop: Spacing.one },
  content: { gap: Spacing.two, paddingTop: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: Spacing.three },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1.5,
    gap: Spacing.three,
  },
  cellMain: { flex: 1, gap: 2 },
  footer: { paddingTop: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },
  error: { color: '#e5484d' },
});
