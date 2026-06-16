// Mesure du pouls au repos reprenant le système de l'onboarding
// (intro → décompte → anneau 30 s → saisie des battements).
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/components/onboarding/components/PrimaryButton';
import { beatsToBpm } from '@/components/onboarding/data';
import { BpmCount, BpmCountdown, BpmIntro, BpmMeasure } from '@/components/onboarding/steps/BpmSteps';
import { colors } from '@/components/onboarding/theme';

type Phase = 'intro' | 'countdown' | 'measure' | 'count';

type Props = {
  visible: boolean;
  /** Pouls au repos affiché à l'ouverture (bpm), pour pré-régler le compteur. */
  initialBpm: number;
  onClose: () => void;
  onSave: (restingBpm: number) => Promise<void> | void;
};

export default function RestingHrEditorModal({ visible, initialBpm, onClose, onSave }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [beats, setBeats] = useState(Math.round(initialBpm / 2));
  const [saving, setSaving] = useState(false);

  // Réinitialise le flux à chaque ouverture.
  useEffect(() => {
    if (visible) {
      setPhase('intro');
      setBeats(Math.round(initialBpm / 2));
    }
  }, [visible, initialBpm]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(beatsToBpm(beats));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {phase === 'countdown' ? (
          <BpmCountdown onDone={() => setPhase('measure')} />
        ) : phase === 'measure' ? (
          <BpmMeasure onDone={() => setPhase('count')} />
        ) : (
          <>
            <View style={styles.body}>
              {phase === 'intro' ? (
                <BpmIntro eyebrow="POULS AU REPOS" />
              ) : (
                <BpmCount eyebrow="POULS AU REPOS" count={beats} setCount={setBeats} />
              )}
            </View>
            <View style={styles.footer}>
              {phase === 'intro' ? (
                <>
                  <PrimaryButton label="Je sens mon pouls" onPress={() => setPhase('countdown')} />
                  <Pressable onPress={() => setPhase('count')} style={styles.link}>
                    <Text style={styles.linkTx}>Saisir directement</Text>
                  </Pressable>
                </>
              ) : (
                <PrimaryButton label="Enregistrer" onPress={save} loading={saving} />
              )}
              <Pressable onPress={onClose} disabled={saving} style={styles.link}>
                <Text style={styles.linkTx}>Annuler</Text>
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  footer: { paddingHorizontal: 22, paddingBottom: 18, gap: 12 },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkTx: { color: colors.tx2, fontSize: 15, fontWeight: '500' },
});
