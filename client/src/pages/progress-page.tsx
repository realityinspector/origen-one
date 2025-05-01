import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles } from '../styles/theme';
import { ArrowLeft, BookOpen, Award, BarChart2 } from 'react-feather';
import KnowledgeGraph from '../components/KnowledgeGraph';
import AchievementBadge from '../components/AchievementBadge';
import LessonCard from '../components/LessonCard';

const ProgressPage = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('progress'); // 'progress', 'achievements', 'lessons'
  
  // Get learnerId from route params or use current user's id if learner
  const learnerId = route.params?.learnerId || (user?.role === 'LEARNER' ? user.id : null);
  const parentId = route.params?.parentId;
  
  // For admin viewing a parent's learners
  const {
    data: learners,
    isLoading: learnersLoading,
  } = useQuery({
    queryKey: [`/api/learners?parentId=${parentId}`],
    queryFn: () => apiRequest('GET', `/api/learners?parentId=${parentId}`).then(res => res.data),
    enabled: !!parentId && user?.role === 'ADMIN',
  });
  
  // Fetch learner profile (for knowledge graph)
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: [`/api/learner-profile/${learnerId}`],
    queryFn: () => apiRequest('GET', `/api/learner-profile/${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
  });
  
  // Fetch achievements
  const {
    data: achievements,
    isLoading: achievementsLoading,
    error: achievementsError,
  } = useQuery({
    queryKey: [`/api/achievements?learnerId=${learnerId}`],
    queryFn: () => apiRequest('GET', `/api/achievements?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
  });
  
  // Fetch lesson history
  const {
    data: lessons,
    isLoading: lessonsLoading,
    error: lessonsError,
  } = useQuery({
    queryKey: [`/api/lessons?learnerId=${learnerId}`],
    queryFn: () => apiRequest('GET', `/api/lessons?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
  });
  
  const onRefresh = useCallback(async () => {
    if (!learnerId) return;
    
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [`/api/learner-profile/${learnerId}`] }),
      queryClient.invalidateQueries({ queryKey: [`/api/achievements?learnerId=${learnerId}`] }),
      queryClient.invalidateQueries({ queryKey: [`/api/lessons?learnerId=${learnerId}`] }),
    ]);
    setRefreshing(false);
  }, [learnerId]);
  
  const isLoading = profileLoading || achievementsLoading || lessonsLoading || learnersLoading;
  const hasError = profileError || achievementsError || lessonsError;
  
  const getLearnerName = () => {
    if (user?.role === 'LEARNER') return user.name;
    
    if (learnerId && learners) {
      const learner = learners.find((l: any) => l.id === learnerId);
      if (learner) return learner.name;
    }
    
    return 'Learner';
  };
  
  // For admin selecting a learner from a parent's account
  if (user?.role === 'ADMIN' && parentId && !learnerId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Learner</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {learnersLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {learners && learners.length > 0 ? (
              learners.map((learner: any) => (
                <TouchableOpacity
                  key={learner.id}
                  style={styles.learnerCard}
                  onPress={() => navigation.navigate('ProgressPage', { learnerId: learner.id })}
                >
                  <Text style={styles.learnerName}>{learner.name}</Text>
                  <Text style={styles.learnerEmail}>{learner.email}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No learners found for this parent</Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }
  
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading progress data. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {user?.role === 'LEARNER' ? 'My Progress' : `${getLearnerName()}'s Progress`}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <BarChart2 
            size={20} 
            color={activeTab === 'progress' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'progress' && styles.activeTabText
            ]}
          >
            Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Award 
            size={20} 
            color={activeTab === 'achievements' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'achievements' && styles.activeTabText
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => setActiveTab('lessons')}
        >
          <BookOpen 
            size={20} 
            color={activeTab === 'lessons' ? colors.primary : colors.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'lessons' && styles.activeTabText
            ]}
          >
            Lessons
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading progress data...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'progress' && (
            <View>
              <View style={styles.statCards}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {profile?.graph?.nodes?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Concepts Learned</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {lessons?.filter((l: any) => l.status === 'DONE').length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Lessons Completed</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {achievements?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Achievements</Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Knowledge Graph</Text>
              <View style={styles.graphContainer}>
                {profile?.graph?.nodes && profile.graph.nodes.length > 0 ? (
                  <KnowledgeGraph graph={profile.graph} />
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No knowledge graph data available yet. Complete lessons to build your knowledge graph.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {activeTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              {achievements && achievements.length > 0 ? (
                achievements.map((achievement: any) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    style={styles.achievementBadge}
                    large
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Award size={48} color={colors.primaryLight} />
                  <Text style={styles.emptyStateText}>
                    No achievements earned yet. Complete lessons to earn achievements!
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === 'lessons' && (
            <View>
              <Text style={styles.sectionTitle}>Lesson History</Text>
              {lessons && lessons.length > 0 ? (
                lessons.map((lesson: any) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isHistory
                    style={styles.lessonCard}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <BookOpen size={48} color={colors.primaryLight} />
                  <Text style={styles.emptyStateText}>
                    No lesson history available yet.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
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
  },
  backButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  statCards: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    ...typography.h2,
    color: colors.onPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  graphContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    height: 300,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: Dimensions.get('window').width > 600 
      ? (Dimensions.get('window').width - 48) / 3 
      : (Dimensions.get('window').width - 40) / 2,
    marginBottom: 16,
  },
  lessonCard: {
    marginBottom: 16,
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
    paddingHorizontal: 24,
  },
  loader: {
    marginTop: 40,
  },
  learnerCard: {
    ...commonStyles.card,
    marginBottom: 12,
  },
  learnerName: {
    ...typography.subtitle1,
    marginBottom: 4,
  },
  learnerEmail: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});

export default ProgressPage;
