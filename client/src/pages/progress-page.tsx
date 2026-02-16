import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useTheme } from '../styles/theme';
import { useMode } from '../context/ModeContext';
import { queryKeys, staleTimes } from '../lib/queryKeys';
import LessonCard from '../components/LessonCard';
import LearnerProgress from '../components/LearnerProgress';
import FunLoader from '../components/FunLoader';
import { ArrowLeft, Award, Star, Zap, BookOpen } from 'react-feather';

const ProgressPage = () => {
  const { user } = useAuth();
  const { selectedLearner } = useMode();
  const { colors, typography, commonStyles } = useTheme();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  const learnerId = selectedLearner?.id || user?.id;

  // Fetch lesson history
  const {
    data: lessons,
    isLoading: isLessonsLoading,
    error: lessonsError,
  } = useQuery({
    queryKey: queryKeys.lessonHistory(learnerId),
    queryFn: () => apiRequest('GET', `/api/lessons?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
    staleTime: staleTimes.learnerData,
  });

  // Fetch achievements
  const {
    data: achievements,
    isLoading: isAchievementsLoading,
    error: achievementsError,
  } = useQuery({
    queryKey: queryKeys.achievements(learnerId),
    queryFn: () => apiRequest('GET', `/api/achievements?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
    staleTime: staleTimes.learnerData,
  });

  // Fetch points balance
  const { data: pointsData } = useQuery({
    queryKey: queryKeys.points(learnerId),
    queryFn: () => apiRequest('GET', `/api/points/balance?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
    staleTime: staleTimes.learnerData,
  });

  // Fetch learner profile for mastery data
  const { data: profile } = useQuery({
    queryKey: queryKeys.learnerProfile(learnerId as number),
    queryFn: () => apiRequest('GET', `/api/learner-profile/${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
    staleTime: staleTimes.learnerData,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.lessonHistory(learnerId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.achievements(learnerId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.points(learnerId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.learnerProfile(learnerId as number) }),
    ]);
    setRefreshing(false);
  }, [learnerId]);

  const isLoading = isLessonsLoading || isAchievementsLoading;
  const hasError = lessonsError || achievementsError;

  const getCompletedLessonCount = () => {
    if (!lessons) return 0;
    return lessons.filter((lesson: any) => lesson.status === 'DONE').length;
  };

  const getAverageScore = () => {
    if (!lessons) return 0;
    const completedLessons = lessons.filter((lesson: any) => lesson.status === 'DONE' && lesson.score !== null);
    if (completedLessons.length === 0) return 0;
    const totalScore = completedLessons.reduce((sum: number, lesson: any) => sum + (lesson.score || 0), 0);
    return Math.round(totalScore / completedLessons.length);
  };

  // Build subject mastery from lesson history
  const getSubjectMastery = () => {
    if (!lessons) return [];
    const subjectScores: Record<string, { total: number; count: number }> = {};
    lessons.forEach((lesson: any) => {
      if (lesson.status === 'DONE' && lesson.subject && lesson.score != null) {
        if (!subjectScores[lesson.subject]) {
          subjectScores[lesson.subject] = { total: 0, count: 0 };
        }
        subjectScores[lesson.subject].total += lesson.score;
        subjectScores[lesson.subject].count += 1;
      }
    });
    return Object.entries(subjectScores).map(([subject, data]) => ({
      subject,
      mastery: data.total / data.count,
    }));
  };

  // Get achievement badge icon by type
  const getAchievementIcon = (type: string) => {
    if (type?.includes('streak')) return <Zap size={24} color="#FFD93D" />;
    if (type?.includes('quiz') || type?.includes('master')) return <Award size={24} color="#C084FC" />;
    if (type?.includes('first') || type?.includes('lesson')) return <BookOpen size={24} color="#6BCB77" />;
    return <Star size={24} color="#FF8C42" />;
  };

  // Get achievement badge color by type
  const getAchievementBgColor = (type: string) => {
    if (type?.includes('streak')) return '#FFF8E1';
    if (type?.includes('quiz') || type?.includes('master')) return '#F3E8FF';
    if (type?.includes('first') || type?.includes('lesson')) return '#E8F5E9';
    return '#FFF3E0';
  };

  const totalPoints = pointsData?.balance || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surfaceColor, borderBottomColor: colors.divider }]}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={() => setLocation('/learner')}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Progress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <FunLoader message="Loading your progress..." />
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              Something went wrong. Please try again.
            </Text>
            <TouchableOpacity style={[commonStyles.button]} onPress={onRefresh}>
              <Text style={commonStyles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Level & Stats via LearnerProgress */}
            <LearnerProgress
              totalPoints={totalPoints}
              lessonsCompleted={getCompletedLessonCount()}
              achievementCount={achievements?.length || 0}
              streak={0}
              averageScore={getAverageScore()}
              subjectMastery={getSubjectMastery()}
            />

            {/* Achievements Trophy Case */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Trophies</Text>

              {achievements && achievements.length > 0 ? (
                <View style={styles.trophyGrid}>
                  {achievements.map((achievement: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.trophyItem,
                        { backgroundColor: getAchievementBgColor(achievement.type) },
                      ]}
                    >
                      <View style={styles.trophyIconContainer}>
                        {getAchievementIcon(achievement.type)}
                      </View>
                      <Text style={styles.trophyTitle} numberOfLines={2}>
                        {achievement.payload?.title || 'Achievement'}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surfaceColor }]}>
                  <Award size={40} color="#DFE6E9" />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    Complete lessons to earn trophies!
                  </Text>
                </View>
              )}
            </View>

            {/* Lesson History */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Lessons</Text>

              {lessons && lessons.length > 0 ? (
                lessons.slice(0, 10).map((lesson: any, index: number) => (
                  <LessonCard
                    key={index}
                    lesson={lesson}
                    isHistory
                    onPress={() => {}}
                    style={styles.historyCard}
                  />
                ))
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.surfaceColor }]}>
                  <BookOpen size={40} color="#DFE6E9" />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    Start a lesson to see your history!
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButtonSmall: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  trophyItem: {
    width: '30%',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginRight: '3.33%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  trophyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ProgressPage;