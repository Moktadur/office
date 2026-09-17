import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SpiderSenseProps {
  active: boolean;
  type: 'yellow' | 'red';
  text?: string;
}

export const SpiderSenseAlert: React.FC<SpiderSenseProps> = ({
  active,
  type,
  text,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.3,
              duration: 220,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.9,
              duration: 220,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0.4);
      scaleAnim.setValue(0.85);
    }
  }, [active]);

  if (!active) return null;

  const color = type === 'yellow' ? '#FACC15' : '#EF4444';
  const label = type === 'yellow' ? 'PARRY!' : 'DODGE!';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: pulseAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <Svg width={110} height={45} viewBox="0 0 110 45">
        {/* Inner Sense Arcs */}
        <Path
          d="M 28 35 Q 55 12 82 35"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Outer Sense Arcs */}
        <Path
          d="M 12 25 Q 55 -5 98 25"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        {/* Peripheral lines */}
        <Path
          d="M 6 36 L 16 28"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 104 36 L 94 28"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>

      <View
        style={[
          styles.badge,
          { backgroundColor: type === 'yellow' ? '#854D0E' : '#7F1D1D' },
        ]}
      >
        <Text style={[styles.badgeText, { color }]}>
          {text || label}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: -8,
    borderWidth: 1,
    borderColor: '#FFFFFF44',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
