import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import { ArrowLeft, CheckCircle, XCircle, Award } from 'react-feather';
import QuizComponent from '../components/QuizComponent';

const QuizPage = ({ route, navigation }: any) => {
  const { lessonId } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  // Fetch the active lesson for quiz
  const {
    data: lesson,
    error: lessonError,
    isLoading: lessonLoading,
  } = useQuery({
    queryKey: ['/api/lessons/active'],
    queryFn: () => apiRequest('GET', '/api/lessons/active').then(res => res.data),
  });

  // Mutation for submitting quiz answers
  const submitQuizMutation = useMutation({
    mutationFn: (answers: number[]) =>
      apiRequest('POST', `/api/lessons/${lessonId}/answer`, { answers })
        .then(res => res.data),
    onSuccess: (data) => {
      setQuizResults(data);
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
    },
    onError: (error: Error) => {
      Alert.alert(
        'Error',
        'Failed to submit quiz answers. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    },
  });

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (lesson?.spec.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if all questions have been answered
    if (selectedAnswers.length < (lesson?.spec.questions.length || 0)) {
      Alert.alert(
        'Incomplete Quiz',
        'Please answer all questions before submitting.',
        [
          { text: 'OK' }
        ]
      );
      return;
    }

    submitQuizMutation.mutate(selectedAnswers);
    setQuizCompleted(true);
  };

  const handleReturnToDashboard = () => {
    navigation.navigate('LearnerDashboard');
  };

  if (lessonLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quiz questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (lessonError || !lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading quiz. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const questions = lesson.spec.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (quizCompleted && quizResults) {
    // Show quiz results
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Quiz Results</Text>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>Your Score</Text>
              <Text style={styles.scoreValue}>{quizResults.score}%</Text>
              <Text style={styles.scoreDetail}>
                {quizResults.correctCount} out of {quizResults.totalQuestions} correct
              </Text>
            </View>

            {quizResults.newAchievements && quizResults.newAchievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                <Text style={styles.achievementsTitle}>
                  <Award size={20} color={colors.primary} style={{marginRight: 8}} />
                  New Achievements Earned
                </Text>
                
                {quizResults.newAchievements.map((achievement: any, index: number) => (
                  <View key={index} style={styles.achievementCard}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleReturnToDashboard}
            >
              <Text style={styles.buttonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentQuestion && (
          <QuizComponent
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onSelectAnswer={(answerIndex) => 
              handleSelectAnswer(currentQuestionIndex, answerIndex)
            }
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressIndicator}>
          {questions.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                index === currentQuestionIndex && styles.progressDotActive,
                selectedAnswers[index] !== undefined && styles.progressDotAnswered
              ]}
            />
          ))}
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text 
              style={[
                styles.navButtonText,
                currentQuestionIndex === 0 && styles.navButtonTextDisabled
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.navButtonPrimary,
                !selectedAnswers[currentQuestionIndex] && styles.navButtonDisabled
              ]}
              onPress={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
            >
              <Text 
                style={[
                  styles.navButtonTextPrimary,
                  !selectedAnswers[currentQuestionIndex] && styles.navButtonTextDisabled
                ]}
              >
                Next
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.navButtonSubmit,
                selectedAnswers.length < questions.length && styles.navButtonDisabled
              ]}
              onPress={handleSubmitQuiz}
              disabled={selectedAnswers.length < questions.length || submitQuizMutation.isPending}
            >
              <Text style={styles.navButtonTextSubmit}>
                {submitQuizMutation.isPending ? 'Submitting...' : 'Submit Quiz'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surfaceColor,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotAnswered: {
    backgroundColor: colors.secondaryDark,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.surfaceColor,
    borderWidth: 1,
    borderColor: colors.divider,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  navButtonSubmit: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  navButtonTextPrimary: {
    ...typography.button,
    color: colors.onPrimary,
  },
  navButtonTextSubmit: {
    ...typography.button,
    color: colors.onPrimary,
  },
  navButtonTextDisabled: {
    color: colors.textSecondary,
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
  button: {
    ...commonStyles.button,
  },
  buttonText: {
    ...commonStyles.buttonText,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreText: {
    ...typography.subtitle2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 48,
    marginBottom: 8,
  },
  scoreDetail: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  achievementsContainer: {
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
  achievementsTitle: {
    ...typography.subtitle1,
    color: colors.primary,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementTitle: {
    ...typography.subtitle1,
    color: colors.onPrimary,
    marginBottom: 4,
  },
  achievementDesc: {
    ...typography.body2,
    color: colors.onPrimary,
  },
});

export default QuizPage;
