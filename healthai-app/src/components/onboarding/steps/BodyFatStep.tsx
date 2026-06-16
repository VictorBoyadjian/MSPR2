// Étape masse grasse : choix d'une silhouette parmi 6 tranches.
import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { GenderEnum } from '@/types/users.type';

import StepHeader from '../components/StepHeader';
import { BODY_FAT_OPTIONS } from '../data';
import { accent, accentA, colors, tabular } from '../theme';

// Silhouettes de masse grasse (1 = la plus fine → 6 = la plus large).
const FAT_IMAGES_MEN = [
  require('../../../../assets/images/fat-images/1.png'),
  require('../../../../assets/images/fat-images/2.png'),
  require('../../../../assets/images/fat-images/3.png'),
  require('../../../../assets/images/fat-images/4.png'),
  require('../../../../assets/images/fat-images/5.png'),
  require('../../../../assets/images/fat-images/6.png'),
];

const FAT_IMAGES_WOMEN = [
  require('../../../../assets/images/fat-images-women/1.png'),
  require('../../../../assets/images/fat-images-women/2.png'),
  require('../../../../assets/images/fat-images-women/3.png'),
  require('../../../../assets/images/fat-images-women/4.png'),
  require('../../../../assets/images/fat-images-women/5.png'),
  require('../../../../assets/images/fat-images-women/6.png'),
];

type BodyFatStepProps = {
  value: number | null;
  gender: GenderEnum | null;
  onChange: (index: number) => void;
};

export default function BodyFatStep({ value, gender, onChange }: BodyFatStepProps) {
  const images = gender === 'female' ? FAT_IMAGES_WOMEN : FAT_IMAGES_MEN;
  const { width } = useWindowDimensions();
  // Mobile (écran étroit) : une silhouette par ligne. Sinon deux par ligne.
  const isMobile = width < 600;

  return (
    <View>
      <StepHeader
        eyebrow="ÉTAPE 6"
        title="Quelle silhouette te ressemble ?"
        sub="Choisis ton pourcentage de masse grasse estimé. Une estimation suffit, tu pourras l'ajuster plus tard."
      />
      <View style={styles.grid}>
        {BODY_FAT_OPTIONS.map((opt, i) => {
          const selected = value === i;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onChange(i)}
              style={[styles.cell, { width: isMobile ? '100%' : '48.5%' }, selected && styles.cellSel]}>
              <View style={styles.imgBox}>
                <Image source={images[i]} style={styles.img} resizeMode="contain" />
              </View>
              <Text style={[styles.pct, selected && styles.pctSel]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 13,
    gap: 10,
    backgroundColor: colors.bg1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 18,
  },
  cellSel: { borderColor: accent, backgroundColor: accentA(0.09) },
  // Conteneur carré : largeur pleine, hauteur forcée égale via aspectRatio.
  imgBox: { width: '100%', aspectRatio: 1 },
  img: { width: '100%', height: '100%' },
  pct: { fontWeight: '600', fontSize: 12.5, color: colors.tx2, ...tabular },
  pctSel: { color: colors.tx },
});
