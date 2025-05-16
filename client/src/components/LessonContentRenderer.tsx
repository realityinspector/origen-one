import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, typography } from '../styles/theme';
import { SvgXml } from 'react-native-svg';

interface LessonContentRendererProps {
  content: string;
  images?: Array<{
    id: string;
    alt: string;
    description?: string;
    svgData?: string;
  }>;
}

const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({ 
  content, 
  images = [] 
}) => {
  // Process markdown to ensure it's displayed correctly
  const formattedContent = content
    .replace(/^# /gm, '# ')  // Ensure proper heading format
    .replace(/^## /gm, '## ') // Ensure proper subheading format
    .replace(/^\- /gm, '- '); // Ensure proper list format

  return (
    <View style={styles.container}>
      <Markdown style={{
        body: { fontSize: 16, lineHeight: 24, color: colors.textPrimary },
        heading1: { fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
        heading2: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
        paragraph: { marginBottom: 12 },
        bullet_list: { marginBottom: 12 },
        ordered_list: { marginBottom: 12 },
        list_item: { marginBottom: 8 }
      }}>
        {formattedContent}
      </Markdown>

      {images && images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            image.svgData ? (
              <View key={image.id || `image-${index}`} style={styles.imageWrapper}>
                <SvgXml xml={image.svgData} width="100%" height={200} />
                {image.description && (
                  <Text style={styles.imageCaption}>{image.description}</Text>
                )}
              </View>
            ) : null
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  imagesContainer: {
    marginTop: 16,
  },
  imageWrapper: {
    marginBottom: 24,
    alignItems: 'center',
  },
  imageCaption: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  }
});

export default LessonContentRenderer;