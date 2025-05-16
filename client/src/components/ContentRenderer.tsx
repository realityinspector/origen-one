import React from 'react';
import { View, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, typography } from '../styles/theme';
import LessonImage from './LessonImage';

interface ContentRendererProps {
  content: string;
  images?: any[];
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content,
  images = []
}) => {
  // Clean up markdown content by ensuring proper line breaks
  const formattedContent = content
    .replace(/\n#/g, '\n\n#')
    .replace(/\n\-/g, '\n\n-')
    .replace(/\n\d+\./g, '\n\n1.')
    .replace(/\n>/g, '\n\n>');

  return (
    <View style={styles.container}>
      <Markdown style={markdownStyles}>
        {formattedContent}
      </Markdown>
      
      {images && images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <LessonImage 
              key={image.id || `image-${index}`}
              svgData={image.svgData}
              altText={image.alt}
              description={image.description}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Define markdown styles with proper typing
const markdownStyles = {
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontWeight: 'bold',
    fontSize: 24,
    lineHeight: 32,
    marginTop: 24,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  heading2: {
    fontWeight: 'bold',
    fontSize: 20,
    lineHeight: 28,
    marginTop: 20,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  heading3: {
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  list_item: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingLeft: 16,
    opacity: 0.8,
    marginVertical: 16,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  code_inline: {
    fontFamily: 'monospace',
    backgroundColor: colors.divider,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  code_block: {
    fontFamily: 'monospace',
    backgroundColor: colors.divider,
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  fence: {
    fontFamily: 'monospace',
    backgroundColor: colors.divider,
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  hr: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  // Note: We don't include image style here since it's handled separately through LessonImage
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imagesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default ContentRenderer;