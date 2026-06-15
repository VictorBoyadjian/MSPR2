// components/RulerPicker.js — tactile horizontal "ruler" value picker.
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, accent, tabular } from '../theme';

const GAP = 16;

export default function RulerPicker({
  min, max, step = 1, value, onChange, unit = '', decimals = 0, majorStep = 5,
}) {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  const didInit = useRef(false);
  const count = Math.round((max - min) / step);
  const majorEvery = Math.max(1, Math.round(majorStep / step));

  // Position the scroll at the current value once we know the width.
  useEffect(() => {
    if (w && ref.current && !didInit.current) {
      const idx = Math.round((value - min) / step);
      ref.current.scrollTo({ x: idx * GAP, animated: false });
      didInit.current = true;
    }
  }, [w]);

  const onScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    let i = Math.round(x / GAP);
    i = Math.max(0, Math.min(count, i));
    const v = +(min + i * step).toFixed(6);
    if (v !== value) onChange(v);
  };

  const ticks = [];
  for (let i = 0; i <= count; i++) {
    const major = i % majorEvery === 0;
    ticks.push(
      <View key={i} style={styles.tickWrap}>
        <View style={[styles.tick, major && styles.tickMajor]} />
        {major ? <Text style={styles.tickLabel}>{Math.round(min + i * step)}</Text> : null}
      </View>
    );
  }

  const pad = w ? w / 2 - GAP / 2 : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.readout}>
        <Text style={styles.readoutNum}>{value.toFixed(decimals)}</Text>
        <Text style={styles.readoutUnit}>{unit}</Text>
      </View>

      <View style={styles.trackWrap} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={GAP}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentContainerStyle={{ paddingHorizontal: pad, alignItems: 'flex-start' }}
        >
          {ticks}
        </ScrollView>

        <View style={styles.needleOverlay} pointerEvents="none">
          <View style={styles.needle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: 14 },
  readout: { flexDirection: 'row', alignItems: 'flex-end' },
  readoutNum: { fontFamily: fonts.semibold, fontSize: 74, color: colors.tx, letterSpacing: -2.5, lineHeight: 80, ...tabular },
  readoutUnit: { fontFamily: fonts.medium, fontSize: 18, color: colors.tx2, marginLeft: 8, marginBottom: 12 },
  trackWrap: { width: '100%', height: 92, marginTop: 28 },
  tickWrap: { width: GAP, alignItems: 'center' },
  tick: { width: 2, height: 16, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 16 },
  tickMajor: { height: 30, backgroundColor: 'rgba(255,255,255,0.42)' },
  tickLabel: { marginTop: 8, fontFamily: fonts.regular, fontSize: 11, color: colors.tx3, ...tabular },
  needleOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' },
  needle: {
    width: 3, height: 48, marginTop: 8, borderRadius: 2, backgroundColor: accent,
    shadowColor: accent, shadowOpacity: 0.8, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
  },
});
