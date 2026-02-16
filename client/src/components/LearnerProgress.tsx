import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Star, Zap, Award, BookOpen, Target } from 'react-feather';

// Level system: maps total points to levels
const LEVELS = [
  { level: 1, name: 'Beginner', minPoints: 0, maxPoints: 100, color: '#6BCB77' },
  { level: 2, name: 'Explorer', minPoints: 100, maxPoints: 300, color: '#4A90D9' },
  { level: 3, name: 'Adventurer', minPoints: 300, maxPoints: 600, color: '#C084FC' },
  { level: 4, name: 'Scholar', minPoints: 600, maxPoints: 1000, color: '#FF8C42' },
  { level: 5, name: 'Expert', minPoints: 1000, maxPoints: 1500, color: '#FFD93D' },
  { level: 6, name: 'Master', minPoints: 1500, maxPoints: 2200, color: '#FF6B6B' },
  { level: 7, name: 'Champion', minPoints: 2200, maxPoints: 3000, color: '#00D2FF' },
  { level: 8, name: 'Legend', minPoints: 3000, maxPoints: 4000, color: '#FFD93D' },
  { level: 9, name: 'Genius', minPoints: 4000, maxPoints: 5500, color: '#C084FC' },
  { level: 10, name: 'Superstar', minPoints: 5500, maxPoints: 999999, color: '#FF8C42' },
];

function getLevelInfo(totalPoints: number) {
  const currentLevel = LEVELS.find(
    (l) => totalPoints >= l.minPoints && totalPoints < l.maxPoints
  ) || LEVELS[LEVELS.length - 1];

  const pointsInLevel = totalPoints - currentLevel.minPoints;
  const pointsNeeded = currentLevel.maxPoints - currentLevel.minPoints;
  const progress = Math.min(pointsInLevel / pointsNeeded, 1);
  const pointsToNext = currentLevel.maxPoints - totalPoints;

  return { ...currentLevel, progress, pointsInLevel, pointsToNext };
}

interface LearnerProgressProps {
  totalPoints: number;
  lessonsCompleted: number;
  achievementCount: number;
  streak: number;
  averageScore: number;
  subjectMastery?: { subject: string; mastery: number }[];
}

const LearnerProgress: React.FC<LearnerProgressProps> = ({
  totalPoints,
  lessonsCompleted,
  achievementCount,
  streak,
  averageScore,
  subjectMastery = [],
}) => {
  const level = getLevelInfo(totalPoints);

  return (
    <View style={styles.container}>
      {/* Level Card */}
      <View style={[styles.levelCard, { borderColor: level.color }]}>
        <View style={styles.levelHeader}>
          <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
            <Star size={24} color="#FFFFFF" />
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel}>Level {level.level}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
          </View>
          <View style={styles.pointsDisplay}>
            <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        {/* Progress bar to next level */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(level.progress * 100)}%`,
                  backgroundColor: level.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {level.pointsToNext > 0
              ? `${level.pointsToNext} points to Level ${level.level + 1}`
              : 'Max Level!'}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
            <BookOpen size={20} color="#6BCB77" />
          </View>
          <Text style={styles.statValue}>{lessonsCompleted}</Text>
          <Text style={styles.statLabel}>Lessons Done</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
            <Target size={20} color="#FF8C42" />
          </View>
          <Text style={styles.statValue}>{averageScore}%</Text>
          <Text style={styles.statLabel}>How I'm Doing</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF8E1' }]}>
            <Award size={20} color="#FFD93D" />
          </View>
          <Text style={styles.statValue}>{achievementCount}</Text>
          <Text style={styles.statLabel}>My Trophies</Text>
        </View>

        {streak > 0 && (
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFEBEE' }]}>
              <Zap size={20} color="#FF6B6B" />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        )}
      </View>

      {/* Subject Mastery Rings */}
      {subjectMastery.length > 0 && (
        <View style={styles.masterySection}>
          <Text style={styles.masteryTitle}>My Subjects</Text>
          <View style={styles.masteryGrid}>
            {subjectMastery.map((item, index) => {
              const percentage = Math.round(item.mastery);
              const ringColor = percentage >= 70 ? '#6BCB77' : percentage >= 40 ? '#FFD93D' : '#FF8C42';

              return (
                <View key={index} style={styles.masteryItem}>
                  <View style={styles.ringContainer}>
                    {/* Background ring */}
                    <View style={[styles.ringBg]} />
                    {/* Progress ring (simulated with border) */}
                    <View
                      style={[
                        styles.ringProgress,
                        {
                          borderColor: ringColor,
                          borderTopColor: percentage < 25 ? '#E0E0E0' : ringColor,
                          borderRightColor: percentage < 50 ? '#E0E0E0' : ringColor,
                          borderBottomColor: percentage < 75 ? '#E0E0E0' : ringColor,
                          transform: [{ rotate: '-45deg' }],
                        },
                      ]}
                    />
                    <Text style={[styles.ringText, { color: ringColor }]}>{percentage}%</Text>
                  </View>
                  <Text style={styles.masteryLabel} numberOfLines={1}>
                    {item.subject}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  // Level Card
  levelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginTop: 2,
  },
  pointsDisplay: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3436',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  progressSection: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 14,
    backgroundColor: '#F0F0F0',
    borderRadius: 7,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 7,
  },
  progressText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '500',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Subject Mastery
  masterySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  masteryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  masteryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  masteryItem: {
    alignItems: 'center',
    width: 80,
    marginBottom: 16,
  },
  ringContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  ringBg: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#F0F0F0',
  },
  ringProgress: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
  },
  ringText: {
    fontSize: 16,
    fontWeight: '700',
  },
  masteryLabel: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LearnerProgress;
