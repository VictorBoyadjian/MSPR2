import { Tabs } from 'expo-router';
import { ColorValue, useColorScheme } from 'react-native';

import Icon, { IconName } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';

/** Icône d'onglet : version pleine quand actif, contour sinon. */
function tabIcon(base: IconName) {
  const TabBarIcon = ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Icon name={focused ? (`${base}-filled` as IconName) : base} size={size} color={color} />
  );
  TabBarIcon.displayName = `TabBarIcon(${base})`;
  return TabBarIcon;
}

export default function AppTabs() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme as 'light' | 'dark'] ?? Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="meals" options={{ title: 'Repas', tabBarIcon: tabIcon('meals') }} />
      <Tabs.Screen name="workouts" options={{ title: 'Sport', tabBarIcon: tabIcon('workouts') }} />
      <Tabs.Screen name="health" options={{ title: 'Santé', tabBarIcon: tabIcon('health') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: tabIcon('profile') }} />
    </Tabs>
  );
}
