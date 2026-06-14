import { StyleSheet, View } from 'react-native';

import AppBar from '@/components/app-bar';
import AppTabs from '@/components/app-tabs';

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <AppBar />
      <View style={styles.body}>
        <AppTabs />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
