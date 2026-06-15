// Barre de progression animée de l'onboarding.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { accent } from '../theme';

export default function ProgressBar({ progress }: { progress: number }) {
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 450, useNativeDriver: false }).start();
  }, [progress, anim]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: accent },
});
