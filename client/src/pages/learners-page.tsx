import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import { useLocation } from 'wouter';
import { Plus, BarChart2, Download, Edit } from 'react-feather';

const LearnersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditLearner, setCurrentEditLearner] = useState<any>(null);
  const [newLearner, setNewLearner] = useState({ name: '', gradeLevel: '5' });
  const [error, setError] = useState('');

  // Fetch learners
  const {
    data: learners,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["/api/learners", user?.id, user?.role],
    queryFn: () => {
      if (user?.role === 'ADMIN') {
        // For admin users, we need to provide a parentId parameter
        return apiRequest('GET', `/api/learners?parentId=${user.id}`).then(res => res.data);
      } else if (user?.role === 'PARENT') {
        // For parents, the API uses their authenticated ID automatically
        return apiRequest('GET', "/api/learners").then(res => res.data);
      }
      // Return empty array for other roles
      return Promise.resolve([]);
    },
    enabled: (user?.role === 'PARENT' || user?.role === 'ADMIN') && !!user?.id,
  });
  
  // Fetch learner profiles to get grade level info
  const {
    data: learnerProfiles,
    isLoading: profilesLoading,
  } = useQuery({
    queryKey: ['/api/learner-profiles', learners],
    queryFn: async () => {
      if (!learners || learners.length === 0) return {};
      
      // Create an object mapping userId to profile
      const profiles = {};
      
      // Fetch profiles for each learner
      await Promise.all(
        learners.map(async (learner) => {
          try {
            const response = await apiRequest('GET', `/api/learner-profile/${learner.id}`);
            profiles[learner.id] = response.data;
          } catch (err) {
            console.error(`Failed to fetch profile for learner ${learner.id}`, err);
          }
        })
      );
      
      return profiles;
    },
    enabled: !!learners && learners.length > 0,
  });

  // Update grade level mutation
  const updateGradeLevelMutation = useMutation({
    mutationFn: ({ userId, gradeLevel }: { userId: number, gradeLevel: string }) =>
      apiRequest('PUT', `/api/learner-profile/${userId}`, {
        gradeLevel
      }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learner-profiles', learners] });
      setEditModalVisible(false);
      setCurrentEditLearner(null);
      setError('');
    },
    onError: (err: any) => {
      // Try to extract a meaningful error message
      let errorMessage = 'Failed to update grade level. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    },
  });
  
  const handleUpdateGradeLevel = () => {
    if (!currentEditLearner) {
      setError('No learner selected for editing');
      return;
    }
    
    // Convert 'K' to 0 for Kindergarten, or parse the grade level number
    let gradeLevelNum: number;
    if (newLearner.gradeLevel === 'K') {
      gradeLevelNum = 0; // Kindergarten
    } else {
      gradeLevelNum = parseInt(newLearner.gradeLevel);
      if (isNaN(gradeLevelNum) || gradeLevelNum < 0 || gradeLevelNum > 12) {
        setError('Grade level must be between K and 12');
        return;
      }
    }
    
    updateGradeLevelMutation.mutate({
      userId: currentEditLearner.id,
      gradeLevel: newLearner.gradeLevel
    });
  };

  const handleAddLearner = async () => {
    try {
      setError('');
      if (!newLearner.name) {
        setError('Name is required');
        return;
      }

      // Convert grade level for API
      let gradeLevelNum: number;
      if (newLearner.gradeLevel === 'K') {
        gradeLevelNum = 0; // Kindergarten
      } else {
        gradeLevelNum = parseInt(newLearner.gradeLevel);
      }

      // For admin users, we need to set a parent ID
      // For this implementation, let's set the admin as the parent for learners they create
      // A more complete implementation would allow admins to select the parent from a list
      await apiRequest('POST', '/api/learners', {
        name: newLearner.name,
        role: 'LEARNER',
        parentId: user?.id, // Use the current user's ID as the parent ID
        gradeLevel: gradeLevelNum, // Add grade level
      });

      // Reset form and close modal
      setNewLearner({ name: '', gradeLevel: '5' });
      setModalVisible(false);

      // Refresh learners list and profiles
      queryClient.invalidateQueries({ queryKey: ["/api/learners", user?.id, user?.role] });
      queryClient.invalidateQueries({ queryKey: ['/api/learner-profiles', learners] });
    } catch (err: any) {
      // Try to extract a meaningful error message
      let errorMessage = 'Failed to add learner. Please try again.';
      
      if (err.response?.data?.error) {
        // Use the server's error message if available
        errorMessage = err.response.data.error;
      } else if (err.message) {
        // Otherwise use the error message property
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Add learner error:', err);
    }
  };

  const renderLearnerItem = ({ item }: { item: any }) => {
    // Get the learner profile to display grade level
    const profile = learnerProfiles?.[item.id];
    const gradeLevel = profile?.gradeLevel !== undefined ? profile.gradeLevel : null;
    
    return (
      <TouchableOpacity style={styles.learnerCard}>
        <View style={styles.learnerInfo}>
          <Text style={styles.learnerName}>{item.name}</Text>
          <Text style={styles.learnerEmail}>{item.email}</Text>
          {gradeLevel !== null && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>
                {getGradeDisplayText(gradeLevel)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setCurrentEditLearner(item);
              // Set initial grade level for edit
              const gradeLevelValue = gradeLevel === 0 ? 'K' : String(gradeLevel || 5);
              setNewLearner({...newLearner, gradeLevel: gradeLevelValue});
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.actionButtonText}>Edit Grade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.progressButton]}
            onPress={() => navigate(`/progress?learnerId=${item.id}`)}
          >
            <BarChart2 size={16} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={() => {
              // Open export endpoint in new window for download
              window.open(`/api/export?learnerId=${item.id}`, '_blank');
            }}
          >
            <Download size={16} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Learners</Text>
        <Text style={styles.headerSubtitle}>Track and manage your children's learning progress</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{user?.role === 'PARENT' ? 'Your Children' : 'Learners'}</Text>
          {(user?.role === 'PARENT' || user?.role === 'ADMIN') && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={20} color={colors.onPrimary} />
              <Text style={styles.addButtonText}>{user?.role === 'ADMIN' ? 'Add Learner' : 'Add Child'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : fetchError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Error loading learner accounts. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => queryClient.invalidateQueries({ queryKey: ["/api/learners", user?.id, user?.role] })}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={learners}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLearnerItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {user?.role === 'PARENT'
                    ? "You haven't added any children yet. Create an account for your child to get started!"
                    : "No learners found. Add a learner to get started."}
                </Text>
                {(user?.role === 'PARENT' || user?.role === 'ADMIN') && (
                  <TouchableOpacity
                    style={styles.emptyAddButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.emptyAddButtonText}>
                      {user?.role === 'ADMIN' ? 'Add Learner Account' : 'Add Child Account'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>

      {/* Add Learner Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {user?.role === 'ADMIN' ? 'Add Learner Account' : 'Add Child Account'}
            </Text>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>
                {user?.role === 'ADMIN' ? 'Learner Name' : 'Child\'s Name'}
              </Text>
              <TextInput
                style={styles.input}
                value={newLearner.name}
                onChangeText={(text) => setNewLearner({ ...newLearner, name: text })}
                placeholder={user?.role === 'ADMIN' ? "Enter learner's name" : "Enter child's name"}
              />

              {/* Email and password fields removed as they're no longer required for learners */}
              
              <Text style={styles.inputLabel}>Grade Level</Text>
              <View style={styles.gradeLevelContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gradeLevelPicker}
                >
                  {[
                    { value: 'K', label: 'Kindergarten' },
                    { value: '1', label: 'Grade 1' },
                    { value: '2', label: 'Grade 2' },
                    { value: '3', label: 'Grade 3' },
                    { value: '4', label: 'Grade 4' },
                    { value: '5', label: 'Grade 5' },
                    { value: '6', label: 'Grade 6' },
                    { value: '7', label: 'Grade 7' },
                    { value: '8', label: 'Grade 8' },
                    { value: '9', label: 'Grade 9' },
                    { value: '10', label: 'Grade 10' },
                    { value: '11', label: 'Grade 11' },
                    { value: '12', label: 'Grade 12' },
                  ].map((grade) => (
                    <TouchableOpacity
                      key={grade.value}
                      style={[
                        styles.gradeLevelButton,
                        newLearner.gradeLevel === grade.value && styles.gradeLevelButtonActive,
                      ]}
                      onPress={() => setNewLearner({ ...newLearner, gradeLevel: grade.value })}
                    >
                      <Text style={[
                        styles.gradeLevelButtonText,
                        newLearner.gradeLevel === grade.value && styles.gradeLevelButtonTextActive,
                      ]}>
                        {grade.value === 'K' ? 'K' : grade.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setNewLearner({ name: '', gradeLevel: '5' });
                    setError('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddLearner}
                >
                  <Text style={styles.saveButtonText}>
                    {user?.role === 'ADMIN' ? 'Add Learner' : 'Add Child'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Grade Level Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Update Grade Level
            </Text>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.editLearnerName}>
                {currentEditLearner?.name}
              </Text>
              
              <Text style={styles.inputLabel}>Grade Level</Text>
              <View style={styles.gradeLevelContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gradeLevelPicker}
                >
                  {[
                    { value: 'K', label: 'Kindergarten' },
                    { value: '1', label: 'Grade 1' },
                    { value: '2', label: 'Grade 2' },
                    { value: '3', label: 'Grade 3' },
                    { value: '4', label: 'Grade 4' },
                    { value: '5', label: 'Grade 5' },
                    { value: '6', label: 'Grade 6' },
                    { value: '7', label: 'Grade 7' },
                    { value: '8', label: 'Grade 8' },
                    { value: '9', label: 'Grade 9' },
                    { value: '10', label: 'Grade 10' },
                    { value: '11', label: 'Grade 11' },
                    { value: '12', label: 'Grade 12' },
                  ].map((grade) => (
                    <TouchableOpacity
                      key={grade.value}
                      style={[
                        styles.gradeLevelButton,
                        newLearner.gradeLevel === grade.value && styles.gradeLevelButtonActive,
                      ]}
                      onPress={() => setNewLearner({ ...newLearner, gradeLevel: grade.value })}
                    >
                      <Text style={[
                        styles.gradeLevelButtonText,
                        newLearner.gradeLevel === grade.value && styles.gradeLevelButtonTextActive,
                      ]}>
                        {grade.value === 'K' ? 'K' : grade.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditModalVisible(false);
                    setCurrentEditLearner(null);
                    setError('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateGradeLevel}
                  disabled={updateGradeLevelMutation.isPending}
                >
                  <Text style={styles.saveButtonText}>
                    {updateGradeLevelMutation.isPending ? 'Updating...' : 'Update Grade'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper function to format grade level for display
const getGradeDisplayText = (gradeLevel: number) => {
  if (gradeLevel === 0) return 'Kindergarten';
  return `Grade ${gradeLevel}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.subtitle1,
    color: colors.onPrimary,
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    ...typography.h6,
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    marginLeft: 8,
  },
  list: {
    paddingBottom: 16,
  },
  learnerCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  learnerInfo: {
    flex: 1,
  },
  learnerName: {
    ...typography.h6,
    color: colors.text,
    marginBottom: 4,
  },
  learnerEmail: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  progressButton: {
    backgroundColor: colors.primary,
  },
  exportButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    ...typography.button,
    color: colors.onPrimary,
    marginLeft: 4,
  },
  loader: {
    marginTop: 32,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    ...typography.body2,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAddButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  emptyAddButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 0,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    ...typography.h5,
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    ...typography.subtitle2,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    ...typography.body1,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  gradeLevelContainer: {
    marginBottom: 16,
  },
  gradeLevelPicker: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  gradeLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.divider,
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
  gradeBadge: {
    marginTop: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  gradeBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  editLearnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default LearnersPage;