import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { colors, typography } from '../styles/theme';

interface LessonImageProps {
  svgData?: string;
  altText: string;
  description?: string;
}

export const LessonImage: React.FC<LessonImageProps> = ({ 
  svgData, 
  altText,
  description
}) => {
  if (!svgData) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>{altText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <SvgXml xml={svgData} width="100%" height="200" />
      </View>
      {description && (
        <Text style={styles.caption}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    width: '100%',
    height: 150,
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LessonImage;