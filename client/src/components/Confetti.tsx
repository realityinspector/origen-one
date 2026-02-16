import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const CONFETTI_COLORS = ['#FFD93D', '#6BCB77', '#4A90D9', '#FF8C42', '#C084FC', '#FF6B6B', '#00D2FF'];
const NUM_PARTICLES = 40;
const SCREEN_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 400;
const SCREEN_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 800;

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  size: number;
  animatedY: Animated.Value;
  animatedX: Animated.Value;
  animatedRotate: Animated.Value;
  animatedOpacity: Animated.Value;
  shape: 'circle' | 'square' | 'star';
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000, onComplete }) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: ConfettiParticle[] = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 12,
      animatedY: new Animated.Value(-50),
      animatedX: new Animated.Value(0),
      animatedRotate: new Animated.Value(0),
      animatedOpacity: new Animated.Value(1),
      shape: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'star',
    }));

    setParticles(newParticles);

    // Animate each particle
    const animations = newParticles.map((p) => {
      const fallDelay = Math.random() * 500;
      const fallDuration = duration * 0.6 + Math.random() * duration * 0.4;
      const swayAmount = (Math.random() - 0.5) * 200;

      return Animated.parallel([
        Animated.timing(p.animatedY, {
          toValue: SCREEN_HEIGHT + 100,
          duration: fallDuration,
          delay: fallDelay,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(p.animatedX, {
            toValue: swayAmount,
            duration: fallDuration * 0.5,
            delay: fallDelay,
            useNativeDriver: false,
          }),
          Animated.timing(p.animatedX, {
            toValue: -swayAmount * 0.5,
            duration: fallDuration * 0.5,
            useNativeDriver: false,
          }),
        ]),
        Animated.timing(p.animatedRotate, {
          toValue: 360 * (2 + Math.random() * 3),
          duration: fallDuration,
          delay: fallDelay,
          useNativeDriver: false,
        }),
        Animated.timing(p.animatedOpacity, {
          toValue: 0,
          duration: fallDuration * 0.3,
          delay: fallDelay + fallDuration * 0.7,
          useNativeDriver: false,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      setParticles([]);
      onComplete?.();
    });
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => {
        const rotate = p.animatedRotate.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.x,
                width: p.size,
                height: p.shape === 'circle' ? p.size : p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? p.size / 2 : p.shape === 'square' ? 2 : 0,
                transform: [
                  { translateY: p.animatedY as any },
                  { translateX: p.animatedX as any },
                  { rotate },
                ],
                opacity: p.animatedOpacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
});

export default Confetti;
