import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

interface WelcomeModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isVisible, onClose }) => {
  const openTwitter = () => {
    window.open('https://x.com/allonethingxyz', '_blank');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Welcome to SUNSCHOOL</Text>
          
          <Text style={styles.modalText}>
            This is an alpha version of an open source project by{' '}
            <Text 
              style={styles.linkText} 
              onPress={openTwitter}
              accessibilityRole="link"
            >
              @allonethingxyz
            </Text>
          </Text>
          
          <Text style={styles.modalText}>
            We're in early development and need your help! Feel free to explore the app, but please be aware that you may encounter bugs or incomplete features.
          </Text>
          
          <Text style={styles.modalText}>
            Your feedback is invaluable as we continue to improve the platform.
          </Text>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Got it, thanks!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  linkText: {
    color: '#6366F1',
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WelcomeModal;