import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { colors, typography } from '../styles/theme';
import { User, BookOpen } from 'react-feather';
import { useMode } from '../context/ModeContext';

interface ModeToggleProps {
  style?: any;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ style }) => {
  const { isLearnerMode, toggleMode } = useMode();

  // Debug message in console
  console.log('ModeToggle rendering', { isLearnerMode, toggleMode });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Mode Toggle</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Manual toggle pressed');
            toggleMode();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Switch to {isLearnerMode ? 'GROWN-UP' : 'LEARNER'} Mode
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ModeToggle;