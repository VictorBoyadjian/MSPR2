// components/Heart.js — heart glyph, optionally beating.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const D =
  'M12 21s-7.5-4.9-10-9.3C.4 8.4 1.9 4.8 5.2 4.8c2 0 3.3 1.1 4.1 2.3l.7 1 .7-1c.8-1.2 2.1-2.3 4.1-2.3 3.3 0 4.8 3.6 3.2 6.9C19.5 16.1 12 21 12 21z';

export default function Heart({ size = 34, color = '#CBFF3C', beat = false, dur = 860 }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!beat) return;
    const seq = Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: dur * 0.14, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: dur * 0.14, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.12, duration: dur * 0.14, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: dur * 0.14, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.delay(dur * 0.44),
    ]);
    const loop = Animated.loop(seq);
    loop.start();
    return () => loop.stop();
  }, [beat, dur]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={D} fill={color} />
      </Svg>
    </Animated.View>
  );
}
