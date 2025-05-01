import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, commonStyles } from '../styles/theme';
import { Award, Star, BookOpen, Zap } from 'react-feather';

interface AchievementBadgeProps {
  achievement: any;
  style?: ViewStyle;
  large?: boolean;
  onPress?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  style,
  large = false,
  onPress,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Get icon based on achievement type
  const getAchievementIcon = () => {
    const iconSize = large ? 32 : 24;
    const iconColor = colors.onPrimary;
    
    switch (achievement.type) {
      case 'FIRST_LESSON':
        return <BookOpen size={iconSize} color={iconColor} />;
      case 'FIVE_LESSONS':
        return <Zap size={iconSize} color={iconColor} />;
      case 'PERFECT_SCORE':
        return <Star size={iconSize} color={iconColor} />;
      default:
        return <Award size={iconSize} color={iconColor} />;
    }
  };
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[
        styles.container,
        large && styles.largeContainer,
        style,
      ]}
      onPress={onPress}
    >
      <View 
        style={[
          styles.iconContainer,
          large && styles.largeIconContainer,
        ]}
      >
        {getAchievementIcon()}
      </View>
      
      <Text
        style={[
          styles.title,
          large && styles.largeTitle,
        ]}
        numberOfLines={2}
      >
        {achievement.payload.title}
      </Text>
      
      {large && (
        <>
          <Text style={styles.description} numberOfLines={2}>
            {achievement.payload.description}
          </Text>
          
          <Text style={styles.date}>
            Earned on {formatDate(achievement.awardedAt)}
          </Text>
        </>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  largeContainer: {
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  largeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  title: {
    ...typography.subtitle2,
    color: colors.onPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  largeTitle: {
    ...typography.subtitle1,
    marginBottom: 8,
    textAlign: 'left',
  },
  description: {
    ...typography.body2,
    color: colors.onPrimary,
    marginBottom: 12,
    opacity: 0.9,
  },
  date: {
    ...typography.caption,
    color: colors.onPrimary,
    opacity: 0.7,
  },
});

export default AchievementBadge;
