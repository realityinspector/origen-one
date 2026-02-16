import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Star, Award, Zap, BookOpen, Target } from 'react-feather';
import Confetti from './Confetti';

interface Achievement {
  title: string;
  description?: string;
  icon?: string;
  type?: string;
}

interface AchievementUnlockProps {
  achievements: Achievement[];
  visible: boolean;
  onDismiss: () => void;
}

const BADGE_ICONS: Record<string, React.FC<any>> = {
  'first-lesson': BookOpen,
  'quiz-master': Award,
  'streak': Zap,
  'star': Star,
  'target': Target,
  'default': Award,
};

const BADGE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  'first-lesson': { bg: '#FFD93D', border: '#F0C419', glow: 'rgba(255, 217, 61, 0.4)' },
  'quiz-master': { bg: '#C084FC', border: '#A855F7', glow: 'rgba(192, 132, 252, 0.4)' },
  'streak': { bg: '#FF8C42', border: '#E5732A', glow: 'rgba(255, 140, 66, 0.4)' },
  'default': { bg: '#FFD93D', border: '#F0C419', glow: 'rgba(255, 217, 61, 0.4)' },
};

const AchievementUnlock: React.FC<AchievementUnlockProps> = ({ achievements, visible, onDismiss }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (!visible || !currentAchievement) return;

    // Reset animations
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    glowAnim.setValue(0);
    textAnim.setValue(0);

    // Sequence: badge zooms in with spring, then text fades in, then confetti
    Animated.sequence([
      // Badge zoom in with overshoot
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: false,
      }),
      // Glow pulse
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      // Text slide in
      Animated.spring(textAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowConfetti(true);
    });

    // Continuous gentle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [visible, currentIndex]);

  const handleNext = () => {
    setShowConfetti(false);
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      onDismiss();
    }
  };

  if (!visible || !currentAchievement) return null;

  const badgeType = currentAchievement.type || 'default';
  const badgeColor = BADGE_COLORS[badgeType] || BADGE_COLORS.default;
  const IconComponent = BADGE_ICONS[badgeType] || BADGE_ICONS.default;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const textTranslate = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <Confetti active={showConfetti} />

        <View style={styles.content}>
          {/* Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate },
                ],
              },
            ]}
          >
            {/* Glow ring */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  backgroundColor: badgeColor.glow,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            {/* Badge circle */}
            <View style={[styles.badge, { backgroundColor: badgeColor.bg, borderColor: badgeColor.border }]}>
              <IconComponent size={48} color="#FFFFFF" />
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={{
              opacity: textAnim,
              transform: [{ translateY: textTranslate }],
            }}
          >
            <Text style={styles.unlockLabel}>Achievement Unlocked!</Text>
            <Text style={styles.title}>{currentAchievement.title}</Text>
            {currentAchievement.description && (
              <Text style={styles.description}>{currentAchievement.description}</Text>
            )}
          </Animated.View>

          {/* Progress indicator for multiple achievements */}
          {achievements.length > 1 && (
            <View style={styles.dots}>
              {achievements.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === currentIndex && styles.activeDot]}
                />
              ))}
            </View>
          )}

          {/* Tap to continue */}
          <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
            <Text style={styles.continueText}>
              {currentIndex < achievements.length - 1 ? 'Next' : 'Awesome!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 40,
  },
  badgeContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  unlockLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD93D',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFD93D',
    width: 24,
  },
  continueButton: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default AchievementUnlock;
