// En-tête commun aux étapes : surtitre, titre, sous-titre.
import { StyleSheet, Text, View } from 'react-native';

import { accent, colors } from '../theme';

type StepHeaderProps = {
  eyebrow?: string;
  title: string;
  sub?: string;
};

export default function StepHeader({ eyebrow, title, sub }: StepHeaderProps) {
  return (
    <View style={styles.head}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { marginBottom: 28 },
  eyebrow: { fontWeight: '600', letterSpacing: 1.9, fontSize: 12, color: accent },
  title: { fontWeight: '600', fontSize: 30, color: colors.tx, letterSpacing: -0.6, lineHeight: 36, marginTop: 12 },
  sub: { fontSize: 15, color: colors.tx2, lineHeight: 22, marginTop: 10 },
});
