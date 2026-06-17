// Champ texte façon Material : contour + label flottant animé (centré au repos, remonte au
// focus / quand rempli), couleur de bordure et de label qui réagit au focus et à l'erreur.
// Même API que l'ancien Input (label?, error? + TextInputProps) → remplacement transparent.
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TextInputProps, TextStyle, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

const DANGER = '#e5484d';
const FIELD_HEIGHT = 56;
// Distance dont le label remonte du centre vers le haut du champ quand il flotte.
const FLOAT_OFFSET = -19;

// Supprime le contour bleu par défaut du navigateur sur le web (on a déjà la bordure accent).
const webOutlineReset =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

export default function Input({
  label,
  error,
  style,
  value,
  defaultValue,
  placeholder,
  onFocus,
  onBlur,
  onChangeText,
  ...rest
}: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  // Pour un champ non contrôlé, on suit le texte localement ; sinon on lit `value`.
  const [innerText, setInnerText] = useState(defaultValue ?? '');
  const text = value !== undefined ? value : innerText;

  const floating = focused || text.length > 0;

  // Animations pilotées par l'état (pas d'effet ni de mutation de .value en handler).
  const floatV = useDerivedValue(() => withTiming(floating ? 1 : 0, { duration: 150 }), [floating]);
  const focusV = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration: 150 }), [focused]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? DANGER
      : interpolateColor(focusV.value, [0, 1], [theme.borderStrong, theme.accent]),
  }));

  // Le label part du centre (repos) et remonte en rétrécissant (flottant).
  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatV.value, [0, 1], [0, FLOAT_OFFSET]) },
      { scale: interpolate(floatV.value, [0, 1], [1, 0.75]) },
    ],
  }));

  const labelColor = error ? DANGER : focused ? theme.accentText : theme.textSecondary;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.field, { backgroundColor: theme.backgroundElement }, borderStyle]}>
        <TextInput
          value={value}
          defaultValue={defaultValue}
          // Le placeholder n'apparaît qu'au focus pour ne pas doubler le label au repos.
          placeholder={!label || floating ? placeholder : undefined}
          placeholderTextColor={theme.textSecondary}
          onChangeText={(t) => {
            if (value === undefined) setInnerText(t);
            onChangeText?.(t);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: theme.text }, webOutlineReset, style]}
          {...rest}
        />
        {label ? (
          <Animated.View pointerEvents="none" style={[styles.labelWrap, labelStyle]}>
            <Animated.Text numberOfLines={1} style={[styles.label, { color: labelColor }]}>
              {label}
            </Animated.Text>
          </Animated.View>
        ) : null}
      </Animated.View>
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  field: {
    height: FIELD_HEIGHT,
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  // Calque du label : occupe toute la hauteur et centre le texte → aligné avec le texte au repos.
  labelWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    transformOrigin: 'left center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: DANGER,
  },
});
