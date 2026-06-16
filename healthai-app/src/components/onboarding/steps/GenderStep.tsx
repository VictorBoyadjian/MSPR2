// Étape genre : sélection homme / femme / autre (envoyé tel quel à l'API).
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GenderEnum } from '@/types/users.type';

import StepHeader from '../components/StepHeader';
import { accent, accentA, colors } from '../theme';

type GenderStepProps = {
  value: GenderEnum | null;
  onChange: (value: GenderEnum) => void;
};

const OPTIONS: { value: GenderEnum; label: string }[] = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
  { value: 'other', label: 'Autre' },
];

export default function GenderStep({ value, onChange }: GenderStepProps) {
  return (
    <View>
      <StepHeader eyebrow="ÉTAPE 2" title="Quel est ton genre ?" />
      <View style={styles.list}>
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.cell, selected && styles.cellSel]}>
              <Text style={[styles.label, selected && styles.labelSel]}>{opt.label}</Text>
              <View style={[styles.radio, selected && styles.radioSel]}>
                {selected ? <View style={styles.dot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  cellSel: { borderColor: accent, backgroundColor: accentA(0.09) },
  label: { fontSize: 16.5, color: colors.tx2 },
  labelSel: { color: colors.tx, fontWeight: '600' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSel: { borderColor: accent },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: accent },
});
