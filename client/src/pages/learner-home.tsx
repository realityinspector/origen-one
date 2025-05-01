import React, { useCallback, useState } from 'react';
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
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { apiRequest, queryClient } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import LessonCard from '../components/LessonCard';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { Book, Award, BarChart2, User, Compass, Zap } from 'react-feather';

const LearnerHome = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch active lesson
  const {
    data: activeLesson,
    isLoading: isLessonLoading,
    error: lessonError,
  } = useQuery({
    queryKey: ['/api/lessons/active'],
    queryFn: async () => {
      try {
        console.log('Fetching active lesson...');
        const res = await apiRequest('GET', '/api/lessons/active');
        console.log('Active lesson response:', res);
        return res.data;
      } catch (err) {
        console.error('Error fetching active lesson:', err);
        throw err;
      }
    },
  });

  // Fetch learner profile
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: [`/api/learner-profile/${user?.id}`],
    queryFn: async () => {
      try {
        console.log(`Fetching learner profile for user ${user?.id}...`);
        const res = await apiRequest('GET', `/api/learner-profile/${user?.id}`);
        console.log('Learner profile response:', res);
        return res.data;
      } catch (err) {
        console.error('Error fetching learner profile:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  // Generate a new lesson
  const generateLessonMutation = useMutation({
    mutationFn: (data: { learnerId: number, topic: string, gradeLevel: number }) => {
      console.log('Generating new lesson with data:', data);
      return apiRequest('POST', '/api/lessons/create', data).then(res => res.data);
    },
    onSuccess: (data) => {
      console.log('Successfully generated new lesson:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] });
    },
    onError: (error) => {
      console.error('Error generating lesson:', error);
    }
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] }),
      queryClient.invalidateQueries({ queryKey: [`/api/learner-profile/${user?.id}`] }),
    ]);
    setRefreshing(false);
  }, [user?.id]);

  const handleGenerateLesson = () => {
    if (!user || !profile) return;
    
    generateLessonMutation.mutate({
      learnerId: user.id,
      topic: '', // Empty for auto-selection
      gradeLevel: profile.gradeLevel,
    });
  };

  const handleViewLesson = () => {
    if (activeLesson) {
      setLocation('/lesson');
    }
  };

  const isLoading = isLessonLoading || isProfileLoading || generateLessonMutation.isPending;
  const hasError = lessonError || profileError;

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
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {generateLessonMutation.isPending 
                ? 'Generating your personalized lesson...'
                : 'Loading your learning dashboard...'}
            </Text>
          </View>
        ) : hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Something went wrong. Please try again.
            </Text>
            {lessonError && (
              <Text style={styles.errorDetail}>
                Lesson error: {lessonError.message || String(lessonError)}
              </Text>
            )}
            {profileError && (
              <Text style={styles.errorDetail}>
                Profile error: {profileError.message || String(profileError)}
              </Text>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Active Lesson Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current Lesson</Text>
              </View>

              {activeLesson ? (
                <LessonCard
                  lesson={activeLesson}
                  onPress={handleViewLesson}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Book size={48} color={colors.primaryLight} />
                  <Text style={styles.emptyStateText}>
                    You don't have an active lesson
                  </Text>
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={handleGenerateLesson}
                  >
                    <Text style={styles.generateButtonText}>
                      Generate New Lesson
                    </Text>
                    <Zap size={16} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Knowledge Graph */}
            {profile?.graph && profile.graph.nodes.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Knowledge Graph</Text>
                </View>
                <View style={styles.graphContainer}>
                  <KnowledgeGraph graph={profile.graph} />
                </View>
              </View>
            )}

            {/* Learning Journey Card */}
            <TouchableOpacity 
              style={styles.journeyCard}
              onPress={() => setLocation('/progress')}
            >
              <View style={styles.journeyIcon}>
                <Compass size={24} color={colors.onPrimary} />
              </View>
              <View style={styles.journeyContent}>
                <Text style={styles.journeyTitle}>Your Learning Journey</Text>
                <Text style={styles.journeyText}>
                  Track your progress and see how far you've come
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
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
  journeyCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginBottom: 24,
  },
  journeyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  journeyContent: {
    flex: 1,
  },
  journeyTitle: {
    ...typography.subtitle1,
    color: colors.onPrimary,
    marginBottom: 4,
  },
  journeyText: {
    ...typography.body2,
    color: colors.onPrimary,
  },
  graphContainer: {
    height: 240,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 8,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  generateButton: {
    ...commonStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  generateButtonText: {
    ...commonStyles.buttonText,
    marginRight: 8,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    ...typography.body2,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    ...commonStyles.button,
  },
  retryButtonText: {
    ...commonStyles.buttonText,
  },
});

export default LearnerHome;
