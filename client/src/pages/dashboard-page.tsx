import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles } from '../styles/theme';
import { Link, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { BookOpen, Target, Award, BarChart2, Plus, ArrowRight } from 'react-feather';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'create', 'progress', 'active'
  const learnerId = user?.role === 'LEARNER' ? user.id : null;

  // Fetch active lesson
  const {
    data: activeLesson,
    isLoading: lessonLoading,
    error: lessonError,
  } = useQuery({
    queryKey: [`/api/lessons/active`],
    queryFn: () => apiRequest('GET', `/api/lessons/active`).then(res => res.data),
    enabled: user?.role === 'LEARNER',
  });

  // Fetch learner profile for knowledge graph
  const {
    data: profile,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: [`/api/learner-profile/${learnerId}`],
    queryFn: () => apiRequest('GET', `/api/learner-profile/${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
  });

  // Fetch achievements
  const {
    data: achievements,
    isLoading: achievementsLoading,
  } = useQuery({
    queryKey: [`/api/achievements?learnerId=${learnerId}`],
    queryFn: () => apiRequest('GET', `/api/achievements?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
  });

  // Fetch lesson history
  const {
    data: lessons,
    isLoading: lessonsHistoryLoading,
  } = useQuery({
    queryKey: [`/api/lessons?learnerId=${learnerId}`],
    queryFn: () => apiRequest('GET', `/api/lessons?learnerId=${learnerId}`).then(res => res.data),
    enabled: !!learnerId,
  });

  // For creating a new lesson
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);

  // Navigate to create lesson page
  const handleCreateLesson = () => {
    navigate('/create-lesson');
  };

  // Navigate to active lesson
  const handleContinueLesson = () => {
    if (activeLesson?.id) {
      navigate(`/lesson/${activeLesson.id}`);
    }
  };

  // Navigate to progress page
  const handleViewProgress = () => {
    navigate('/progress');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Learning Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <BookOpen size={20} color={activeTab === 'overview' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        
        {user?.role === 'LEARNER' && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Plus size={20} color={activeTab === 'create' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Create Lesson</Text>
          </TouchableOpacity>
        )}
        
        {user?.role === 'LEARNER' && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
            onPress={() => setActiveTab('progress')}
          >
            <BarChart2 size={20} color={activeTab === 'progress' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>My Progress</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View>
            {user?.role === 'ADMIN' && (
              <View style={styles.adminSection}>
                <Text style={styles.sectionTitle}>Admin Tools</Text>
                <Link href="/admin">
                  <View style={styles.linkButton}>
                    <Text style={styles.linkButtonText}>Go to Admin Panel</Text>
                  </View>
                </Link>
              </View>
            )}
            
            {user?.role === 'LEARNER' && (
              <View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <BookOpen size={32} color={colors.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>AI-Generated Lessons</Text>
                    <Text style={styles.featureDescription}>
                      Create personalized lessons on any topic using our AI tutor
                    </Text>
                    <TouchableOpacity 
                      style={styles.featureButton}
                      onPress={handleCreateLesson}
                    >
                      <Text style={styles.featureButtonText}>Create New Lesson</Text>
                      <ArrowRight size={16} color={colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {activeLesson && (
                  <View style={styles.featureCard}>
                    <View style={styles.featureIconContainer}>
                      <Target size={32} color={colors.primary} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Continue Learning</Text>
                      <Text style={styles.featureDescription}>
                        You have an active lesson on {activeLesson.spec?.title || 'a topic'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.featureButton}
                        onPress={handleContinueLesson}
                      >
                        <Text style={styles.featureButtonText}>Continue Lesson</Text>
                        <ArrowRight size={16} color={colors.onPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Award size={32} color={colors.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Learning Progress</Text>
                    <Text style={styles.featureDescription}>
                      Track your learning journey with visualizations and achievements
                    </Text>
                    <TouchableOpacity 
                      style={styles.featureButton}
                      onPress={handleViewProgress}
                    >
                      <Text style={styles.featureButtonText}>View Progress</Text>
                      <ArrowRight size={16} color={colors.onPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            
            {(user?.role === 'PARENT' || user?.role === 'ADMIN') && (
              <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Learner Management</Text>
                <Link href="/learners">
                  <Text style={styles.linkText}>Manage Learners</Text>
                </Link>
                <Link href="/reports">
                  <Text style={styles.linkText}>View Reports</Text>
                </Link>
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'create' && user?.role === 'LEARNER' && (
          <View style={styles.createLessonContainer}>
            <Text style={styles.sectionTitle}>Create a New AI Lesson</Text>
            <Text style={styles.sectionDescription}>
              Our AI will generate a personalized educational lesson on any topic you choose!
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleCreateLesson}
            >
              <Text style={styles.primaryButtonText}>Start Creating</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {activeTab === 'progress' && user?.role === 'LEARNER' && (
          <View>
            <View style={styles.statsContainer}>
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
            
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={handleViewProgress}
            >
              <Text style={styles.viewMoreButtonText}>View Detailed Progress</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  welcomeText: {
    ...typography.subtitle1,
    color: colors.onPrimary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  content: {
    flex: 1,
    padding: 24,
  },
  adminSection: {
    backgroundColor: colors.warning + '33', // Adding transparency
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  contentSection: {
    backgroundColor: colors.surfaceColor,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h6,
    marginBottom: 16,
    color: colors.text,
  },
  sectionDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  linkButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  linkText: {
    ...typography.body1,
    color: colors.primary,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h6,
    marginBottom: 4,
    color: colors.text,
  },
  featureDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  featureButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  featureButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  createLessonContainer: {
    backgroundColor: colors.surfaceColor,
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  graphContainer: {
    height: 300,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  viewMoreButtonText: {
    ...typography.button,
    color: colors.primary,
    marginRight: 8,
  },
});

export default DashboardPage;
