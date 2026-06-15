// 6 silhouettes paramétriques de masse grasse (react-native-svg).
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const LEVELS = [
  { sh: 23, ch: 20, wa: 15, hi: 18, arm: 8, leg: 12 },
  { sh: 24, ch: 21, wa: 18, hi: 20, arm: 9, leg: 13 },
  { sh: 25, ch: 23, wa: 22, hi: 23, arm: 11, leg: 15 },
  { sh: 26, ch: 26, wa: 28, hi: 27, arm: 13, leg: 18 },
  { sh: 28, ch: 30, wa: 35, hi: 32, arm: 16, leg: 21 },
  { sh: 30, ch: 34, wa: 42, hi: 37, arm: 19, leg: 24 },
];

type BodySilhouetteProps = {
  level?: number;
  color?: string;
  height?: number;
};

export default function BodySilhouette({ level = 0, color = '#6f7682', height = 76 }: BodySilhouetteProps) {
  const lvl = Math.max(0, Math.min(5, level));
  const P = LEVELS[lvl];
  const cx = 60;
  const yTop = 50;
  const yChest = 70;
  const yWaist = 92;
  const yHip = 124;
  const width = height * 0.6; // ratio viewBox 120:200

  const torso =
    `M ${cx - P.sh} ${yTop}` +
    ` C ${cx - P.ch} ${yChest - 6}, ${cx - P.wa} ${yWaist - 10}, ${cx - P.wa} ${yWaist}` +
    ` C ${cx - P.wa} ${yWaist + 10}, ${cx - P.hi} ${yHip - 10}, ${cx - P.hi} ${yHip}` +
    ` L ${cx + P.hi} ${yHip}` +
    ` C ${cx + P.hi} ${yHip - 10}, ${cx + P.wa} ${yWaist + 10}, ${cx + P.wa} ${yWaist}` +
    ` C ${cx + P.wa} ${yWaist - 10}, ${cx + P.ch} ${yChest - 6}, ${cx + P.sh} ${yTop} Z`;

  const headR = 12.5 + lvl * 0.5;
  const neckW = 6 + lvl * 0.7;

  return (
    <Svg width={width} height={height} viewBox="0 0 120 200">
      <Rect x={cx - neckW} y={34} width={neckW * 2} height={20} rx={neckW * 0.7} fill={color} />
      <Line x1={cx - P.hi * 0.42} y1={yHip - 4} x2={cx - P.hi * 0.48} y2={194} stroke={color} strokeWidth={P.leg} strokeLinecap="round" />
      <Line x1={cx + P.hi * 0.42} y1={yHip - 4} x2={cx + P.hi * 0.48} y2={194} stroke={color} strokeWidth={P.leg} strokeLinecap="round" />
      <Line x1={cx - P.sh + 2} y1={yTop + 5} x2={cx - P.hi - 1} y2={yHip - 4} stroke={color} strokeWidth={P.arm} strokeLinecap="round" />
      <Line x1={cx + P.sh - 2} y1={yTop + 5} x2={cx + P.hi + 1} y2={yHip - 4} stroke={color} strokeWidth={P.arm} strokeLinecap="round" />
      <Path d={torso} fill={color} />
      <Circle cx={cx} cy={22} r={headR} fill={color} />
    </Svg>
  );
}
