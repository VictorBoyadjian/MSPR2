// Récapitulatif du profil avant création du compte.
import { StyleSheet, Text, View } from 'react-native';

import { useGoals } from '@/hooks/useGoals';

import Heart from '../components/Heart';
import StepHeader from '../components/StepHeader';
import { BODY_FAT_OPTIONS, beatsToBpm, computeBmi, OnboardingData } from '../data';
import { accent, accentA, colors, tabular } from '../theme';

export default function SummaryStep({ data, firstName }: { data: OnboardingData; firstName?: string }) {
  const { items: goals } = useGoals();
  const bpm = beatsToBpm(data.beats);
  const fmt = (n: number) => n.toFixed(1).replace(/\.0$/, '');
  const genderLabels: Record<string, string> = { male: 'Homme', female: 'Femme', other: 'Autre' };
  const goal = goals.find((g) => g.id === data.goalId);
  const rows: [string, string][] = [
    ['Prénom', firstName || '—'],
    ['Âge', `${data.age} ans`],
    ['Genre', data.gender ? genderLabels[data.gender] : '—'],
    ['Taille', `${data.height} cm`],
    ['Poids', `${fmt(data.weight)} kg`],
    ['Sport', `${fmt(data.sport)} h / sem`],
    ['Masse grasse', data.bodyFat != null ? BODY_FAT_OPTIONS[data.bodyFat].label : '—'],
    ['IMC', `${computeBmi(data.weight, data.height)}`],
    ['Allergies', data.allergies.length ? `${data.allergies.length} sélectionnée(s)` : 'Aucune'],
    ['Handicaps', data.handicaps.length ? `${data.handicaps.length} sélectionné(s)` : 'Aucun'],
    ['Programme', goal ? (goal.label ?? goal.name) : '—'],
  ];

  return (
    <View>
      <StepHeader eyebrow="RÉCAPITULATIF" title="Voilà ton profil." />
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Heart size={18} color={accent} />
          <Text style={styles.heroTopTx}>RYTHME AU REPOS</Text>
        </View>
        <View style={styles.heroBpm}>
          <Text style={styles.heroBpmNum}>{bpm}</Text>
          <Text style={styles.heroBpmUnit}>BPM</Text>
        </View>
      </View>
      <View style={styles.sumList}>
        {rows.map(([k, v], idx) => (
          <View key={k} style={[styles.sumRow, idx === rows.length - 1 && styles.sumRowLast]}>
            <Text style={styles.sumK}>{k}</Text>
            <Text style={styles.sumV}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: accentA(0.1),
    borderWidth: 1,
    borderColor: accentA(0.26),
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTopTx: { fontWeight: '600', fontSize: 12.5, color: accent, letterSpacing: 1 },
  heroBpm: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 12 },
  heroBpmNum: { fontWeight: '600', fontSize: 64, color: colors.tx, lineHeight: 66, letterSpacing: -1, ...tabular },
  heroBpmUnit: { fontWeight: '600', fontSize: 18, color: colors.tx2, marginBottom: 8 },
  sumList: { borderWidth: 1, borderColor: colors.line, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.bg1 },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  sumRowLast: { borderBottomWidth: 0 },
  sumK: { fontSize: 14.5, color: colors.tx2 },
  sumV: { fontWeight: '600', fontSize: 15, color: colors.tx },
});
