// Étape générique basée sur le RulerPicker (âge / taille / poids / sport).
import { View } from 'react-native';

import RulerPicker from '../components/RulerPicker';
import StepHeader from '../components/StepHeader';

type RulerStepProps = {
  eyebrow: string;
  title: string;
  sub?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  decimals?: number;
  majorStep?: number;
};

export default function RulerStep({ eyebrow, title, sub, value, onChange, ...ruler }: RulerStepProps) {
  return (
    <View>
      <StepHeader eyebrow={eyebrow} title={title} sub={sub} />
      <RulerPicker value={value} onChange={onChange} {...ruler} />
    </View>
  );
}
