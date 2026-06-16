// Saisie du poids reprenant le système de l'onboarding (règle néon sur fond sombre).
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/components/onboarding/components/PrimaryButton';
import RulerPicker from '@/components/onboarding/components/RulerPicker';
import StepHeader from '@/components/onboarding/components/StepHeader';
import { colors } from '@/components/onboarding/theme';

type Props = {
  visible: boolean;
  /** Poids affiché à l'ouverture (kg). */
  initial: number;
  onClose: () => void;
  onSave: (weightKg: number) => Promise<void> | void;
};

export default function WeightEditorModal({ visible, initial, onClose, onSave }: Props) {
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);

  // Recale la règle sur le poids courant à chaque ouverture.
  useEffect(() => {
    if (visible) setValue(initial);
  }, [visible, initial]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(value);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <StepHeader
            eyebrow="POIDS"
            title="Quel est ton poids ?"
            sub="Glisse la règle ou touche le nombre pour saisir ta mesure du jour."
          />
          <RulerPicker
            min={35}
            max={200}
            step={0.5}
            decimals={1}
            majorStep={10}
            unit="kg"
            value={value}
            onChange={setValue}
          />
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Enregistrer" onPress={save} loading={saving} />
          <Pressable onPress={onClose} disabled={saving} style={styles.cancel}>
            <Text style={styles.cancelTx}>Annuler</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  footer: { paddingHorizontal: 22, paddingBottom: 18, gap: 12 },
  cancel: { alignItems: 'center', paddingVertical: 8 },
  cancelTx: { color: colors.tx2, fontSize: 15, fontWeight: '500' },
});
