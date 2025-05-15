import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import { useAuth } from '../hooks/use-auth';
import { ArrowLeft, BookOpen, CheckCircle } from 'react-feather';

const CreateLessonPage = ({ navigation }: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [useEnhanced, setUseEnhanced] = useState(true);

  // Grade level options for elementary education
  const gradeLevels = [
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
  ];

  // Mutation for creating a new custom lesson
  const createLessonMutation = useMutation({
    mutationFn: (params: { topic: string; gradeLevel: number; learnerId: number }) =>
      apiRequest('POST', '/api/lessons/create', params)
        .then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons/active'] });
      setIsGenerating(false);
      Alert.alert(
        'Lesson Created',
        'Your new lesson has been created successfully!',
        [{ text: 'View Lesson', onPress: () => navigation.navigate('LessonPage', { lessonId: data.id }) }]
      );
    },
    onError: (error: Error) => {
      setIsGenerating(false);
      Alert.alert(
        'Error',
        'Failed to create a new lesson. Please try again.',
        [{ text: 'OK' }]
      );
    },
  });

  const handleCreateLesson = async () => {
    if (!topic.trim()) {
      Alert.alert('Topic Required', 'Please enter a topic for the lesson.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a lesson.');
      return;
    }

    // If the user is a parent or admin, show an alert to select a learner
    if (user.role === 'PARENT' || user.role === 'ADMIN') {
      Alert.alert(
        'Select Learner',
        'Please navigate to a learner\'s profile to create a lesson for them.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsGenerating(true);

    // Simulate the steps of generation with delayed updates
    setGenerationStep('Generating lesson content...');
    setTimeout(() => {
      setGenerationStep('Creating quiz questions...');
      setTimeout(() => {
        setGenerationStep('Building knowledge graph...');
        setTimeout(() => {
          // Actually create the lesson
          createLessonMutation.mutate({
            topic: topic.trim(),
            gradeLevel: parseInt(gradeLevel),
            learnerId: user.id,
          });
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Custom Lesson</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <BookOpen size={40} color={colors.primary} style={styles.icon} />
          <Text style={styles.title}>Create a New Lesson</Text>
          <Text style={styles.subtitle}>
            Our AI will generate a personalized educational lesson on any topic you choose!
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Topic</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a topic (e.g., Solar System, Fractions, Ancient Egypt)"
              value={topic}
              onChangeText={setTopic}
              editable={!isGenerating}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade Level</Text>
            <View style={styles.gradeLevelContainer}>
              {gradeLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.gradeLevelButton,
                    gradeLevel === level.value && styles.gradeLevelButtonActive,
                  ]}
                  onPress={() => setGradeLevel(level.value)}
                  disabled={isGenerating}
                >
                  <Text
                    style={[
                      styles.gradeLevelButtonText,
                      gradeLevel === level.value && styles.gradeLevelButtonTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isGenerating ? (
            <View style={styles.generatingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.generatingText}>{generationStep}</Text>
              <Text style={styles.generatingSubtext}>
                This may take a moment as our AI creates high-quality educational content
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateLesson}
            >
              <Text style={styles.createButtonText}>Generate Lesson</Text>
            </TouchableOpacity>
          )}
        </View>
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
  backButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body1,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.inputBackground,
  },
  gradeLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gradeLevelButton: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    padding: 8,
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  gradeLevelButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gradeLevelButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  gradeLevelButtonTextActive: {
    color: colors.onPrimary,
  },
  createButton: {
    ...commonStyles.button,
    marginTop: 16,
    width: '100%',
  },
  createButtonText: {
    ...commonStyles.buttonText,
  },
  generatingContainer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  generatingText: {
    ...typography.subtitle1,
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  generatingSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CreateLessonPage;
