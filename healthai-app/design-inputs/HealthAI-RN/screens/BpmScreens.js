// screens/BpmScreens.js — pulse-measure flow: Intro, Countdown, Measure, Count.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Heart from '../components/Heart';
import { colors, fonts, accent, accentA, tabular } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ---------------- Intro ---------------- */
export function BpmIntro() {
  const steps = [
    'Assieds-toi et reste calme une dizaine de secondes.',
    "Pose l'index et le majeur sur l'intérieur du poignet opposé, ou sur le côté du cou.",
    'Quand tu sens les battements, lance la mesure et compte-les jusqu\u2019à la fin.',
  ];
  return (
    <View style={styles.intro}>
      <View style={styles.orb}>
        <Heart size={40} beat color={accent} />
      </View>
      <View style={styles.stepsList}>
        {steps.map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNo}><Text style={styles.stepNoTx}>{i + 1}</Text></View>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------------- 3 · 2 · 1 countdown ---------------- */
export function BpmCountdown({ onDone }) {
  const [n, setN] = useState(3);
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    scale.setValue(0.5);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 90 }).start();
    if (n <= 0) {
      const t = setTimeout(onDone, 380);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <View style={styles.takeover}>
      <Text style={styles.cdLabel}>PRÉPARE-TOI</Text>
      <Animated.Text style={[styles.cdNum, { transform: [{ scale }] }]}>
        {n > 0 ? n : 'Go'}
      </Animated.Text>
      <Text style={styles.cdHint}>Place tes doigts sur le pouls</Text>
    </View>
  );
}

/* ---------------- 30s measuring wheel ---------------- */
export function BpmMeasure({ duration = 30000, onDone }) {
  const R = 132;
  const C = 2 * Math.PI * R;
  const progress = useRef(new Animated.Value(0)).current; // 0 -> 1
  const rot = useRef(new Animated.Value(0)).current;
  const [remaining, setRemaining] = useState(Math.ceil(duration / 1000));
  const finished = useRef(false);

  useEffect(() => {
    progress.addListener(({ value }) => {
      setRemaining(Math.max(0, Math.ceil((1 - value) * (duration / 1000))));
    });
    const loop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    Animated.timing(progress, {
      toValue: 1, duration, easing: Easing.linear, useNativeDriver: false,
    }).start(({ finished: done }) => {
      if (done && !finished.current) { finished.current = true; onDone(); }
    });
    return () => { loop.stop(); progress.removeAllListeners(); };
  }, []);

  const dashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [0, C] });
  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.takeover}>
      <View style={styles.measureWrap}>
        <Svg width={300} height={300} viewBox="0 0 320 320">
          <Circle cx="160" cy="160" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth={10} fill="none" />
          <AnimatedCircle
            cx="160" cy="160" r={R} stroke={accent} strokeWidth={10} fill="none"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={dashoffset}
            rotation={-90} originX={160} originY={160}
          />
        </Svg>

        {/* leading dot */}
        <Animated.View style={[styles.dotLayer, { transform: [{ rotate: spin }] }]} pointerEvents="none">
          <View style={styles.dot} />
        </Animated.View>

        <View style={styles.measureCenter}>
          <Heart size={30} beat dur={700} color={accent} />
          <Text style={styles.measureNum}>{remaining}</Text>
          <Text style={styles.measureUnit}>sec</Text>
        </View>
      </View>
      <Text style={styles.measureHint}>Compte chaque battement</Text>
    </View>
  );
}

/* ---------------- enter counted beats ---------------- */
export function BpmCount({ count, setCount }) {
  const bpm = count * 2;
  const adj = (d) => setCount(Math.max(10, Math.min(160, count + d)));
  return (
    <View style={styles.countStep}>
      <View style={styles.stepper}>
        <Pressable style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnActive]} onPress={() => adj(-1)}>
          <Text style={styles.stepBtnTx}>–</Text>
        </Pressable>
        <View style={styles.stepVal}>
          <Text style={styles.stepNum}>{count}</Text>
          <Text style={styles.stepCap}>BATTEMENTS COMPTÉS</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnActive]} onPress={() => adj(1)}>
          <Text style={styles.stepBtnTx}>+</Text>
        </Pressable>
      </View>

      <View style={styles.resultPill}>
        <Heart size={20} color={accent} />
        <Text style={styles.resultNum}>{bpm}</Text>
        <Text style={styles.resultUnit}>BPM au repos</Text>
      </View>

      <Text style={styles.note}>
        On double ton décompte sur 30 secondes pour obtenir les battements par minute.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  /* intro */
  intro: { alignItems: 'center', marginTop: 8 },
  orb: {
    width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center',
    backgroundColor: accentA(0.14), borderWidth: 1, borderColor: accentA(0.4), marginBottom: 32,
  },
  stepsList: { width: '100%', gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepNo: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.line2, alignItems: 'center', justifyContent: 'center' },
  stepNoTx: { fontFamily: fonts.semibold, fontSize: 13, color: accent },
  stepText: { flex: 1, fontFamily: fonts.regular, fontSize: 14.5, color: colors.tx2, lineHeight: 21 },

  /* takeover */
  takeover: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, paddingHorizontal: 40 },
  cdLabel: { fontFamily: fonts.semibold, letterSpacing: 2.6, fontSize: 13, color: colors.tx3 },
  cdNum: { fontFamily: fonts.semibold, fontSize: 150, color: accent, lineHeight: 168, marginVertical: 18, ...tabular },
  cdHint: { fontFamily: fonts.regular, fontSize: 14, color: colors.tx2 },

  /* measure */
  measureWrap: { width: 300, height: 300, alignItems: 'center', justifyContent: 'center' },
  measureCenter: { position: 'absolute', alignItems: 'center' },
  measureNum: { fontFamily: fonts.semibold, fontSize: 66, color: colors.tx, lineHeight: 70, ...tabular },
  measureUnit: { fontFamily: fonts.regular, fontSize: 14, color: colors.tx2 },
  measureHint: { marginTop: 44, fontFamily: fonts.regular, fontSize: 15, color: colors.tx2 },
  dotLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' },
  dot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: accent, marginTop: 18.4,
    shadowColor: accent, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },

  /* count */
  countStep: { alignItems: 'center', marginTop: 16, gap: 34 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  stepBtn: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, borderColor: colors.line2, backgroundColor: colors.bg1, alignItems: 'center', justifyContent: 'center' },
  stepBtnActive: { borderColor: accent },
  stepBtnTx: { fontFamily: fonts.regular, fontSize: 30, color: colors.tx, lineHeight: 34 },
  stepVal: { alignItems: 'center', minWidth: 132 },
  stepNum: { fontFamily: fonts.semibold, fontSize: 74, color: colors.tx, lineHeight: 78, ...tabular },
  stepCap: { fontFamily: fonts.regular, fontSize: 12, color: colors.tx3, letterSpacing: 1, marginTop: 8 },
  resultPill: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11, paddingHorizontal: 20, borderRadius: 999, backgroundColor: accentA(0.12), borderWidth: 1, borderColor: accentA(0.3) },
  resultNum: { fontFamily: fonts.semibold, fontSize: 20, color: accent, ...tabular },
  resultUnit: { fontFamily: fonts.regular, fontSize: 13, color: colors.tx2 },
  note: { fontFamily: fonts.regular, fontSize: 13, color: colors.tx3, textAlign: 'center', lineHeight: 20, maxWidth: 290 },
});
