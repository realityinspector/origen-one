import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { colors, typography, commonStyles } from '../styles/theme';

interface UserCreationFormProps {
  userType: 'parent' | 'learner';
  parentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserCreationForm: React.FC<UserCreationFormProps> = ({
  userType,
  parentId,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState('3');

  const isParentForm = userType === 'parent';
  
  const createUserMutation = useMutation({
    mutationFn: (userData: any) =>
      apiRequest('POST', '/api/register', userData).then(res => res.data),
    onSuccess: () => {
      if (isParentForm) {
        queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/learners'] });
      }
      toast({
        title: 'Success',
        description: `${isParentForm ? 'Parent' : 'Learner'} account created successfully`,
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleSubmit = () => {
    // Validate inputs
    if (!username || !email || !name || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate grade level for learners
    if (!isParentForm) {
      const gradeLevelNum = parseInt(gradeLevel);
      if (isNaN(gradeLevelNum) || gradeLevelNum < 1 || gradeLevelNum > 5) {
        toast({
          title: 'Error',
          description: 'Grade level must be between 1 and 5',
          variant: 'destructive',
        });
        return;
      }
    }
    
    // Create user data object
    const userData = {
      username,
      email,
      name,
      password,
      role: isParentForm ? 'PARENT' : 'LEARNER',
      ...(isParentForm ? {} : { 
        parentId: parentId,
        gradeLevel: parseInt(gradeLevel)
      }),
    };
    
    createUserMutation.mutate(userData);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${isParentForm ? 'parent' : 'child'} username`}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${isParentForm ? 'parent' : 'child'} email`}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${isParentForm ? 'parent' : 'child'} full name`}
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        {!isParentForm && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Grade Level (1-5)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter grade level (1-5)"
              value={gradeLevel}
              onChangeText={setGradeLevel}
              keyboardType="number-pad"
              maxLength={1}
            />
          </View>
        )}
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={createUserMutation.isPending}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>
              Create {isParentForm ? 'Parent' : 'Child'} Account
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
    marginBottom: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  cancelButton: {
    ...commonStyles.outlineButton,
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    ...commonStyles.outlineButtonText,
  },
  submitButton: {
    ...commonStyles.button,
    flex: 2,
  },
  submitButtonText: {
    ...commonStyles.buttonText,
  },
});

export default UserCreationForm;
