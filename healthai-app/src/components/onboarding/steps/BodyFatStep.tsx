// Étape masse grasse : choix d'une silhouette parmi 6 tranches.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BodySilhouette from '../components/BodySilhouette';
import StepHeader from '../components/StepHeader';
import { BODY_FAT_OPTIONS } from '../data';
import { accent, accentA, colors, tabular } from '../theme';

type BodyFatStepProps = {
  value: number | null;
  onChange: (index: number) => void;
};

export default function BodyFatStep({ value, onChange }: BodyFatStepProps) {
  return (
    <View>
      <StepHeader
        eyebrow="ÉTAPE 5"
        title="Quelle silhouette te ressemble ?"
        sub="Une estimation suffit, tu pourras l'ajuster plus tard."
      />
      <View style={styles.grid}>
        {BODY_FAT_OPTIONS.map((opt, i) => {
          const selected = value === i;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onChange(i)}
              style={[styles.cell, selected && styles.cellSel]}>
              <BodySilhouette level={i} height={76} color={selected ? accent : '#6f7682'} />
              <Text style={[styles.pct, selected && styles.pctSel]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '31.5%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 13,
    gap: 10,
    backgroundColor: colors.bg1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 18,
  },
  cellSel: { borderColor: accent, backgroundColor: accentA(0.09) },
  pct: { fontWeight: '600', fontSize: 12.5, color: colors.tx2, ...tabular },
  pctSel: { color: colors.tx },
});
