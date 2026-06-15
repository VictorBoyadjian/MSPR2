// Sélecteur de valeur tactile « règle » horizontale (âge / taille / poids / sport).
// - Mobile : drag tactile natif (inertie + snap).
// - Web : drag à la souris (cliquer-glisser) + snap au relâchement.
// - Partout : saisie manuelle en touchant la valeur.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { accent, colors, tabular } from '../theme';

const GAP = 16;

type RulerPickerProps = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  decimals?: number;
  majorStep?: number;
};

export default function RulerPicker({
  min,
  max,
  value,
  onChange,
  step = 1,
  unit = '',
  decimals = 0,
  majorStep = 5,
}: RulerPickerProps) {
  const ref = useRef<ScrollView>(null);
  const trackRef = useRef<View>(null);
  const scrollX = useRef(0);
  const [width, setWidth] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const didInit = useRef(false);
  const count = Math.round((max - min) / step);
  const majorEvery = Math.max(1, Math.round(majorStep / step));

  /** Convertit une valeur en index de tick (borné). */
  const toIndex = useCallback(
    (v: number) => Math.max(0, Math.min(count, Math.round((v - min) / step))),
    [count, min, step],
  );

  /** Positionne le scroll sur une valeur donnée. */
  const scrollToValue = useCallback(
    (v: number, animated: boolean) => ref.current?.scrollTo({ x: toIndex(v) * GAP, animated }),
    [toIndex],
  );

  // Positionne le scroll sur la valeur courante une fois la largeur connue.
  useEffect(() => {
    if (width && ref.current && !didInit.current) {
      scrollToValue(value, false);
      didInit.current = true;
    }
  }, [width, value, scrollToValue]);

  // Web : drag à la souris sur la règle (le ScrollView ne le gère pas seul).
  // On pilote le défilement via la méthode scrollTo (fiable) et on bloque
  // la sélection/drag natif du navigateur qui réinitialisait la position.
  useEffect(() => {
    if (Platform.OS !== 'web' || !width) return;
    const el = trackRef.current as unknown as HTMLElement | null;
    if (!el) return;
    const maxX = count * GAP;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    const onDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.pageX;
      startScroll = scrollX.current;
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const x = Math.max(0, Math.min(maxX, startScroll - (e.pageX - startX)));
      ref.current?.scrollTo({ x, animated: false });
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = 'grab';
      ref.current?.scrollTo({ x: Math.round(scrollX.current / GAP) * GAP, animated: true });
    };
    const preventDrag = (e: Event) => e.preventDefault();

    el.style.cursor = 'grab';
    el.addEventListener('mousedown', onDown);
    el.addEventListener('dragstart', preventDrag);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('dragstart', preventDrag);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [width, count]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = e.nativeEvent.contentOffset.x;
    const i = Math.max(0, Math.min(count, Math.round(e.nativeEvent.contentOffset.x / GAP)));
    const v = +(min + i * step).toFixed(6);
    if (v !== value) onChange(v);
  };

  const startEditing = () => {
    setDraft(value.toFixed(decimals));
    setEditing(true);
  };

  const commitEditing = () => {
    setEditing(false);
    const parsed = parseFloat(draft.replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(min, Math.min(max, parsed));
    const idx = toIndex(clamped);
    const snapped = +(min + idx * step).toFixed(6);
    onChange(snapped);
    scrollToValue(snapped, true);
  };

  const ticks = Array.from({ length: count + 1 }, (_, i) => {
    const major = i % majorEvery === 0;
    return (
      <View key={i} style={styles.tickWrap}>
        <View style={[styles.tick, major && styles.tickMajor]} />
        {major ? <Text style={styles.tickLabel}>{Math.round(min + i * step)}</Text> : null}
      </View>
    );
  });

  const pad = width ? width / 2 - GAP / 2 : 0;

  return (
    <View style={styles.wrap}>
      {editing ? (
        <View style={styles.readout}>
          <TextInput
            autoFocus
            selectTextOnFocus
            style={[styles.readoutNum, styles.readoutInput]}
            value={draft}
            onChangeText={setDraft}
            onBlur={commitEditing}
            onSubmitEditing={commitEditing}
            keyboardType={decimals > 0 ? 'decimal-pad' : 'number-pad'}
            returnKeyType="done"
            selectionColor={accent}
          />
          {unit ? <Text style={styles.readoutUnit}>{unit}</Text> : null}
        </View>
      ) : (
        <Pressable style={styles.readout} onPress={startEditing} accessibilityRole="button">
          <Text style={styles.readoutNum}>{value.toFixed(decimals)}</Text>
          {unit ? <Text style={styles.readoutUnit}>{unit}</Text> : null}
        </Pressable>
      )}
      <Text style={styles.editHint}>{editing ? 'Valide pour confirmer' : 'Touche le nombre pour saisir'}</Text>

      <View ref={trackRef} style={styles.trackWrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={GAP}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentContainerStyle={{ paddingHorizontal: pad, alignItems: 'flex-start' }}>
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
  readoutNum: { fontSize: 74, fontWeight: '600', color: colors.tx, letterSpacing: -2.5, lineHeight: 80, ...tabular },
  readoutInput: { minWidth: 120, textAlign: 'center', padding: 0 },
  readoutUnit: { fontSize: 18, fontWeight: '500', color: colors.tx2, marginLeft: 8, marginBottom: 12 },
  editHint: { fontSize: 12, color: colors.tx3, marginTop: 6 },
  trackWrap: { width: '100%', height: 92, marginTop: 22 },
  tickWrap: { width: GAP, alignItems: 'center' },
  tick: { width: 2, height: 16, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 16 },
  tickMajor: { height: 30, backgroundColor: 'rgba(255,255,255,0.42)' },
  tickLabel: { marginTop: 8, fontSize: 11, color: colors.tx3, ...tabular },
  needleOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' },
  needle: {
    width: 3,
    height: 48,
    marginTop: 8,
    borderRadius: 2,
    backgroundColor: accent,
    shadowColor: accent,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
