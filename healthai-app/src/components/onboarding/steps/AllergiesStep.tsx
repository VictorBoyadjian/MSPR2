// Étape allergies : liste depuis l'API, sélection multiple.
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAllergies } from '@/hooks/useAllergies';

import StepHeader from '../components/StepHeader';
import { accent, accentA, colors } from '../theme';

type AllergiesStepProps = {
  selected: string[];
  onToggle: (id: string) => void;
};

export default function AllergiesStep({ selected, onToggle }: AllergiesStepProps) {
  const { items, loading, error, refresh } = useAllergies();

  return (
    <View>
      <StepHeader
        eyebrow="ÉTAPE 7"
        title="Des allergies ?"
        sub="Sélectionne celles qui te concernent. Tu peux ne rien cocher."
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retry}>
            <Text style={styles.retryTx}>Réessayer</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.empty}>Aucune allergie disponible.</Text>
      ) : (
        <View style={styles.grid}>
          {items.map((allergy) => {
            const isSelected = selected.includes(allergy.id);
            return (
              <Pressable
                key={allergy.id}
                onPress={() => onToggle(allergy.id)}
                style={[styles.chip, isSelected && styles.chipSel]}>
                <Text style={[styles.chipTx, isSelected && styles.chipTxSel]}>
                  {allergy.name ?? 'Sans nom'}
                </Text>
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
  empty: { color: colors.tx3, fontSize: 14, paddingVertical: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.bg1,
  },
  chipSel: { borderColor: accent, backgroundColor: accentA(0.12) },
  chipTx: { fontSize: 14.5, color: colors.tx2 },
  chipTxSel: { color: colors.tx, fontWeight: '600' },
});
