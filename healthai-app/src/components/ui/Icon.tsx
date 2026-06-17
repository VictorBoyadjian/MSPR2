// Icônes vectorielles de l'app (famille unique Ionicons, rendue sur natif ET web).
// On expose des noms sémantiques pour centraliser le choix des glyphes.
import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { ColorValue } from 'react-native';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type IconName =
  | 'home'
  | 'home-filled'
  | 'meals'
  | 'meals-filled'
  | 'workouts'
  | 'workouts-filled'
  | 'health'
  | 'health-filled'
  | 'profile'
  | 'profile-filled'
  | 'weight'
  | 'pulse'
  | 'camera'
  | 'edit'
  | 'close'
  | 'logout'
  | 'trash'
  | 'add'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'search'
  | 'chevron'
  | 'back'
  | 'time'
  | 'flame'
  | 'list'
  | 'theme-auto'
  | 'theme-light'
  | 'theme-dark';

const GLYPHS: Record<IconName, IoniconName> = {
  home: 'home-outline',
  'home-filled': 'home',
  meals: 'restaurant-outline',
  'meals-filled': 'restaurant',
  workouts: 'barbell-outline',
  'workouts-filled': 'barbell',
  health: 'heart-outline',
  'health-filled': 'heart',
  profile: 'person-outline',
  'profile-filled': 'person',
  weight: 'scale-outline',
  pulse: 'fitness-outline',
  camera: 'camera-outline',
  edit: 'create-outline',
  close: 'close',
  logout: 'log-out-outline',
  trash: 'trash-outline',
  add: 'add',
  breakfast: 'cafe-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'nutrition-outline',
  search: 'search-outline',
  chevron: 'chevron-forward',
  back: 'chevron-back',
  time: 'time-outline',
  flame: 'flame-outline',
  list: 'list-outline',
  'theme-auto': 'contrast-outline',
  'theme-light': 'sunny-outline',
  'theme-dark': 'moon-outline',
};

type Props = {
  name: IconName;
  size?: number;
  color?: ColorValue;
};

export default function Icon({ name, size = 24, color }: Props) {
  return <Ionicons name={GLYPHS[name]} size={size} color={color as string} />;
}
