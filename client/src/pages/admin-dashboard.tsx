import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { colors, typography, commonStyles } from '../styles/theme';
import { User, Plus, X, Search } from 'react-feather';

const AdminDashboard = ({ navigation }: any) => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  // Fetch parent accounts
  const {
    data: parents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/parents'],
    queryFn: () => apiRequest('GET', '/api/parents').then(res => res.data),
  });
  
  // Create parent account mutation
  const createParentMutation = useMutation({
    mutationFn: (parentData: any) => 
      apiRequest('POST', '/api/register', {
        ...parentData,
        role: 'PARENT',
      }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parents'] });
      setModalVisible(false);
      clearForm();
      toast({
        title: 'Success',
        description: 'Parent account created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const clearForm = () => {
    setUsername('');
    setEmail('');
    setName('');
    setPassword('');
  };
  
  const handleCreateParent = () => {
    if (!username || !email || !name || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
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
    
    createParentMutation.mutate({
      username,
      email,
      name,
      password,
    });
  };
  
  // Filter parents based on search query
  const filteredParents = parents
    ? parents.filter(
        (parent: any) =>
          parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const renderParentItem = ({ item }: { item: any }) => (
    <View style={styles.parentCard}>
      <View style={styles.avatarContainer}>
        <User size={24} color={colors.primary} />
      </View>
      <View style={styles.parentInfo}>
        <Text style={styles.parentName}>{item.name}</Text>
        <Text style={styles.parentEmail}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('ProgressPage', { parentId: item.id })}
      >
        <Text style={styles.viewButtonText}>View Learners</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (error) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={styles.errorText}>
          Error loading parent accounts. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => queryClient.invalidateQueries({ queryKey: ['/api/parents'] })}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => logoutMutation.mutate()}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{parents?.length || 0}</Text>
          <Text style={styles.statLabel}>Total Parents</Text>
        </View>
        {/* We could add more stats here in the future */}
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search parents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Parent Accounts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color={colors.onPrimary} />
          <Text style={styles.addButtonText}>Add Parent</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredParents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderParentItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No parents match your search.'
                  : 'No parent accounts yet. Create one to get started!'}
              </Text>
            </View>
          }
        />
      )}
      
      {/* Modal for creating parent account */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Parent Account</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
              >
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter full name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  clearForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateParent}
                disabled={createParentMutation.isPending}
              >
                <Text style={styles.createButtonText}>
                  {createParentMutation.isPending ? 'Creating...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  greeting: {
    ...typography.h2,
    marginBottom: 0,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  logoutButtonText: {
    color: colors.onError,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    ...typography.h1,
    color: colors.onPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.body2,
    color: colors.onPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: {
    ...typography.h3,
    marginBottom: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: colors.onPrimary,
    marginLeft: 4,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  parentCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 0,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  parentInfo: {
    flex: 1,
  },
  parentName: {
    ...typography.subtitle1,
  },
  parentEmail: {
    ...typography.body2,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewButtonText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    ...typography.body1,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    ...typography.body1,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  retryButton: {
    ...commonStyles.button,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    ...commonStyles.buttonText,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: 0,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  inputGroup: {
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
  cancelButton: {
    ...commonStyles.outlineButton,
    marginRight: 12,
  },
  cancelButtonText: {
    ...commonStyles.outlineButtonText,
  },
  createButton: {
    ...commonStyles.button,
  },
  createButtonText: {
    ...commonStyles.buttonText,
  },
});

export default AdminDashboard;
