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
import { useAuth } from '../hooks/use-auth';
import { useMode } from '../context/ModeContext';

interface ModeToggleProps {
  style?: any;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ style }) => {
  const { user } = useAuth();
  const { isLearnerMode, toggleMode } = useMode();

  // Skip rendering for admin users or if no user exists
  if (!user || user.role === 'ADMIN') return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.toggleContainer}>
        <View style={styles.iconContainer}>
          <User size={16} color={!isLearnerMode ? colors.primary : colors.textSecondary} />
        </View>
        <Switch
          value={isLearnerMode}
          onValueChange={toggleMode}
          trackColor={{ false: colors.primaryLight, true: colors.primaryLight }}
          thumbColor={isLearnerMode ? colors.primary : colors.primary}
        />
        <View style={styles.iconContainer}>
          <BookOpen size={16} color={isLearnerMode ? colors.primary : colors.textSecondary} />
        </View>
      </View>
      <Text style={styles.label}>{isLearnerMode ? 'Learner Mode' : 'Grown-up Mode'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ModeToggle;