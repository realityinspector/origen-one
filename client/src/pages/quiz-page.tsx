import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import QuizComponent from '../components/QuizComponent';
import { ArrowLeft, CheckCircle, AlertCircle } from 'react-feather';

const QuizPage = ({ params }: { params: { lessonId: string } }) => {
  const { lessonId } = params;
  const [, setLocation] = useLocation();
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    newAchievements: any[];
  } | null>(null);

  // Fetch active lesson
  const {
    data: lesson,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['/api/lessons/active'],
    queryFn: () => apiRequest('GET', '/api/lessons/active').then(res => res.data),
    retry: 1,
  });

  // Submit answers mutation
  const submitAnswersMutation = useMutation({
    mutationFn: (answers: number[]) => {
      return apiRequest('POST', `/api/lessons/${lessonId}/answer`, { answers }).then(res => res.data);
    },
    onSuccess: (data) => {
      setQuizSubmitted(true);
      setQuizScore(data);
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      if (lesson?.learnerId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/learner-profile/${lesson.learnerId}`],
        });
      }
    },
  });

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    if (quizSubmitted) return; // Don't allow changes after submission
    
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    // Make sure all questions have answers
    if (lesson && selectedAnswers.length === lesson.spec.questions.length) {
      // Check that all questions have an answer (no undefined values)
      const hasAllAnswers = selectedAnswers.every(ans => ans !== undefined);
      if (hasAllAnswers) {
        submitAnswersMutation.mutate(selectedAnswers);
      } else {
        // Alert user to answer all questions
        alert('Please answer all questions before submitting.');
      }
    } else {
      // Alert user to answer all questions
      alert('Please answer all questions before submitting.');
    }
  };

  const handleContinue = () => {
    // Redirect to learner home to see the new auto-generated lesson
    setLocation('/learner');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading quiz. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setLocation('/learner')}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || submitAnswersMutation.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {submitAnswersMutation.isPending 
              ? 'Checking your answers...'
              : 'Loading quiz questions...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson || !lesson.spec || !lesson.spec.questions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Quiz not found. Please return to the lesson.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setLocation('/lesson')}
          >
            <Text style={styles.backButtonText}>Go Back to Lesson</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!quizSubmitted && (
          <TouchableOpacity style={styles.backButtonSmall} onPress={() => setLocation('/lesson')}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {quizSubmitted ? 'Quiz Results' : 'Knowledge Check'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {quizSubmitted && quizScore ? (
          // Quiz Results View
          <View>
            <View style={styles.scoreCard}>
              <View style={styles.scoreIconContainer}>
                {quizScore.score >= 70 ? (
                  <CheckCircle size={48} color={colors.success} />
                ) : (
                  <AlertCircle size={48} color={colors.warning} />
                )}
              </View>
              <Text style={styles.scoreTitle}>
                {quizScore.score >= 70 ? 'Great job!' : 'Keep practicing!'}
              </Text>
              <Text style={styles.scoreText}>
                You got {quizScore.correctCount} out of {quizScore.totalQuestions} questions correct
              </Text>
              <View style={styles.scoreBarContainer}>
                <View 
                  style={[styles.scoreBar, { width: `${quizScore.score}%` }]}
                />
              </View>
              <Text style={styles.scorePercentage}>{quizScore.score}%</Text>
            </View>

            {quizScore.newAchievements && quizScore.newAchievements.length > 0 && (
              <View style={styles.achievementsContainer}>
                <Text style={styles.achievementsTitle}>Achievements Unlocked!</Text>
                {quizScore.newAchievements.map((achievement, index) => (
                  <View key={index} style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <CheckCircle size={24} color={colors.success} />
                    </View>
                    <Text style={styles.achievementText}>{achievement.title}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>Question Review</Text>
              {lesson.spec.questions.map((question, index) => (
                <QuizComponent
                  key={index}
                  question={question}
                  selectedAnswer={selectedAnswers[index]}
                  showAnswers={true}
                  onSelectAnswer={() => {}}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Quiz Questions View
          <View>
            <Text style={styles.quizTitle}>{lesson.spec.title} Quiz</Text>
            <Text style={styles.quizDescription}>
              Test your knowledge of the lesson material by answering the following questions.
            </Text>

            {lesson.spec.questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={styles.questionNumber}>Question {index + 1} of {lesson.spec.questions.length}</Text>
                <QuizComponent
                  question={question}
                  selectedAnswer={selectedAnswers[index]}
                  showAnswers={false}
                  onSelectAnswer={(answerIndex) => handleSelectAnswer(index, answerIndex)}
                />
              </View>
            ))}

            <TouchableOpacity 
              style={[styles.submitButton, {
                opacity: selectedAnswers.length === lesson.spec.questions.length && 
                         selectedAnswers.every(ans => ans !== undefined) ? 1 : 0.5
              }]}
              onPress={handleSubmitQuiz}
              disabled={selectedAnswers.length !== lesson.spec.questions.length || 
                       !selectedAnswers.every(ans => ans !== undefined)}
            >
              <Text style={styles.submitButtonText}>Submit Answers</Text>
            </TouchableOpacity>
          </View>
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
  quizTitle: {
    ...typography.h2,
    marginBottom: 8,
  },
  quizDescription: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionNumber: {
    ...typography.subtitle2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  submitButton: {
    ...commonStyles.button,
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonText: {
    ...commonStyles.buttonText,
  },
  scoreCard: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreIconContainer: {
    marginBottom: 16,
  },
  scoreTitle: {
    ...typography.h2,
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreBarContainer: {
    width: '100%',
    height: 16,
    backgroundColor: colors.divider,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  scorePercentage: {
    ...typography.h3,
    color: colors.primary,
  },
  achievementsContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  achievementsTitle: {
    ...typography.h3,
    color: colors.onPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  achievementIcon: {
    marginRight: 12,
  },
  achievementText: {
    ...typography.subtitle1,
    color: colors.onPrimary,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  continueButton: {
    ...commonStyles.button,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: colors.success,
  },
  continueButtonText: {
    ...commonStyles.buttonText,
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

export default QuizPage;
