import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

import Icon, { IconName } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';
import { useColorSchemeResolved } from '@/hooks/use-theme';

/** Icône d'onglet : version pleine quand actif, contour sinon. */
function tabIcon(base: IconName) {
  const TabBarIcon = ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Icon name={focused ? (`${base}-filled` as IconName) : base} size={size} color={color} />
  );
  TabBarIcon.displayName = `TabBarIcon(${base})`;
  return TabBarIcon;
}

export default function AppTabs() {
  const colors = Colors[useColorSchemeResolved()];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentText,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="community" options={{ title: 'Communauté', tabBarIcon: tabIcon('community') }} />
      <Tabs.Screen name="meals" options={{ title: 'Repas', tabBarIcon: tabIcon('meals') }} />
      <Tabs.Screen name="workouts" options={{ title: 'Sport', tabBarIcon: tabIcon('workouts') }} />
      <Tabs.Screen name="health" options={{ title: 'Santé', tabBarIcon: tabIcon('health') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: tabIcon('profile') }} />
    </Tabs>
  );
}
