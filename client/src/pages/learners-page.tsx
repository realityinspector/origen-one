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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { colors, typography, commonStyles } from '../styles/theme';
import { useLocation } from 'wouter';
import { Plus, BarChart2, Download } from 'react-feather';

const LearnersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [newLearner, setNewLearner] = useState({ name: '', email: '', password: '' });
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

  const handleAddLearner = async () => {
    try {
      setError('');
      if (!newLearner.name || !newLearner.email || !newLearner.password) {
        setError('All fields are required');
        return;
      }

      await apiRequest('POST', '/api/learners', {
        name: newLearner.name,
        email: newLearner.email,
        password: newLearner.password,
        role: 'LEARNER',
      });

      // Reset form and close modal
      setNewLearner({ name: '', email: '', password: '' });
      setModalVisible(false);

      // Refresh learners list
      queryClient.invalidateQueries({ queryKey: ["/api/learners", user?.id, user?.role] });
    } catch (err) {
      setError('Failed to add learner. Please try again.');
      console.error('Add learner error:', err);
    }
  };

  const renderLearnerItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.learnerCard}>
      <View style={styles.learnerInfo}>
        <Text style={styles.learnerName}>{item.name}</Text>
        <Text style={styles.learnerEmail}>{item.email}</Text>
      </View>
      <View style={styles.actionButtons}>
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

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={newLearner.email}
                onChangeText={(text) => setNewLearner({ ...newLearner, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={newLearner.password}
                onChangeText={(text) => setNewLearner({ ...newLearner, password: text })}
                placeholder="Create password"
                secureTextEntry
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setNewLearner({ name: '', email: '', password: '' });
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
    </View>
  );
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
});

export default LearnersPage;