import { Href } from 'expo-router';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import Icon, { IconName } from '@/components/ui/Icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Barre de navigation web : même disposition et mêmes icônes (Ionicons) que sur
 * mobile — barre en bas, icône au-dessus du libellé, version pleine quand actif.
 */
type TabDef = { name: string; href: Href; label: string; icon: IconName };

const TABS: TabDef[] = [
  { name: 'index', href: '/', label: 'Accueil', icon: 'home' },
  { name: 'community', href: '/community', label: 'Communauté', icon: 'community' },
  { name: 'meals', href: '/meals', label: 'Repas', icon: 'meals' },
  { name: 'workouts', href: '/workouts', label: 'Sport', icon: 'workouts' },
  { name: 'health', href: '/health', label: 'Santé', icon: 'health' },
];

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton icon={tab.icon}>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: IconName };

export function TabButton({ children, icon, isFocused, ...props }: TabButtonProps) {
  const theme = useTheme();
  const color = isFocused ? theme.accentText : theme.textSecondary;
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Icon name={isFocused ? (`${icon}-filled` as IconName) : icon} size={24} color={color} />
      <ThemedText type="small" themeColor={isFocused ? 'accentText' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView style={[styles.innerContainer, { borderTopColor: theme.backgroundSelected }]}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.one,
  },
  pressed: { opacity: 0.6 },
});
