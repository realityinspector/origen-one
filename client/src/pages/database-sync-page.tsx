import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../hooks/use-auth';
import { Check, X, RefreshCw, Database, PlusCircle, Edit, Trash2 } from 'react-feather';

// Define types for our sync configurations
interface SyncConfig {
  id: string;
  parentId: number;
  targetDbUrl: string;
  lastSyncAt: string | null;
  syncStatus: 'IDLE' | 'IN_PROGRESS' | 'FAILED' | 'COMPLETED';
  continuousSync: boolean;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

const DatabaseSyncPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state for creating/editing configurations
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [targetDbUrl, setTargetDbUrl] = useState('');
  const [continuousSync, setContinuousSync] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch all sync configurations for the current parent
  const { data: syncConfigs, isLoading, error } = useQuery<SyncConfig[]>({
    queryKey: ['syncConfigs'],
    queryFn: async () => {
      const response = await axios.get('/api/sync-configs');
      return response.data;
    },
    enabled: !!user && user.role === 'PARENT',
  });

  // Mutation for creating a new sync configuration
  const createMutation = useMutation({
    mutationFn: async (data: { targetDbUrl: string, continuousSync: boolean }) => {
      const response = await axios.post('/api/sync-configs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncConfigs'] });
      resetForm();
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || error.message || 'Failed to create sync configuration');
    }
  });

  // Mutation for updating an existing sync configuration
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: { targetDbUrl?: string, continuousSync?: boolean } }) => {
      const response = await axios.put(`/api/sync-configs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncConfigs'] });
      resetForm();
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || error.message || 'Failed to update sync configuration');
    }
  });

  // Mutation for deleting a sync configuration
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/sync-configs/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncConfigs'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to delete sync configuration');
    }
  });

  // Mutation for initiating a synchronization
  const syncMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.post(`/api/sync-configs/${id}/push`);
      return response.data;
    },
    onSuccess: () => {
      // After 2 seconds, refresh the sync configs to get updated status
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['syncConfigs'] });
      }, 2000);
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to initiate synchronization');
    }
  });

  // Reset form state
  const resetForm = () => {
    setIsEditMode(false);
    setEditingConfigId(null);
    setTargetDbUrl('');
    setContinuousSync(false);
    setFormError(null);
  };

  // Edit an existing configuration
  const handleEdit = (config: SyncConfig) => {
    setIsEditMode(true);
    setEditingConfigId(config.id);
    setTargetDbUrl(config.targetDbUrl);
    setContinuousSync(config.continuousSync);
  };

  // Delete a configuration after confirmation
  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this sync configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  // Start synchronization
  const handleSync = (id: string) => {
    syncMutation.mutate(id);
  };

  // Submit form for create/update
  const handleSubmit = () => {
    if (!targetDbUrl) {
      setFormError('Database URL is required');
      return;
    }

    // Simple validation for the URL format
    const urlPattern = /^postgresql:\/\/\w+:.*@[\w.-]+:\d+\/\w+(\?.*)?$/;
    if (!urlPattern.test(targetDbUrl)) {
      setFormError('Invalid PostgreSQL URL format. Example: postgresql://username:password@hostname:port/database');
      return;
    }

    if (isEditMode && editingConfigId) {
      updateMutation.mutate({
        id: editingConfigId,
        data: { targetDbUrl, continuousSync }
      });
    } else {
      createMutation.mutate({ targetDbUrl, continuousSync });
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: SyncConfig['syncStatus']) => {
    let color = '#ccc';
    let Icon = RefreshCw;

    switch (status) {
      case 'COMPLETED':
        color = '#4CAF50';
        Icon = Check;
        break;
      case 'FAILED':
        color = '#F44336';
        Icon = X;
        break;
      case 'IN_PROGRESS':
        color = '#2196F3';
        Icon = RefreshCw;
        break;
      case 'IDLE':
      default:
        color = '#9E9E9E';
        Icon = Database;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Icon size={14} color="#fff" />
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.role !== 'PARENT') {
    return (
      <AppLayout>
        <View style={styles.container}>
          <Text style={styles.title}>Access Denied</Text>
          <Text>This page is only available to parent users.</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Database Synchronization</Text>
        <Text style={styles.description}>
          Create and manage database synchronization configurations to replicate your data to an external PostgreSQL database.
          This feature allows you to maintain a backup of your account and all associated learner data.
        </Text>

        {/* Form for creating/editing sync configurations */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isEditMode ? 'Update Sync Configuration' : 'Create New Sync Configuration'}
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>PostgreSQL Database URL</Text>
            <TextInput
              style={styles.input}
              value={targetDbUrl}
              onChangeText={setTargetDbUrl}
              placeholder="postgresql://username:password@hostname:port/database"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setContinuousSync(!continuousSync)}
            >
              <View style={[styles.checkbox, continuousSync && styles.checkboxChecked]}>
                {continuousSync && <Check size={14} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>Enable Continuous Synchronization</Text>
            </TouchableOpacity>
          </View>
          
          {formError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}
          
          <View style={styles.formActions}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]} 
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]} 
              onPress={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Text style={styles.buttonText}>
                {isEditMode ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List of existing sync configurations */}
        <View style={styles.configsContainer}>
          <Text style={styles.sectionTitle}>Your Sync Configurations</Text>
          
          {isLoading ? (
            <Text>Loading configurations...</Text>
          ) : error ? (
            <Text style={styles.errorText}>Error loading configurations</Text>
          ) : syncConfigs && syncConfigs.length > 0 ? (
            syncConfigs.map(config => (
              <View key={config.id} style={styles.configCard}>
                <View style={styles.configHeader}>
                  {renderStatusBadge(config.syncStatus)}
                  <View style={styles.configActions}>
                    <TouchableOpacity 
                      onPress={() => handleSync(config.id)}
                      disabled={config.syncStatus === 'IN_PROGRESS' || syncMutation.isPending}
                      style={styles.actionButton}
                    >
                      <RefreshCw size={18} color="#2196F3" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => handleEdit(config)} 
                      style={styles.actionButton}
                    >
                      <Edit size={18} color="#FF9800" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => handleDelete(config.id)}
                      style={styles.actionButton}
                    >
                      <Trash2 size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.configDetails}>
                  <Text style={styles.configUrl} numberOfLines={1} ellipsizeMode="middle">
                    {config.targetDbUrl}
                  </Text>
                  
                  <View style={styles.configInfoRow}>
                    <Text style={styles.configInfoLabel}>Last Sync:</Text>
                    <Text style={styles.configInfoValue}>{formatDate(config.lastSyncAt)}</Text>
                  </View>
                  
                  <View style={styles.configInfoRow}>
                    <Text style={styles.configInfoLabel}>Continuous Sync:</Text>
                    <Text style={styles.configInfoValue}>{config.continuousSync ? 'Enabled' : 'Disabled'}</Text>
                  </View>
                  
                  {config.syncStatus === 'FAILED' && config.errorMessage && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{config.errorMessage}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Database size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No sync configurations found. Create one to get started.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
  },
  formContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonSecondary: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  configsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  configCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  configActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  configDetails: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
  configUrl: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  configInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  configInfoLabel: {
    fontWeight: '500',
    width: 120,
  },
  configInfoValue: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DatabaseSyncPage;