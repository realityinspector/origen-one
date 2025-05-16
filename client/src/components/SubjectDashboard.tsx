import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocation } from 'wouter';
import { ThemeColors } from '../theme';
import { apiRequest } from '../hooks/use-api';
import { Check } from 'react-feather';

interface SubjectDashboardProps {
  subjects?: string[];
  userGradeLevel?: number;
}

interface SubjectCardProps {
  subject: string;
  onSelect: (subject: string, category: string) => void;
}

const SubjectCard = ({ subject, onSelect }: SubjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Define categories for each subject
  const getCategories = (subject: string): string[] => {
    switch (subject.toLowerCase()) {
      case 'math':
        return ['Fractions', 'Geometry', 'Statistics', 'Algebra', 'Decimals'];
      case 'science':
        return ['Biology', 'Ecology', 'Chemistry', 'Physics', 'Astronomy'];
      case 'history':
        return ['Ancient Civilizations', 'American History', 'World War II', 'Renaissance', 'Industrial Revolution'];
      case 'literature':
      case 'reading':
        return ['Poetry', 'Fiction', 'Shakespeare', 'Mythology', 'Drama'];
      case 'geography':
        return ['Continents', 'Countries', 'Climate', 'Landforms', 'Oceans'];
      default:
        return ['Introduction', 'Advanced', 'Practical', 'Theory', 'History'];
    }
  };
  
  // Get icon color based on subject
  const getSubjectColor = (subject: string): string => {
    switch (subject.toLowerCase()) {
      case 'math': return ThemeColors.blue;
      case 'science': return ThemeColors.green;
      case 'history': return ThemeColors.amber;
      case 'literature':
      case 'reading': return ThemeColors.purple;
      case 'geography': return ThemeColors.cyan;
      default: return ThemeColors.indigo;
    }
  };
  
  // Get icon for the subject
  const getSubjectIcon = (subject: string): string => {
    switch (subject.toLowerCase()) {
      case 'math': return '🧮';
      case 'science': return '🔬';
      case 'history': return '📜';
      case 'literature':
      case 'reading': return '📚';
      case 'geography': return '🌎';
      default: return '📝';
    }
  };
  
  const categories = getCategories(subject);
  const subjectColor = getSubjectColor(subject);
  const icon = getSubjectIcon(subject);
  
  return (
    <View style={[styles.card, { borderColor: subjectColor }]}>
      <TouchableOpacity 
        style={[styles.cardHeader, { backgroundColor: subjectColor }]} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.subjectIcon}>{icon}</Text>
        <Text style={styles.subjectTitle}>{subject}</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryButton}
              onPress={() => onSelect(subject, category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export function SubjectDashboard({ subjects, userGradeLevel }: SubjectDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  // Default subjects if none provided
  const defaultSubjects = ['Math', 'Science', 'History', 'Reading', 'Geography'];
  const displaySubjects = subjects || defaultSubjects;
  
  const handleSelectCategory = async (subject: string, category: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a custom lesson with the selected subject and category
      const response = await apiRequest('POST', '/api/lessons/create', {
        subject,
        category,
        difficulty: 'beginner',
        gradeLevel: userGradeLevel || 5
      });
      
      if (response && response.data && response.data.id) {
        setLocation(`/lesson/${response.data.id}`);
      } else {
        setError('Could not create the lesson. Please try again.');
      }
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError('Failed to create lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a Subject</Text>
        <Text style={styles.subtitle}>Select a subject to start learning</Text>
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Creating your lesson...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.cardsContainer}>
        {displaySubjects.map((subject, index) => (
          <SubjectCard 
            key={index}
            subject={subject}
            onSelect={handleSelectCategory}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ThemeColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ThemeColors.textSecondary,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subjectIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesContainer: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    margin: 4,
  },
  categoryText: {
    color: ThemeColors.text,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    color: ThemeColors.green,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: ThemeColors.red,
    fontWeight: '500',
  },
});

export default SubjectDashboard;