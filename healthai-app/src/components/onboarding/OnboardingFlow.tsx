// Machine à états de l'onboarding : ordre des étapes, progression, footer, transitions.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/services/api';

import PrimaryButton from './components/PrimaryButton';
import ProgressBar from './components/ProgressBar';
import { buildRegisterPayload, Credentials, DEFAULT_ONBOARDING_DATA, OnboardingData } from './data';
import BodyFatStep from './steps/BodyFatStep';
import { BpmCount, BpmCountdown, BpmIntro, BpmMeasure } from './steps/BpmSteps';
import RulerStep from './steps/RulerStep';
import SummaryStep from './steps/SummaryStep';
import WelcomeStep from './steps/WelcomeStep';
import { colors } from './theme';

type StepId =
  | 'welcome'
  | 'age'
  | 'height'
  | 'weight'
  | 'sport'
  | 'bodyfat'
  | 'bpmintro'
  | 'countdown'
  | 'measure'
  | 'bpmcount'
  | 'summary';

type StepConfig = {
  id: StepId;
  prog?: number;
  footer?: string;
  chrome?: boolean;
  takeover?: boolean;
  valid?: (d: OnboardingData) => boolean;
};

const STEPS: StepConfig[] = [
  { id: 'welcome', chrome: false, footer: 'Commencer' },
  { id: 'age', prog: 0.12, footer: 'Continuer' },
  { id: 'height', prog: 0.27, footer: 'Continuer' },
  { id: 'weight', prog: 0.42, footer: 'Continuer' },
  { id: 'sport', prog: 0.56, footer: 'Continuer' },
  { id: 'bodyfat', prog: 0.69, footer: 'Continuer', valid: (d) => d.bodyFat != null },
  { id: 'bpmintro', prog: 0.81, footer: 'Je sens mon pouls' },
  { id: 'countdown', chrome: false, takeover: true },
  { id: 'measure', chrome: false, takeover: true },
  { id: 'bpmcount', prog: 0.94, footer: 'Continuer' },
  { id: 'summary', prog: 1, footer: 'Créer mon compte' },
];

const INDEX = Object.fromEntries(STEPS.map((s, i) => [s.id, i])) as Record<StepId, number>;

export default function OnboardingFlow({ credentials }: { credentials: Credentials }) {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const patch = useCallback((p: Partial<OnboardingData>) => setData((d) => ({ ...d, ...p })), []);

  const cur = STEPS[step];
  const valid = cur.valid ? cur.valid(data) : true;

  // Transition d'entrée animée.
  const enter = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 320, useNativeDriver: true }).start();
  }, [step, enter]);

  const go = useCallback((target: number) => setStep(target), []);

  const submit = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await register(buildRegisterPayload(credentials, data));
      // Succès : le RootNavigator redirige automatiquement vers l'espace connecté.
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  }, [register, credentials, data]);

  const next = useCallback(() => {
    if (cur.id === 'bpmintro') return go(INDEX.countdown);
    if (cur.id === 'summary') return submit();
    go(Math.min(STEPS.length - 1, step + 1));
  }, [cur.id, go, step, submit]);

  const back = useCallback(() => {
    let p = step - 1;
    while (p > 0 && STEPS[p].takeover) p--;
    go(Math.max(0, p));
  }, [step, go]);

  const renderStep = () => {
    switch (cur.id) {
      case 'welcome':
        return <WelcomeStep firstName={credentials.first_name} />;
      case 'age':
        return <RulerStep eyebrow="ÉTAPE 1" title="Quel âge as-tu ?" min={13} max={100} majorStep={5} unit="ans" value={data.age} onChange={(v) => patch({ age: v })} />;
      case 'height':
        return <RulerStep eyebrow="ÉTAPE 2" title="Combien mesures-tu ?" min={120} max={220} majorStep={10} unit="cm" value={data.height} onChange={(v) => patch({ height: v })} />;
      case 'weight':
        return <RulerStep eyebrow="ÉTAPE 3" title="Quel est ton poids ?" min={35} max={200} step={0.5} decimals={1} majorStep={10} unit="kg" value={data.weight} onChange={(v) => patch({ weight: v })} />;
      case 'sport':
        return <RulerStep eyebrow="ÉTAPE 4" title="Sport par semaine ?" sub="Heures d'activité physique modérée à intense." min={0} max={25} step={0.5} decimals={1} majorStep={5} unit="h / sem" value={data.sport} onChange={(v) => patch({ sport: v })} />;
      case 'bodyfat':
        return <BodyFatStep value={data.bodyFat} onChange={(i) => patch({ bodyFat: i })} />;
      case 'bpmintro':
        return <BpmIntro />;
      case 'countdown':
        return <BpmCountdown onDone={() => go(INDEX.measure)} />;
      case 'measure':
        return <BpmMeasure onDone={() => go(INDEX.bpmcount)} />;
      case 'bpmcount':
        return <BpmCount count={data.beats} setCount={(v) => patch({ beats: v })} />;
      case 'summary':
        return <SummaryStep data={data} firstName={credentials.first_name} />;
    }
  };

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  // Les écrans « takeover » occupent tout l'écran (décompte, mesure).
  if (cur.takeover) {
    return <SafeAreaView style={styles.safe}>{renderStep()}</SafeAreaView>;
  }

  const centered = cur.id === 'welcome';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {cur.chrome !== false && (
          <View style={styles.topbar}>
            <Pressable
              style={[styles.iconBtn, step === 0 && styles.iconBtnHidden]}
              onPress={back}
              disabled={step === 0 || loading}>
              <Text style={styles.iconBtnTx}>‹</Text>
            </Pressable>
            <ProgressBar progress={cur.prog ?? 0} />
          </View>
        )}

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.body, centered && styles.bodyCentered]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>{renderStep()}</Animated.View>
        </ScrollView>

        {cur.footer ? (
          <View style={styles.footer}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label={cur.footer} onPress={next} disabled={!valid} loading={loading} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line2, alignItems: 'center', justifyContent: 'center' },
  iconBtnHidden: { opacity: 0 },
  iconBtnTx: { color: colors.tx2, fontSize: 26, lineHeight: 28, marginTop: -2 },
  body: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8, flexGrow: 1 },
  bodyCentered: { justifyContent: 'center' },
  footer: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18, gap: 12 },
  error: { color: '#ff6b6b', fontSize: 14, textAlign: 'center' },
});
