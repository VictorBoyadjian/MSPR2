import { Tabs } from 'expo-router';
import { ColorValue, Image, ImageSourcePropType, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

function tabIcon(src: ImageSourcePropType) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Image
      source={src}
      style={{ width: size, height: size, tintColor: color }}
      resizeMode="contain"
    />
  );
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon(require('@/assets/images/tabIcons/home.png')),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Nutrition',
          tabBarIcon: tabIcon(require('@/assets/images/tabIcons/nutrition.png')),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Sport',
          tabBarIcon: tabIcon(require('@/assets/images/tabIcons/explore.png')),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: 'Planning',
          tabBarIcon: tabIcon(require('@/assets/images/tabIcons/explore.png')),
        }}
      />
    </Tabs>
  );
}
