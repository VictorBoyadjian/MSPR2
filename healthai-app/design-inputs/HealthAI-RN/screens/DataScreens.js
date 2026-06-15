// screens/DataScreens.js — data-collection screens + summary + done.
import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import RulerPicker from '../components/RulerPicker';
import BodySilhouette from '../components/BodySilhouette';
import Heart from '../components/Heart';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { colors, fonts, accent, accentA, tabular } from '../theme';

function StepHead({ eyebrow, title, sub }) {
  return (
    <View style={styles.head}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

export function Welcome() {
  return (
    <View style={styles.welcome}>
      <View style={styles.brandMark}><View style={styles.brandPulse} /></View>
      <View>
        <Text style={styles.eyebrow}>HEALTHAI</Text>
        <Text style={styles.welcomeTitle}>Construisons ton profil santé.</Text>
        <Text style={styles.sub}>
          Quelques questions rapides pour calibrer tes objectifs et mesurer ton rythme cardiaque au repos.
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaTx}>7 étapes</Text><View style={styles.dotSep} />
        <Text style={styles.metaTx}>≈ 2 min</Text><View style={styles.dotSep} />
        <Text style={styles.metaTx}>Confidentiel</Text>
      </View>
    </View>
  );
}

export function NameStep({ data, setData }) {
  const ref = useRef(null);
  useEffect(() => { const t = setTimeout(() => ref.current && ref.current.focus(), 380); return () => clearTimeout(t); }, []);
  return (
    <View style={styles.step}>
      <StepHead eyebrow="ÉTAPE 1" title="Comment t'appelles-tu ?" sub="Pour personnaliser ton espace." />
      <TextInput
        ref={ref}
        style={styles.field}
        placeholder="Ton prénom"
        placeholderTextColor={colors.tx3}
        value={data.name}
        maxLength={24}
        onChangeText={(v) => setData({ name: v })}
        selectionColor={accent}
      />
    </View>
  );
}

export function AgeStep({ data, setData }) {
  return (
    <View style={styles.step}>
      <StepHead eyebrow="ÉTAPE 2" title="Quel âge as-tu ?" />
      <RulerPicker min={13} max={100} step={1} value={data.age} unit="ans" majorStep={5} onChange={(v) => setData({ age: v })} />
    </View>
  );
}

export function HeightStep({ data, setData }) {
  return (
    <View style={styles.step}>
      <StepHead eyebrow="ÉTAPE 3" title="Combien mesures-tu ?" />
      <RulerPicker min={120} max={220} step={1} value={data.height} unit="cm" majorStep={10} onChange={(v) => setData({ height: v })} />
    </View>
  );
}

export function WeightStep({ data, setData }) {
  return (
    <View style={styles.step}>
      <StepHead eyebrow="ÉTAPE 4" title="Quel est ton poids ?" />
      <RulerPicker min={35} max={200} step={0.5} decimals={1} value={data.weight} unit="kg" majorStep={10} onChange={(v) => setData({ weight: v })} />
    </View>
  );
}

export function SportStep({ data, setData }) {
  return (
    <View style={styles.step}>
      <StepHead eyebrow="ÉTAPE 5" title="Sport par semaine ?" sub="Heures d'activité physique modérée à intense." />
      <RulerPicker min={0} max={25} step={0.5} decimals={1} value={data.sport} unit="h / sem" majorStep={5} onChange={(v) => setData({ sport: v })} />
    </View>
  );
}

export const BF = ['10–13 %', '14–17 %', '18–21 %', '22–25 %', '26–31 %', '32 %+'];

export function BodyFatStep({ data, setData }) {
  return (
    <View style={styles.step}>
      <StepHead eyebrow="ÉTAPE 6" title="Quelle silhouette te ressemble ?" sub="Une estimation suffit, tu pourras l'ajuster plus tard." />
      <View style={styles.bfGrid}>
        {BF.map((pct, i) => {
          const sel = data.bodyFat === i;
          return (
            <Pressable key={i} onPress={() => setData({ bodyFat: i })} style={[styles.bfCell, sel && styles.bfCellSel]}>
              <BodySilhouette level={i} height={76} color={sel ? accent : '#6f7682'} />
              <Text style={[styles.bfPct, sel && styles.bfPctSel]}>{pct}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Summary({ data }) {
  const bpm = data.beats * 2;
  const imc = data.weight / Math.pow(data.height / 100, 2);
  const fmt = (n) => n.toFixed(1).replace(/\.0$/, '');
  const rows = [
    ['Prénom', data.name || '—'],
    ['Âge', data.age + ' ans'],
    ['Taille', data.height + ' cm'],
    ['Poids', fmt(data.weight) + ' kg'],
    ['Sport', fmt(data.sport) + ' h / sem'],
    ['Masse grasse', data.bodyFat != null ? BF[data.bodyFat] : '—'],
    ['IMC', imc.toFixed(1)],
  ];
  return (
    <View style={styles.step}>
      <StepHead eyebrow="RÉCAPITULATIF" title="Voilà ton profil." />
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

export function Done({ data }) {
  return (
    <View style={styles.done}>
      <View style={styles.checkWrap}>
        <Svg width={50} height={50} viewBox="0 0 52 52">
          <SvgPath d="M14 27l8 8 16-18" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <View>
        <Text style={styles.welcomeTitle}>C'est prêt{data.name ? ', ' + data.name : ''}.</Text>
        <Text style={[styles.sub, { textAlign: 'center' }]}>
          Ton profil santé est configuré. On peut commencer à suivre tes progrès.
        </Text>
      </View>
    </View>
  );
}

// local svg import for the checkmark

const styles = StyleSheet.create({
  head: { marginBottom: 28 },
  eyebrow: { fontFamily: fonts.semibold, letterSpacing: 1.9, fontSize: 12, color: accent },
  title: { fontFamily: fonts.semibold, fontSize: 30, color: colors.tx, letterSpacing: -0.6, lineHeight: 36, marginTop: 12 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: colors.tx2, lineHeight: 22, marginTop: 10 },
  step: {},
  field: {
    height: 60, backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.line, borderRadius: 16,
    paddingHorizontal: 18, color: colors.tx, fontFamily: fonts.medium, fontSize: 18,
  },

  /* welcome */
  welcome: { gap: 30 },
  brandMark: { width: 64, height: 64, borderRadius: 20, backgroundColor: accentA(0.14), borderWidth: 1, borderColor: accentA(0.4), alignItems: 'center', justifyContent: 'center' },
  brandPulse: { width: 16, height: 16, borderRadius: 8, backgroundColor: accent, shadowColor: accent, shadowOpacity: 0.8, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  welcomeTitle: { fontFamily: fonts.semibold, fontSize: 34, color: colors.tx, letterSpacing: -0.9, lineHeight: 38, textAlign: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  metaTx: { fontFamily: fonts.regular, fontSize: 13, color: colors.tx3 },
  dotSep: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.tx3 },

  /* body fat */
  bfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bfCell: {
    width: '31.5%', alignItems: 'center', paddingTop: 16, paddingBottom: 13, gap: 10,
    backgroundColor: colors.bg1, borderWidth: 1.5, borderColor: colors.line, borderRadius: 18,
  },
  bfCellSel: { borderColor: accent, backgroundColor: accentA(0.09) },
  bfPct: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.tx2, ...tabular },
  bfPctSel: { color: colors.tx },

  /* summary */
  heroCard: { backgroundColor: accentA(0.1), borderWidth: 1, borderColor: accentA(0.26), borderRadius: 22, padding: 22, marginBottom: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTopTx: { fontFamily: fonts.semibold, fontSize: 12.5, color: accent, letterSpacing: 1 },
  heroBpm: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 12 },
  heroBpmNum: { fontFamily: fonts.semibold, fontSize: 64, color: colors.tx, lineHeight: 66, letterSpacing: -1, ...tabular },
  heroBpmUnit: { fontFamily: fonts.semibold, fontSize: 18, color: colors.tx2, marginBottom: 8 },
  sumList: { borderWidth: 1, borderColor: colors.line, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.bg1 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  sumRowLast: { borderBottomWidth: 0 },
  sumK: { fontFamily: fonts.regular, fontSize: 14.5, color: colors.tx2 },
  sumV: { fontFamily: fonts.semibold, fontSize: 15, color: colors.tx },

  /* done */
  done: { alignItems: 'center', gap: 28, paddingHorizontal: 10 },
  checkWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: accentA(0.16), borderWidth: 1, borderColor: accentA(0.45), alignItems: 'center', justifyContent: 'center', shadowColor: accent, shadowOpacity: 0.35, shadowRadius: 28, shadowOffset: { width: 0, height: 0 } },
});
