import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Linking } from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles } from '../styles/theme';
import { Link, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { BookOpen, Target, Award, BarChart2, Plus, ArrowRight, User } from 'react-feather';
import { useMode } from '../context/ModeContext';
import ModeToggle from '../components/ModeToggle';

const DashboardPage: React.FC = () => {
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toggleMode, isLearnerMode } = useMode();
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
    setLocation('/create-lesson');
  };

  // Navigate to active lesson
  const handleContinueLesson = () => {
    if (activeLesson?.id) {
      setLocation(`/lesson/${activeLesson.id}`);
    }
  };

  // Navigate to progress page
  const handleViewProgress = () => {
    setLocation('/progress');
  };

  return (
    <View style={styles.container}>
      <View style={styles.pageTitle}>
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
              <>
                {/* Onboarding Guide Section */}
                <View style={styles.onboardingSection}>
                  <View style={styles.onboardingHeader}>
                    <Text style={styles.onboardingTitle}>Welcome to ORIGEN™ AI Tutor!</Text>
                    <Text style={styles.onboardingSubtitle}>Your guide to personalized learning</Text>
                  </View>
                  
                  <View style={styles.onboardingSteps}>
                    <View style={styles.onboardingStep}>
                      <View style={styles.onboardingStepNumber}>
                        <Text style={styles.onboardingStepNumberText}>1</Text>
                      </View>
                      <View style={styles.onboardingStepContent}>
                        <Text style={styles.onboardingStepTitle}>Add Your Learners</Text>
                        <Text style={styles.onboardingStepDescription}>
                          Start by adding your children or students using the "Manage Learners" option below. You'll be able to track their progress and customize their learning experience.
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.onboardingStep}>
                      <View style={styles.onboardingStepNumber}>
                        <Text style={styles.onboardingStepNumberText}>2</Text>
                      </View>
                      <View style={styles.onboardingStepContent}>
                        <Text style={styles.onboardingStepTitle}>Experience Learner Mode</Text>
                        <Text style={styles.onboardingStepDescription}>
                          Toggle to "Learner Mode" to see the app as your child does. In this view, you can create personalized AI lessons, take quizzes, and view their knowledge graphs.
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.onboardingStep}>
                      <View style={styles.onboardingStepNumber}>
                        <Text style={styles.onboardingStepNumberText}>3</Text>
                      </View>
                      <View style={styles.onboardingStepContent}>
                        <Text style={styles.onboardingStepTitle}>Monitor Progress</Text>
                        <Text style={styles.onboardingStepDescription}>
                          View detailed reports on your learner's progress, achievements, and areas for improvement. Track their knowledge growth through interactive visualizations.
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.onboardingStep}>
                      <View style={styles.onboardingStepNumber}>
                        <Text style={styles.onboardingStepNumberText}>4</Text>
                      </View>
                      <View style={styles.onboardingStepContent}>
                        <Text style={styles.onboardingStepTitle}>Customize Learning Path</Text>
                        <Text style={styles.onboardingStepDescription}>
                          Guide your learner's journey by suggesting topics, reviewing their completed lessons, and helping them create new personalized AI-generated content.
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.onboardingTip}>
                    <Text style={styles.onboardingTipTitle}>Pro Tip:</Text>
                    <Text style={styles.onboardingTipText}>
                      Try creating a lesson yourself first to understand how the AI tutor works. This will help you guide your learners more effectively!
                    </Text>
                  </View>
                </View>
                
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Learner Management</Text>
                  <Link href="/learners">
                    <Text style={styles.linkText}>Manage Learners</Text>
                  </Link>
                  <Link href="/reports">
                    <Text style={styles.linkText}>View Reports</Text>
                  </Link>
                  <Link href="/database-sync">
                    <Text style={styles.linkText}>Database Synchronization</Text>
                  </Link>
                </View>
                
                <View style={styles.modeToggleSection}>
                  <View style={styles.modeToggleContent}>
                    <View style={styles.modeToggleHeader}>
                      <Text style={styles.sectionTitle}>Switch to ORIGEN™ Learner Mode</Text>
                      <View style={styles.modeToggleIcon}>
                        <ModeToggle />
                      </View>
                    </View>
                    
                    <Text style={styles.modeToggleDescription}>
                      Click the toggle button in the top-right corner to switch to ORIGEN™ Learner Mode and see the app from a learner's perspective.
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.modeToggleButton}
                      onPress={toggleMode}
                    >
                      <User size={16} color={colors.onPrimary} />
                      <Text style={styles.modeToggleButtonText}>Go to ORIGEN™ Learner Mode</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
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
  pageTitle: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  trademark: {
    ...typography.h4,
    color: colors.onPrimary,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  welcomeText: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
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
    // boxShadow not supported in React Native
    elevation: 2,
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
    // boxShadow not supported in React Native
    elevation: 3,
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
    // boxShadow not supported in React Native
    elevation: 1,
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
    // boxShadow not supported in React Native
    elevation: 2,
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
  modeToggleSection: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    // boxShadow not supported in React Native
    elevation: 2,
    overflow: 'hidden',
  },
  modeToggleContent: {
    padding: 16,
  },
  modeToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeToggleIcon: {
    marginRight: 8,
  },
  modeToggleDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  modeToggleButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  modeToggleButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    marginLeft: 8,
  },
  // Removed footer styles as they are now provided by the persistent app footer
  
  // Onboarding Guide Styles
  onboardingSection: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  onboardingHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  onboardingTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: 8,
    fontWeight: '700',
  },
  onboardingSubtitle: {
    ...typography.subtitle1,
    color: colors.textSecondary,
  },
  onboardingSteps: {
    marginBottom: 24,
  },
  onboardingStep: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  onboardingStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  onboardingStepNumberText: {
    ...typography.h6,
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  onboardingStepContent: {
    flex: 1,
  },
  onboardingStepTitle: {
    ...typography.h6,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  onboardingStepDescription: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  onboardingTip: {
    backgroundColor: colors.secondary + '15',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  onboardingTipTitle: {
    ...typography.subtitle1,
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  onboardingTipText: {
    ...typography.body2,
    color: colors.text,
    lineHeight: 20,
  },
});

export default DashboardPage;
