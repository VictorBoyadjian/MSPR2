// Courbe d'évolution du poids, dessinée avec react-native-svg (+ d3-shape pour le
// lissage). 100 % cross-platform : même rendu sur iOS, Android et web, sans WebView.
import { area, curveMonotoneX, line } from 'd3-shape';
import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WeightPoint } from '@/types/health.type';

const CHART_HEIGHT = 160;
const PAD = { top: 10, right: 12, bottom: 22, left: 36 };

/** Nombre compact à la française (ex. « 72,5 » ou « 70 »). */
function compact(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}

/** `YYYY-MM-DD` → `JJ/MM` sans dérive de fuseau. */
function shortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

/** Petite courbe d'évolution du poids. Nécessite au moins 2 points pour tracer une ligne. */
export default function WeightChart({ data }: { data: WeightPoint[] }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // Tant que la largeur n'est pas mesurée, on réserve juste la hauteur.
  if (width === 0) {
    return <View style={styles.container} onLayout={onLayout} />;
  }

  const innerW = width - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;

  const weights = data.map((p) => p.weight);
  let min = Math.min(...weights);
  let max = Math.max(...weights);
  if (min === max) {
    // Série plate : on ouvre un peu l'échelle pour éviter une ligne collée au bord.
    min -= 1;
    max += 1;
  }

  const xFor = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
  const yFor = (w: number) => PAD.top + innerH * (1 - (w - min) / (max - min));

  const linePath =
    line<WeightPoint>()
      .x((_, i) => xFor(i))
      .y((p) => yFor(p.weight))
      .curve(curveMonotoneX)(data) ?? '';

  const areaPath =
    area<WeightPoint>()
      .x((_, i) => xFor(i))
      .y0(PAD.top + innerH)
      .y1((p) => yFor(p.weight))
      .curve(curveMonotoneX)(data) ?? '';

  const showMarkers = data.length <= 12;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Svg width={width} height={CHART_HEIGHT}>
        {/* Remplissage doux sous la courbe */}
        <Path d={areaPath} fill={theme.accentSoft} />
        {/* Courbe */}
        <Path d={linePath} fill="none" stroke={theme.accent} strokeWidth={2.5} strokeLinejoin="round" />

        {/* Points (masqués si la série est dense pour ne pas surcharger) */}
        {data.map((p, i) =>
          showMarkers || i === data.length - 1 ? (
            <Circle key={p.date} cx={xFor(i)} cy={yFor(p.weight)} r={3.5} fill={theme.accent} />
          ) : null,
        )}

        {/* Repères d'axe Y : poids max (haut) et min (bas) */}
        <SvgText x={PAD.left - 6} y={PAD.top + 4} fontSize={10} fill={theme.textSecondary} textAnchor="end">
          {compact(max)}
        </SvgText>
        <SvgText
          x={PAD.left - 6}
          y={PAD.top + innerH}
          fontSize={10}
          fill={theme.textSecondary}
          textAnchor="end">
          {compact(min)}
        </SvgText>

        {/* Repères d'axe X : première et dernière date */}
        <SvgText x={PAD.left} y={CHART_HEIGHT - 6} fontSize={10} fill={theme.textSecondary} textAnchor="start">
          {shortDate(data[0].date)}
        </SvgText>
        <SvgText
          x={width - PAD.right}
          y={CHART_HEIGHT - 6}
          fontSize={10}
          fill={theme.textSecondary}
          textAnchor="end">
          {shortDate(data[data.length - 1].date)}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: CHART_HEIGHT, marginTop: Spacing.two },
});
