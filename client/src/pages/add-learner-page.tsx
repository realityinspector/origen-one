import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/use-auth';
import OrigenHeader from '../components/OrigenHeader';
import { useToast } from '../hooks/use-toast';

const AddLearnerPage = () => {
  const [newLearner, setNewLearner] = useState({
    name: '',
    gradeLevel: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Validation
    if (!newLearner.name) {
      setError('Please enter a name for the learner');
      return;
    }
    
    const gradeLevel = parseInt(newLearner.gradeLevel);
    if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) {
      setError('Please enter a valid grade level (1-12)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Create learner account
      await apiRequest('POST', '/api/learners', {
        ...newLearner,
        gradeLevel,
        role: 'LEARNER',
        parentId: user?.id,
      });

      // Show success toast
      toast({
        title: 'Success',
        description: 'Learner account created successfully',
      });

      // Refresh learners list
      queryClient.invalidateQueries({ queryKey: ['/api/learners', user?.id, user?.role] });

      // Navigate back to learners page
      setLocation('/learners');
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create learner account. Please try again.');
      }
      console.error('Create learner error:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OrigenHeader subtitle="Add New Learner" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {user?.role === 'ADMIN' ? 'Add New Learner Account' : 'Add New Child Account'}
          </Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {user?.role === 'ADMIN' ? 'Learner Name' : 'Child\'s Name'}
            </Text>
            <TextInput
              style={styles.input}
              value={newLearner.name}
              onChangeText={(text) => setNewLearner({ ...newLearner, name: text })}
              placeholder={user?.role === 'ADMIN' ? "Enter learner's name" : "Enter child's name"}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Grade Level (1-12)</Text>
            <TextInput
              style={styles.input}
              value={newLearner.gradeLevel}
              onChangeText={(text) => setNewLearner({ ...newLearner, gradeLevel: text })}
              keyboardType="numeric"
              placeholder="Enter grade level"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setLocation('/learners')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {user?.role === 'ADMIN' ? 'Create Learner' : 'Add Child'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
});

export default AddLearnerPage;