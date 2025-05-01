import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, commonStyles } from '../styles/theme';
import { CheckCircle, Circle } from 'react-feather';

interface QuizComponentProps {
  question: {
    text: string;
    options: string[];
    correctIndex?: number;
    explanation?: string;
  };
  selectedAnswer?: number;
  showAnswers?: boolean;
  onSelectAnswer: (index: number) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  question,
  selectedAnswer,
  showAnswers = false,
  onSelectAnswer,
}) => {
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = showAnswers && selectedAnswer === question.correctIndex;
  const isIncorrect = showAnswers && selectedAnswer !== question.correctIndex;
  
  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>
      
      <ScrollView style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = showAnswers && index === question.correctIndex;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                isSelected && styles.selectedOption,
                showAnswers && isCorrectAnswer && styles.correctOption,
                showAnswers && isSelected && !isCorrectAnswer && styles.incorrectOption,
              ]}
              onPress={() => onSelectAnswer(index)}
              disabled={isAnswered && showAnswers}
            >
              <View style={styles.optionContent}>
                {isSelected ? (
                  <CheckCircle 
                    size={20} 
                    color={
                      showAnswers
                        ? isCorrectAnswer
                          ? colors.success
                          : colors.error
                        : colors.primary
                    } 
                  />
                ) : (
                  <Circle 
                    size={20} 
                    color={
                      showAnswers && isCorrectAnswer
                        ? colors.success
                        : colors.textSecondary
                    } 
                  />
                )}
                <Text 
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedOptionText,
                    showAnswers && isCorrectAnswer && styles.correctOptionText,
                    showAnswers && isSelected && !isCorrectAnswer && styles.incorrectOptionText,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {showAnswers && isAnswered && question.explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>
            {isCorrect ? 'Correct!' : 'Not quite right'}
          </Text>
          <Text style={styles.explanationText}>
            {question.explanation}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    ...typography.h3,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  incorrectOption: {
    borderColor: colors.error,
    backgroundColor: 'rgba(176, 0, 32, 0.1)',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    ...typography.body1,
    marginLeft: 12,
    flex: 1,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  correctOptionText: {
    color: colors.success,
    fontWeight: '600',
  },
  incorrectOptionText: {
    color: colors.error,
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  explanationTitle: {
    ...typography.subtitle1,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  explanationText: {
    ...typography.body2,
    color: colors.onPrimary,
  },
});

export default QuizComponent;
