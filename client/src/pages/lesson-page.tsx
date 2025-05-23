import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import { ChevronRight, ArrowLeft } from 'react-feather';
import OrigenHeader from '../components/OrigenHeader';
import EnhancedLessonContent from '../components/EnhancedLessonContent';
import DirectHtmlRenderer from '../components/DirectHtmlRenderer';

const LessonPage = ({ route, navigation }: any) => {
  const { lessonId } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: lesson,
    error,
    isLoading: queryLoading,
  } = useQuery({
    queryKey: [`/api/lessons/${lessonId}`],
    queryFn: () => apiRequest('GET', `/api/lessons/active`).then(res => res.data),
    retry: 1,
  });

  useEffect(() => {
    // Simulate content loading delay
    if (!queryLoading && lesson) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [queryLoading, lesson]);

  const handleStartQuiz = () => {
    navigation.navigate('QuizPage', { lessonId });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <OrigenHeader subtitle="Lesson Error" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading lesson. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (queryLoading || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <OrigenHeader subtitle="Personalized Lesson" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your personalized lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <OrigenHeader subtitle="Lesson Not Found" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Lesson not found. Please return to the dashboard.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('LearnerDashboard')}
          >
            <Text style={styles.backButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OrigenHeader subtitle={lesson.spec.title} />
      <View style={styles.subheader}>
        <TouchableOpacity style={styles.backButtonSmall} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.subheaderTitle}>Personalized Lesson</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.lessonContent}>
          <Text style={styles.lessonTitle}>{lesson.spec.title}</Text>
          
          {/* Check if we have enhanced content */}
          {lesson.spec.enhancedSpec ? (
            <EnhancedLessonContent enhancedSpec={lesson.spec.enhancedSpec} />
          ) : (
            <DirectHtmlRenderer 
              content={lesson.spec.content}
              images={lesson.spec.images}
            />
          )}
        </View>

        <View style={styles.quizPrompt}>
          <Text style={styles.quizPromptTitle}>Ready to Test Your Knowledge?</Text>
          <Text style={styles.quizPromptText}>
            Now that you've learned about {lesson.spec.title.toLowerCase()}, 
            let's see what you remember with a quick quiz!
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.quizButton} onPress={handleStartQuiz}>
          <Text style={styles.quizButtonText}>Start Quiz</Text>
          <ChevronRight size={20} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const markdownStyles = {
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    ...typography.h1,
    marginTop: 24,
    marginBottom: 16,
  },
  heading2: {
    ...typography.h2,
    marginTop: 20,
    marginBottom: 12,
  },
  heading3: {
    ...typography.h3,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    ...typography.body1,
    marginBottom: 16,
  },
  list_item: {
    marginBottom: 8,
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 16,
    opacity: 0.8,
    marginVertical: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  subheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surfaceColor,
  },
  imagesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  subheaderTitle: {
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
  lessonContent: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonTitle: {
    ...typography.h2,
    marginBottom: 16,
  },
  quizPrompt: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  quizPromptTitle: {
    ...typography.subtitle1,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  quizPromptText: {
    ...typography.body2,
    color: colors.onPrimary,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surfaceColor,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  quizButton: {
    ...commonStyles.button,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quizButtonText: {
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
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    ...commonStyles.button,
  },
  backButtonText: {
    ...commonStyles.buttonText,
  },
});

export default LessonPage;
