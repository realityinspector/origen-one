import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../styles/theme';
import { User, BookOpen } from 'react-feather';
import { useMode } from '../context/ModeContext';

interface ModeToggleProps {
  style?: any;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ style }) => {
  const { isLearnerMode, toggleMode } = useMode();

  const handleToggleMode = () => {
    toggleMode();
  };

  return (
    <TouchableOpacity 
      onPress={handleToggleMode}
      style={[styles.iconButton, style]}
    >
      {isLearnerMode ? (
        <User size={20} color={colors.primary} />
      ) : (
        <BookOpen size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default ModeToggle;