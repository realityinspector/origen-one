import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { apiRequest, queryClient } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import LessonCard from '../components/LessonCard';
import AchievementBadge from '../components/AchievementBadge';
import { Book, Award, BarChart2, User } from 'react-feather';
import { useFocusEffect } from '@react-navigation/native';
import TokenBalance from '../components/TokenBalance';

const LearnerDashboard = ({ navigation }: any) => {
  const { user, logoutMutation } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  // Fetch active lesson
  const {
    data: activeLesson,
    isLoading: isLessonLoading,
    error: lessonError,
  } = useQuery({
    queryKey: ['/api/lessons/active'],
    queryFn: () => apiRequest('GET', '/api/lessons/active').then(res => res.data),
  });

  // Fetch achievements
  const {
    data: achievements,
    isLoading: isAchievementsLoading,
    error: achievementsError,
  } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: () => apiRequest('GET', '/api/achievements').then(res => res.data),
  });

  // Fetch learner profile (for knowledge graph)
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: [`/api/learner-profile/${user?.id}`],
    queryFn: () => apiRequest('GET', `/api/learner-profile/${user?.id}`).then(res => res.data),
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] }),
      queryClient.invalidateQueries({ queryKey: [`/api/learner-profile/${user?.id}`] }),
    ]);
    setRefreshing(false);
  }, [user?.id]);

  // Refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const isLoading = isLessonLoading || isAchievementsLoading || isProfileLoading;
  const hasError = lessonError || achievementsError || profileError;

  // Get the three most recent achievements
  const recentAchievements = achievements?.slice(0, 3) || [];

  if (hasError) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={styles.errorText}>
          Something went wrong. Please try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <User size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {user?.name}!</Text>
              <Text style={styles.gradeText}>
                Grade {profile?.gradeLevel || '—'}
              </Text>
            </View>
          </View>
          <TokenBalance />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => logoutMutation.mutate()}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Active Lesson Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Lesson</Text>
          </View>

          {isLessonLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : activeLesson ? (
            <LessonCard
              lesson={activeLesson}
              onPress={() => navigation.navigate('LessonPage', { lessonId: activeLesson.id })}
            />
          ) : (
            <View style={styles.emptyState}>
              <Book size={48} color={colors.primaryLight} />
              <Text style={styles.emptyStateText}>No active lesson available</Text>
            </View>
          )}
        </View>

        {/* Progress Summary */}
        <TouchableOpacity 
          style={styles.progressSummary}
          onPress={() => navigation.navigate('ProgressPage')}
        >
          <View style={styles.progressIcon}>
            <BarChart2 size={24} color={colors.onPrimary} />
          </View>
          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>Your Learning Progress</Text>
            <Text style={styles.progressText}>
              {profile?.graph?.nodes?.length 
                ? `You've learned ${profile.graph.nodes.length} concepts!` 
                : 'Start learning to see your progress'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Recent Achievements */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProgressPage')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isAchievementsLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : recentAchievements.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsContainer}>
              {recentAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  style={styles.achievementBadge}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Award size={48} color={colors.primaryLight} />
              <Text style={styles.emptyStateText}>Complete lessons to earn achievements</Text>
            </View>
          )}
        </View>

        {/* Help Card */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you have any questions or need assistance with your learning journey, 
            ask your parent to contact support.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greeting: {
    ...typography.h2,
    marginBottom: 0,
  },
  gradeText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  logoutButtonText: {
    color: colors.onError,
    fontSize: 12,
    fontWeight: '600',
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
  seeAllText: {
    ...typography.button,
    color: colors.primary,
  },
  progressSummary: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginBottom: 24,
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressContent: {
    flex: 1,
  },
  progressTitle: {
    ...typography.subtitle1,
    color: colors.onPrimary,
    marginBottom: 4,
  },
  progressText: {
    ...typography.body2,
    color: colors.onPrimary,
  },
  achievementsContainer: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  achievementBadge: {
    marginHorizontal: 8,
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
    marginTop: 12,
    textAlign: 'center',
  },
  helpCard: {
    ...commonStyles.card,
    backgroundColor: colors.primaryLight,
    marginBottom: 24,
  },
  helpTitle: {
    ...typography.h3,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  helpText: {
    ...typography.body2,
    color: colors.onPrimary,
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    ...commonStyles.button,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    ...commonStyles.buttonText,
    fontSize: 14,
  },
});

export default LearnerDashboard;
