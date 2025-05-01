import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { colors, typography } from '../styles/theme';
import { User, BookOpen, X } from 'react-feather';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../hooks/use-auth';

interface ModeToggleProps {
  style?: any;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ style }) => {
  const { isLearnerMode, toggleMode } = useMode();
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Debug message in console
  console.log('ModeToggle rendering', { isLearnerMode });

  const handleToggleMode = () => {
    console.log('Manual toggle pressed');
    
    // If in learner mode and trying to switch to grown-up mode, show password prompt
    if (isLearnerMode) {
      setShowPasswordModal(true);
    } else {
      // If in grown-up mode, switch to learner mode without password
      toggleMode();
    }
  };

  const handleSubmitPassword = () => {
    // Simple check - in a real app, you'd want to validate with the server
    if (user && password === user.password) {
      setShowPasswordModal(false);
      setPassword('');
      setError('');
      toggleMode();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        onPress={handleToggleMode}
        style={styles.iconButton}
      >
        {isLearnerMode ? (
          <User size={20} color={colors.primary} />
        ) : (
          <BookOpen size={20} color={colors.primary} />
        )}
      </TouchableOpacity>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Grown-up Password</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError('');
                }}
              >
                <X size={20} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalText}>Please enter your password to switch to Grown-up mode:</Text>
            
            <TextInput
              style={styles.passwordInput}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmitPassword}
            >
              <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  modalText: {
    ...typography.body1,
    marginBottom: 16,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ModeToggle;