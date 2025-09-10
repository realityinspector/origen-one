import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, Plus, User } from 'react-feather';
import { useLocation } from 'wouter';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../hooks/use-auth';

interface LearnerSelectorProps {
  onToggle?: () => void;
}

export function LearnerSelector({ onToggle }: LearnerSelectorProps) {
  const { selectedLearner, availableLearners, isLoadingLearners } = useMode();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const canCreateLearners = user?.role === 'PARENT' || user?.role === 'ADMIN';

  const handleSelectorPress = () => {
    // Navigate to the learner selection page
    setLocation('/select-learner');
  };

  // If loading, show a spinner
  if (isLoadingLearners) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.loadingText}>Loading learners...</Text>
      </View>
    );
  }

  // If no learners available, show create button for parents/admins
  if (!availableLearners || availableLearners.length === 0) {
    if (canCreateLearners) {
      return (
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => {
              setLocation('/add-learner');
            }}
          >
            <Plus size={16} color="#ffffff" />
            <Text style={styles.createButtonText}>Add Learner</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <Text style={styles.noLearnersText}>No learners available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Selected Learner Display - Click to navigate to selection page */}
      <TouchableOpacity style={styles.selector} onPress={handleSelectorPress}>
        <View style={styles.avatarContainer}>
          <User size={18} color="#6366F1" />
        </View>
        <Text style={styles.learnerName} numberOfLines={1}>
          {selectedLearner?.name || 'Select Learner'}
        </Text>
        <ChevronDown size={16} color="#6366F1" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: 12,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 200,
    cursor: 'pointer',
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  learnerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  noLearnersText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});