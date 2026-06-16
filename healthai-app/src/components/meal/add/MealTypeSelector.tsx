import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Icon, { IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MealType } from '@/services/api';

const MEAL_TYPES: { value: MealType; label: string; icon: IconName }[] = [
  { value: 'breakfast', label: 'Petit déj', icon: 'breakfast' },
  { value: 'lunch', label: 'Déjeuner', icon: 'lunch' },
  { value: 'dinner', label: 'Dîner', icon: 'dinner' },
  { value: 'snack', label: 'Collation', icon: 'snack' },
];

type Props = {
  value: MealType;
  onChange: (value: MealType) => void;
};

/** Sélecteur visuel du moment du repas (carte/icône par type). */
export function MealTypeSelector({ value, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {MEAL_TYPES.map((type) => {
        const active = type.value === value;
        return (
          <Pressable
            key={type.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(type.value)}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: active ? theme.accentSoft : theme.backgroundElement,
                borderColor: active ? theme.accent : theme.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Icon name={type.icon} size={22} color={active ? theme.accentText : theme.textSecondary} />
            <ThemedText type="smallBold" themeColor={active ? 'accentText' : 'text'}>
              {type.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
});
