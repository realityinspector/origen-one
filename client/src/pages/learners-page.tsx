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
  const [, setLocation] = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [subjectsModalVisible, setSubjectsModalVisible] = useState(false); 
  const [graphModalVisible, setGraphModalVisible] = useState(false);
  const [currentEditLearner, setCurrentEditLearner] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [newLearner, setNewLearner] = useState({ name: '', gradeLevel: '5' });
  const [subjects, setSubjects] = useState<string[]>([]);
  const [recommendedSubjects, setRecommendedSubjects] = useState<string[]>([]);
  const [strugglingAreas, setStrugglingAreas] = useState<string[]>([]);
  const [graph, setGraph] = useState<{nodes: any[], edges: any[]}>({nodes: [], edges: []});
  const [newNodeName, setNewNodeName] = useState('');
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
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
  
  // Update subjects mutation
  const updateSubjectsMutation = useMutation({
    mutationFn: ({ 
      userId, 
      subjects, 
      recommendedSubjects, 
      strugglingAreas 
    }: { 
      userId: number, 
      subjects: string[], 
      recommendedSubjects: string[], 
      strugglingAreas: string[] 
    }) =>
      apiRequest('PUT', `/api/learner-profile/${userId}`, {
        subjects,
        recommendedSubjects,
        strugglingAreas
      }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/learner-profiles', learners] });
      setSubjectsModalVisible(false);
      setCurrentProfile(null);
      setError('');
    },
    onError: (err: any) => {
      // Try to extract a meaningful error message
      let errorMessage = 'Failed to update subjects. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    },
  });
  
  // Update knowledge graph mutation
  const updateGraphMutation = useMutation({
    mutationFn: ({ userId, graph }: { userId: number, graph: any }) =>
      apiRequest('PUT', `/api/learner-profile/${userId}`, {
        graph
      }).then(res => res.data),
    onSuccess: (data) => {
      console.log('Graph updated successfully:', data);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/learner-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/learners'] });
      // Provide user feedback and close modal
      alert('Knowledge graph updated successfully!');
      setGraphModalVisible(false);
      setCurrentProfile(null);
      setError('');
    },
    onError: (err: any) => {
      console.error('Error updating graph:', err);
      // Try to extract a meaningful error message
      let errorMessage = 'Failed to update knowledge graph. Please try again.';
      
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
  
  const handleUpdateSubjects = () => {
    if (!currentProfile || !currentEditLearner) {
      setError('No learner selected for editing');
      return;
    }
    
    // Log the subjects before sending to server
    console.log("Subjects being sent to server:", subjects);
    
    // Make sure all subjects are correctly included
    updateSubjectsMutation.mutate({
      userId: currentEditLearner.id,
      subjects: subjects, // Explicitly use the current subjects state
      recommendedSubjects,
      strugglingAreas
    }, {
      onSuccess: (data) => {
        // Add successful update confirmation
        alert("Subjects updated successfully!");
        
        // Verify the update by comparing updated values with what's in the database
        const updatedSubjects = data.subjects;
        if (JSON.stringify(updatedSubjects) === JSON.stringify(subjects)) {
          console.log("Subjects successfully verified in database:", updatedSubjects);
        } else {
          console.warn("Subjects validation mismatch:", {
            clientSubjects: subjects,
            serverSubjects: updatedSubjects
          });
        }
        
        // Close modal and update state as before
        queryClient.invalidateQueries({ queryKey: ['/api/learner-profile'] });
        queryClient.invalidateQueries({ queryKey: ['/api/learners'] });
        setSubjectsModalVisible(false);
        setCurrentProfile(null);
        setError('');
      },
      onError: (error) => {
        console.error("Error updating subjects:", error);
        alert("Error saving subjects. Please try again.");
      }
    });
  };
  
  const handleAddNode = () => {
    if (!newNodeName.trim()) {
      setError('Please enter a node name');
      return;
    }
    
    // Generate a simple ID from the name
    const nodeId = newNodeName.toLowerCase().replace(/\s+/g, '_');
    
    // Check if a node with this ID already exists
    if (graph.nodes.some(node => node.id === nodeId)) {
      setError('A node with this name already exists');
      return;
    }
    
    // Add the new node
    setGraph({
      ...graph,
      nodes: [
        ...graph.nodes,
        { id: nodeId, label: newNodeName }
      ]
    });
    
    // Clear the input
    setNewNodeName('');
    setError('');
  };
  
  const handleAddEdge = () => {
    if (!newEdgeSource || !newEdgeTarget) {
      setError('Please select both source and target nodes');
      return;
    }
    
    // Check if this edge already exists
    if (graph.edges.some(edge => 
        edge.source === newEdgeSource && edge.target === newEdgeTarget)) {
      setError('This connection already exists');
      return;
    }
    
    // Add the new edge
    setGraph({
      ...graph,
      edges: [
        ...graph.edges,
        { source: newEdgeSource, target: newEdgeTarget }
      ]
    });
    
    // Clear the inputs
    setNewEdgeSource('');
    setNewEdgeTarget('');
    setError('');
  };
  
  const handleDeleteNode = (nodeId: string) => {
    // Check if node has any connections
    const hasConnections = graph.edges.some(
      edge => edge.source === nodeId || edge.target === nodeId
    );
    
    if (hasConnections) {
      setError('Cannot delete a subject that has connections. Remove the connections first.');
      return;
    }
    
    // Remove the node
    setGraph({
      ...graph,
      nodes: graph.nodes.filter(node => node.id !== nodeId)
    });
    
    setError('');
  };
  
  const handleDeleteEdge = (sourceId: string, targetId: string) => {
    // Remove the edge
    setGraph({
      ...graph,
      edges: graph.edges.filter(
        edge => !(edge.source === sourceId && edge.target === targetId)
      )
    });
    
    setError('');
  };
  
  const handleUpdateGraph = () => {
    if (!currentProfile || !currentEditLearner) {
      setError('No learner selected for editing');
      return;
    }
    
    // Use the current graph state
    updateGraphMutation.mutate({
      userId: currentEditLearner.id,
      graph
    });
  };
  
  const openSubjectsModal = (learner: any, profile: any) => {
    setCurrentEditLearner(learner);
    setCurrentProfile(profile);
    // Initialize state with current values
    setSubjects(profile.subjects || ['Math', 'Reading', 'Science']);
    setRecommendedSubjects(profile.recommendedSubjects || []);
    setStrugglingAreas(profile.strugglingAreas || []);
    setSubjectsModalVisible(true);
  };
  
  const openGraphModal = (learner: any, profile: any) => {
    setCurrentEditLearner(learner);
    setCurrentProfile(profile);
    // Initialize with existing graph or default
    if (profile && profile.graph) {
      setGraph(profile.graph);
    } else {
      setGraph({
        nodes: [
          { id: 'math', label: 'Mathematics' },
          { id: 'algebra', label: 'Algebra' },
          { id: 'geometry', label: 'Geometry' },
          { id: 'reading', label: 'Reading' }
        ],
        edges: [
          { source: 'math', target: 'algebra' },
          { source: 'math', target: 'geometry' },
        ]
      });
    }
    setGraphModalVisible(true);
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
            style={[styles.actionButton, styles.subjectsButton]}
            onPress={() => {
              // Navigate to the dedicated subjects management page with the learner ID
              const subjectsUrl = `/change-learner-subjects?id=${item.id}`;
              setLocation(subjectsUrl);
            }}
          >
            <Edit size={16} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>Subjects</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.graphButton]}
            onPress={() => {
              openGraphModal(item, profile || {});
            }}
          >
            <Edit size={16} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>Graph</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.progressButton]}
            onPress={() => setLocation(`/progress?learnerId=${item.id}`)}
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

      {/* Subjects Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={subjectsModalVisible}
        onRequestClose={() => setSubjectsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Manage Subjects
            </Text>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.editLearnerName}>
                {currentEditLearner?.name}
              </Text>
              
              <Text style={styles.inputLabel}>Active Subjects</Text>
              <View style={styles.subjectsContainer}>
                {subjects.map((subject, index) => (
                  <View key={index} style={styles.subjectItem}>
                    <Text style={styles.subjectText}>{subject}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => {
                        setSubjects(subjects.filter((_, i) => i !== index));
                      }}
                    >
                      <Text style={styles.removeButtonText}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addSubjectContainer}>
                  <TextInput
                    style={styles.subjectInput}
                    placeholder="Add new subject"
                    onSubmitEditing={(e) => {
                      const newSubject = e.nativeEvent.text.trim();
                      if (newSubject && !subjects.includes(newSubject)) {
                        // Update the local state with the new subject
                        const updatedSubjects = [...subjects, newSubject];
                        setSubjects(updatedSubjects);
                        
                        // Log subjects before and after update
                        console.log("Original subjects:", subjects);
                        console.log("Updated subjects:", updatedSubjects);
                        
                        // Show confirmation message
                        alert(`Added "${newSubject}" to subjects. Remember to save changes!`);
                        
                        // Clear the input field
                        e.nativeEvent.target.value = "";
                      } else if (subjects.includes(newSubject)) {
                        alert(`"${newSubject}" is already in your subjects list.`);
                      }
                    }}
                  />
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Recommended Subjects</Text>
              <View style={styles.subjectsContainer}>
                {recommendedSubjects.map((subject, index) => (
                  <View key={index} style={styles.recommendedItem}>
                    <Text style={styles.recommendedText}>{subject}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => {
                        setRecommendedSubjects(recommendedSubjects.filter((_, i) => i !== index));
                      }}
                    >
                      <Text style={styles.removeButtonText}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addSubjectContainer}>
                  <TextInput
                    style={styles.subjectInput}
                    placeholder="Add recommended subject"
                    onSubmitEditing={(e) => {
                      const newSubject = e.nativeEvent.text.trim();
                      if (newSubject && !recommendedSubjects.includes(newSubject)) {
                        setRecommendedSubjects([...recommendedSubjects, newSubject]);
                      }
                    }}
                  />
                </View>
              </View>
              
              <Text style={styles.inputLabel}>Needs More Practice</Text>
              <View style={styles.subjectsContainer}>
                {strugglingAreas.map((subject, index) => (
                  <View key={index} style={styles.strugglingItem}>
                    <Text style={styles.strugglingText}>{subject}</Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => {
                        setStrugglingAreas(strugglingAreas.filter((_, i) => i !== index));
                      }}
                    >
                      <Text style={styles.removeButtonText}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addSubjectContainer}>
                  <TextInput
                    style={styles.subjectInput}
                    placeholder="Add subject that needs practice"
                    onSubmitEditing={(e) => {
                      const newSubject = e.nativeEvent.text.trim();
                      if (newSubject && !strugglingAreas.includes(newSubject)) {
                        setStrugglingAreas([...strugglingAreas, newSubject]);
                      }
                    }}
                  />
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setSubjectsModalVisible(false);
                    setCurrentProfile(null);
                    setError('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateSubjects}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Knowledge Graph Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={graphModalVisible}
        onRequestClose={() => setGraphModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Knowledge Graph
            </Text>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.editLearnerName}>
                {currentEditLearner?.name}
              </Text>
              
              <View style={styles.graphContainer}>
                <Text style={styles.graphText}>
                  This feature allows you to visualize and edit the knowledge connections 
                  for {currentEditLearner?.name}.
                </Text>
                
                <View style={styles.graphPlaceholder}>
                  <Text style={styles.graphPlaceholderText}>
                    Knowledge Graph Visualization
                  </Text>
                  <Text style={styles.graphInstructions}>
                    In a complete implementation, this would include an interactive 
                    graph editor where you can create nodes for subjects and connect 
                    related topics.
                  </Text>
                  
                  {/* Graph Editor UI */}
                  <View style={{
                    marginTop: 16,
                    padding: 16,
                    backgroundColor: colors.surfaceColor,
                    borderWidth: 1,
                    borderColor: colors.divider,
                    borderRadius: 8,
                    alignSelf: 'stretch',
                  }}>
                    {/* Add Subject/Node Section */}
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.textPrimary,
                      marginBottom: 8,
                    }}>Add Knowledge Subject:</Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      marginBottom: 16,
                    }}>
                      <TextInput
                        value={newNodeName}
                        onChangeText={setNewNodeName}
                        placeholder="Enter subject (e.g. Fractions)"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: colors.divider,
                          borderRadius: 4,
                          padding: 8,
                          marginRight: 8,
                        }}
                      />
                      <TouchableOpacity
                        onPress={handleAddNode}
                        style={{
                          backgroundColor: colors.primary,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 4,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Add Connection/Edge Section */}
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.textPrimary,
                      marginTop: 8,
                      marginBottom: 8,
                    }}>Connect Subjects:</Text>
                    
                    <View style={{
                      marginBottom: 16,
                    }}>
                      {/* Source dropdown */}
                      <View style={{
                        borderWidth: 1,
                        borderColor: colors.divider,
                        borderRadius: 4,
                        padding: 8,
                        marginBottom: 8,
                      }}>
                        <Text style={{ marginBottom: 4, color: colors.textSecondary }}>From:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {graph.nodes.map((node, idx) => (
                            <TouchableOpacity
                              key={`source-${idx}`}
                              onPress={() => setNewEdgeSource(node.id)}
                              style={{
                                backgroundColor: newEdgeSource === node.id ? colors.primary : colors.surfaceColor,
                                borderWidth: 1,
                                borderColor: colors.divider,
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                margin: 4,
                              }}
                            >
                              <Text style={{ 
                                color: newEdgeSource === node.id ? 'white' : colors.textPrimary 
                              }}>
                                {node.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      
                      {/* Target dropdown */}
                      <View style={{
                        borderWidth: 1,
                        borderColor: colors.divider,
                        borderRadius: 4,
                        padding: 8,
                        marginBottom: 8,
                      }}>
                        <Text style={{ marginBottom: 4, color: colors.textSecondary }}>To:</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {graph.nodes.map((node, idx) => (
                            <TouchableOpacity
                              key={`target-${idx}`}
                              onPress={() => setNewEdgeTarget(node.id)}
                              style={{
                                backgroundColor: newEdgeTarget === node.id ? colors.primary : colors.surfaceColor,
                                borderWidth: 1,
                                borderColor: colors.divider,
                                borderRadius: 20,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                margin: 4,
                              }}
                            >
                              <Text style={{ 
                                color: newEdgeTarget === node.id ? 'white' : colors.textPrimary 
                              }}>
                                {node.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      
                      <TouchableOpacity
                        onPress={handleAddEdge}
                        style={{
                          backgroundColor: colors.secondary,
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 4,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Connect Subjects</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Current graph visualization */}
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.textPrimary,
                      marginTop: 12,
                      marginBottom: 8,
                    }}>Current Knowledge Graph:</Text>
                    
                    {/* Nodes */}
                    <Text style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: colors.textSecondary,
                      marginTop: 8,
                      marginBottom: 4,
                    }}>Subjects:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                      {graph.nodes.map((node, index) => (
                        <View key={`node-${index}`} style={{
                          backgroundColor: colors.surfaceColor,
                          borderWidth: 1,
                          borderColor: colors.primary,
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          margin: 4,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                          <Text style={{ color: colors.textPrimary }}>
                            {node.label}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteNode(node.id)}
                            style={{
                              marginLeft: 8,
                              backgroundColor: colors.error,
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                    
                    {/* Edges */}
                    <Text style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: colors.textSecondary,
                      marginTop: 8,
                      marginBottom: 4,
                    }}>Connections:</Text>
                    {graph.edges.map((edge, index) => {
                      // Find the source and target nodes
                      const sourceNode = graph.nodes.find(n => n.id === edge.source);
                      const targetNode = graph.nodes.find(n => n.id === edge.target);
                      
                      return (
                        <View key={`edge-${index}`} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginLeft: 8,
                          marginBottom: 4,
                        }}>
                          <Text style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                          }}>
                            {sourceNode?.label} → {targetNode?.label}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteEdge(edge.source, edge.target)}
                            style={{
                              marginLeft: 8,
                              backgroundColor: colors.error,
                              width: 18,
                              height: 18,
                              borderRadius: 9,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>×</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setGraphModalVisible(false);
                    setCurrentProfile(null);
                    setError('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateGraph}
                >
                  <Text style={styles.saveButtonText}>Save Graph</Text>
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
  subjectsButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  graphButton: {
    backgroundColor: colors.accent1,
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
  // Subject management styles
  subjectsContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 4,
    padding: 8,
    backgroundColor: colors.surfaceColor,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  subjectText: {
    color: colors.textPrimary,
    flex: 1,
  },
  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  recommendedText: {
    color: colors.textPrimary,
    flex: 1,
  },
  strugglingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent1,
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  strugglingText: {
    color: colors.onPrimary,
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addSubjectContainer: {
    marginTop: 8,
  },
  subjectInput: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 4,
    padding: 10,
    backgroundColor: colors.surfaceColor,
  },
  // Knowledge graph styles
  graphContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  graphText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  graphPlaceholder: {
    height: 200,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceColor,
  },
  graphPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  graphInstructions: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  graphDataContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surfaceColor,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  graphDataHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  graphNodeText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    marginBottom: 4,
  },
  graphEdgeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    marginBottom: 4,
  },
});

export default LearnersPage;