// Onboarding.js — navigation state machine, progress bar, transitions, footer.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, accent } from './theme';
import {
  Welcome, NameStep, AgeStep, HeightStep, WeightStep, SportStep, BodyFatStep, Summary, Done,
} from './screens/DataScreens';
import { BpmIntro, BpmCountdown, BpmMeasure, BpmCount } from './screens/BpmScreens';

const STEPS = [
  { id: 'welcome',  chrome: false, footer: 'Commencer' },
  { id: 'name',     prog: 0.06, footer: 'Continuer', valid: (d) => d.name.trim().length > 0 },
  { id: 'age',      prog: 0.19, footer: 'Continuer' },
  { id: 'height',   prog: 0.31, footer: 'Continuer' },
  { id: 'weight',   prog: 0.44, footer: 'Continuer' },
  { id: 'sport',    prog: 0.56, footer: 'Continuer' },
  { id: 'bodyfat',  prog: 0.69, footer: 'Continuer', valid: (d) => d.bodyFat != null },
  { id: 'bpmintro', prog: 0.81, footer: 'Je sens mon pouls' },
  { id: 'countdown',chrome: false, takeover: true },
  { id: 'measure',  chrome: false, takeover: true },
  { id: 'bpmcount', prog: 0.94, footer: 'Continuer' },
  { id: 'summary',  prog: 1.0, footer: 'Créer mon compte' },
  { id: 'done',     chrome: false, footer: 'Ouvrir mon espace' },
];
const IDX = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', age: 27, height: 175, weight: 70, sport: 3, bodyFat: null, beats: 35,
  });
  const patch = useCallback((p) => setData((d) => ({ ...d, ...p })), []);

  const cur = STEPS[step];
  const valid = cur.valid ? cur.valid(data) : true;

  // entrance transition + animated progress
  const enter = useRef(new Animated.Value(1)).current;
  const prog = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 320, useNativeDriver: true }).start();
    Animated.timing(prog, { toValue: cur.prog || 0, duration: 450, useNativeDriver: false }).start();
  }, [step]);

  const go = (target) => setStep(target);
  const next = () => {
    if (cur.id === 'bpmintro') return go(IDX.countdown);
    if (cur.id === 'summary') return go(IDX.done);
    if (cur.id === 'done') return go(0);
    go(Math.min(STEPS.length - 1, step + 1));
  };
  const back = () => {
    let p = step - 1;
    while (p > 0 && STEPS[p].takeover) p--;
    go(Math.max(0, p));
  };

  const render = () => {
    switch (cur.id) {
      case 'welcome':  return <Welcome />;
      case 'name':     return <NameStep data={data} setData={patch} />;
      case 'age':      return <AgeStep data={data} setData={patch} />;
      case 'height':   return <HeightStep data={data} setData={patch} />;
      case 'weight':   return <WeightStep data={data} setData={patch} />;
      case 'sport':    return <SportStep data={data} setData={patch} />;
      case 'bodyfat':  return <BodyFatStep data={data} setData={patch} />;
      case 'bpmintro': return (
        <View style={styles.step}>
          <View style={{ marginBottom: 28 }}>
            <Text style={styles.eyebrow}>ÉTAPE 7</Text>
            <Text style={styles.title}>Mesurons ton pouls</Text>
            <Text style={styles.sub}>Au repos, pour estimer ta fréquence cardiaque de base.</Text>
          </View>
          <BpmIntro />
        </View>
      );
      case 'countdown':return <BpmCountdown onDone={() => go(IDX.measure)} />;
      case 'measure':  return <BpmMeasure onDone={() => go(IDX.bpmcount)} />;
      case 'bpmcount': return (
        <View style={styles.step}>
          <View style={{ marginBottom: 28 }}>
            <Text style={styles.eyebrow}>ÉTAPE 7</Text>
            <Text style={styles.title}>Combien de battements ?</Text>
            <Text style={styles.sub}>Saisis le nombre que tu as compté pendant les 30 secondes.</Text>
          </View>
          <BpmCount count={data.beats} setCount={(v) => patch({ beats: v })} />
        </View>
      );
      case 'summary':  return <Summary data={data} />;
      case 'done':     return <Done data={data} />;
    }
  };

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const progWidth = prog.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  // takeover screens fill the whole device
  if (cur.takeover) {
    return <SafeAreaView style={styles.safe}>{render()}</SafeAreaView>;
  }

  const centered = cur.id === 'welcome' || cur.id === 'done';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {cur.chrome !== false && (
          <View style={styles.topbar}>
            <Pressable style={[styles.iconBtn, step === 0 && styles.iconBtnHidden]} onPress={back} disabled={step === 0}>
              <Text style={styles.iconBtnTx}>‹</Text>
            </Pressable>
            <View style={styles.progress}>
              <Animated.View style={[styles.progressFill, { width: progWidth }]} />
            </View>
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.body, centered && styles.bodyCentered]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>
            {render()}
          </Animated.View>
        </ScrollView>

        {cur.footer ? (
          <View style={styles.footer}>
            <Pressable
              onPress={next}
              disabled={!valid}
              style={({ pressed }) => [styles.btn, !valid && styles.btnDisabled, pressed && valid && styles.btnPressed]}
            >
              <Text style={styles.btnTx}>{cur.footer}</Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.line2, alignItems: 'center', justifyContent: 'center' },
  iconBtnHidden: { opacity: 0 },
  iconBtnTx: { color: colors.tx2, fontSize: 26, lineHeight: 28, marginTop: -2 },
  progress: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: accent },

  body: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8, flexGrow: 1 },
  bodyCentered: { justifyContent: 'center' },
  step: {},

  footer: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18 },
  btn: {
    height: 58, borderRadius: 18, backgroundColor: accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: accent, shadowOpacity: 0.32, shadowRadius: 24, shadowOffset: { width: 0, height: 10 },
  },
  btnDisabled: { opacity: 0.28, shadowOpacity: 0 },
  btnPressed: { transform: [{ scale: 0.98 }] },
  btnTx: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink, letterSpacing: -0.2 },

  eyebrow: { fontFamily: fonts.semibold, letterSpacing: 1.9, fontSize: 12, color: accent },
  title: { fontFamily: fonts.semibold, fontSize: 30, color: colors.tx, letterSpacing: -0.6, lineHeight: 36, marginTop: 12 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.tx2, lineHeight: 22, marginTop: 10 },
});
