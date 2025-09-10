import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import { ChevronDown, Plus, User } from 'react-feather';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../hooks/use-auth';
import { apiRequest } from '../lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface LearnerSelectorProps {
  onToggle?: () => void;
}

export function LearnerSelector({ onToggle }: LearnerSelectorProps) {
  const { selectedLearner, selectLearner, availableLearners, isLoadingLearners } = useMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  const canCreateLearners = user?.role === 'PARENT' || user?.role === 'ADMIN';

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
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
              // Navigate to the Add Learner page
              window.location.href = '/add-learner';
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
      {/* Selected Learner Display */}
      <TouchableOpacity style={styles.selector} onPress={toggleDropdown}>
        <View style={styles.avatarContainer}>
          <User size={18} color="#6366F1" />
        </View>
        <Text style={styles.learnerName} numberOfLines={1}>
          {selectedLearner?.name || 'Select Learner'}
        </Text>
        <ChevronDown size={16} color="#6366F1" />
      </TouchableOpacity>

      {/* Modal Dropdown for Learner Selection - Better web compatibility */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.modalDropdown}>
            <ScrollView style={styles.dropdownScroll}>
              {availableLearners.map((item) => (
                <TouchableOpacity
                  key={item.id.toString()}
                  style={[
                    styles.dropdownItem,
                    selectedLearner?.id === item.id && styles.selectedDropdownItem,
                  ]}
                  onPress={() => {
                    console.log('Learner item clicked:', item.name);
                    selectLearner(item);
                    setDropdownVisible(false);
                  }}
                >
                  <View style={styles.avatarContainer}>
                    <User size={16} color="#6366F1" />
                  </View>
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      selectedLearner?.id === item.id && styles.selectedDropdownItemText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {canCreateLearners && (
                <TouchableOpacity
                  style={styles.addLearnerButton}
                  onPress={() => {
                    setDropdownVisible(false);
                    // Navigate to the Add Learner page
                    window.location.href = '/add-learner';
                  }}
                >
                  <Plus size={16} color="#6366F1" />
                  <Text style={styles.addLearnerButtonText}>Add Learner</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>


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
  modalDropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 220,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 50,
    alignSelf: 'center',
  },
  dropdownScroll: {
    maxHeight: 280,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    cursor: 'pointer',
    minHeight: 44, // Ensure minimum touch target size
  },
  selectedDropdownItem: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#4B5563',
  },
  selectedDropdownItemText: {
    fontWeight: '600',
    color: '#4F46E5',
  },
  addLearnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addLearnerButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
    fontSize: 16,
  },
  createModalButton: {
    backgroundColor: '#6366F1',
  },
  createModalButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 6,
  },
});