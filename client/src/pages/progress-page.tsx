import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiRequest, queryClient } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import LessonCard from '../components/LessonCard';
import { ArrowLeft, Award, BookOpen, Check } from 'react-feather';

const ProgressPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch lesson history
  const {
    data: lessons,
    isLoading: isLessonsLoading,
    error: lessonsError,
  } = useQuery({
    queryKey: [`/api/lessons?learnerId=${user?.id}`],
    queryFn: () => apiRequest('GET', `/api/lessons?learnerId=${user?.id}`).then(res => res.data),
    enabled: !!user?.id,
  });

  // Fetch achievements
  const {
    data: achievements,
    isLoading: isAchievementsLoading,
    error: achievementsError,
  } = useQuery({
    queryKey: [`/api/achievements?learnerId=${user?.id}`],
    queryFn: () => apiRequest('GET', `/api/achievements?learnerId=${user?.id}`).then(res => res.data),
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [`/api/lessons?learnerId=${user?.id}`] }),
      queryClient.invalidateQueries({ queryKey: [`/api/achievements?learnerId=${user?.id}`] }),
    ]);
    setRefreshing(false);
  }, [user?.id]);

  const isLoading = isLessonsLoading || isAchievementsLoading;
  const hasError = lessonsError || achievementsError;

  const getCompletedLessonCount = () => {
    if (!lessons) return 0;
    return lessons.filter(lesson => lesson.status === 'DONE').length;
  };

  const getAverageScore = () => {
    if (!lessons) return 0;
    const completedLessons = lessons.filter(lesson => lesson.status === 'DONE' && lesson.score !== null);
    if (completedLessons.length === 0) return 0;
    
    const totalScore = completedLessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0);
    return Math.round(totalScore / completedLessons.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={() => setLocation('/learner')}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Something went wrong. Please try again.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <BookOpen size={24} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{getCompletedLessonCount()}</Text>
                <Text style={styles.statLabel}>Lessons Completed</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Check size={24} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{getAverageScore()}%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Award size={24} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{achievements?.length || 0}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </View>

            {/* Lesson History */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Lesson History</Text>
              </View>
              
              {lessons && lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <LessonCard 
                    key={index} 
                    lesson={lesson} 
                    isHistory
                    onPress={() => {}}
                    style={styles.historyCard}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    You haven't completed any lessons yet.
                  </Text>
                </View>
              )}
            </View>

            {/* Achievements */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>
              
              {achievements && achievements.length > 0 ? (
                <View style={styles.achievementsContainer}>
                  {achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <View style={styles.achievementIcon}>
                        <Award size={24} color={colors.primary} />
                      </View>
                      <View style={styles.achievementContent}>
                        <Text style={styles.achievementTitle}>
                          {achievement.payload.title}
                        </Text>
                        <Text style={styles.achievementDescription}>
                          {achievement.payload.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Complete lessons to earn achievements!
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surfaceColor,
  },
  headerTitle: {
    ...typography.subtitle1,
    textAlign: 'center',
  },
  backButtonSmall: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    ...typography.h2,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 0,
  },
  historyCard: {
    marginBottom: 12,
  },
  achievementsContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    ...typography.subtitle1,
    marginBottom: 4,
  },
  achievementDescription: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
  },
  emptyStateText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    ...commonStyles.button,
  },
  retryButtonText: {
    ...commonStyles.buttonText,
  },
});

export default ProgressPage;