import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SpiderEmblemProps {
  size?: number;
  color?: string;
  glowColor?: string;
  isSymbiote?: boolean;
}

export const SpiderEmblem: React.FC<SpiderEmblemProps> = ({
  size = 40,
  color = '#FFFFFF',
  glowColor = '#38BDF8',
  isSymbiote = false,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="100%" stopColor={glowColor} />
        </LinearGradient>
      </Defs>

      {/* Spider Head & Thorax */}
      <Circle cx="50" cy="34" r="8" fill="url(#emblemGrad)" />
      <Path
        d="M 50 36 C 44 42, 42 54, 50 72 C 58 54, 56 42, 50 36 Z"
        fill="url(#emblemGrad)"
      />

      {/* Top Left Leg */}
      <Path
        d="M 45 38 Q 30 22 18 20 Q 24 28 38 42 Z"
        fill="url(#emblemGrad)"
      />
      {/* Top Right Leg */}
      <Path
        d="M 55 38 Q 70 22 82 20 Q 76 28 62 42 Z"
        fill="url(#emblemGrad)"
      />

      {/* Upper Mid Left Leg */}
      <Path
        d="M 44 44 Q 24 35 14 38 Q 22 45 40 48 Z"
        fill="url(#emblemGrad)"
      />
      {/* Upper Mid Right Leg */}
      <Path
        d="M 56 44 Q 76 35 86 38 Q 78 45 60 48 Z"
        fill="url(#emblemGrad)"
      />

      {/* Lower Mid Left Leg */}
      <Path
        d="M 44 50 Q 20 54 12 68 Q 24 64 42 55 Z"
        fill="url(#emblemGrad)"
      />
      {/* Lower Mid Right Leg */}
      <Path
        d="M 56 50 Q 80 54 88 68 Q 76 64 58 55 Z"
        fill="url(#emblemGrad)"
      />

      {/* Bottom Left Leg */}
      <Path
        d="M 46 58 Q 28 72 24 88 Q 34 80 47 64 Z"
        fill="url(#emblemGrad)"
      />
      {/* Bottom Right Leg */}
      <Path
        d="M 54 58 Q 72 72 76 88 Q 66 80 53 64 Z"
        fill="url(#emblemGrad)"
      />

      {isSymbiote && (
        <Circle cx="50" cy="50" r="3" fill="#A855F7" opacity="0.8" />
      )}
    </Svg>
  );
};
