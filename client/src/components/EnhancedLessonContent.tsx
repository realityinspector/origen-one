import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, typography } from '../styles/theme';

interface LessonImage {
  id: string;
  description: string;
  alt: string;
  base64Data?: string;
  svgData?: string;
  promptUsed: string;
}

interface LessonDiagram {
  id: string;
  type: string;
  title: string;
  svgData: string;
  description: string;
}

interface LessonSection {
  title: string;
  content: string;
  type: string;
  imageIds?: string[];
}

interface EnhancedLessonSpec {
  title: string;
  targetGradeLevel: number;
  subtitle?: string;
  summary: string;
  sections: LessonSection[];
  featuredImage?: string;
  images: LessonImage[];
  diagrams: LessonDiagram[];
  questions: any[];
  graph?: any;
  keywords: string[];
  relatedTopics: string[];
  estimatedDuration: number;
  difficultyLevel: string;
}

interface EnhancedLessonContentProps {
  enhancedSpec: EnhancedLessonSpec;
}

const markdownStyles = {
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    ...typography.h1,
    marginTop: 24,
    marginBottom: 16,
  },
  heading2: {
    ...typography.h2,
    marginTop: 20,
    marginBottom: 12,
  },
  heading3: {
    ...typography.h3,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    ...typography.body1,
    marginBottom: 16,
  },
  list_item: {
    marginBottom: 8,
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
};

const EnhancedLessonContent: React.FC<EnhancedLessonContentProps> = ({ enhancedSpec }) => {
  // Helper function to find an image by ID
  const findImageById = (id: string) => {
    return enhancedSpec.images.find(img => img.id === id);
  };

  // Helper function to render an image
  const renderImage = (image: LessonImage) => {
    if (image.base64Data) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/png;base64,${image.base64Data}` }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.imageCaption}>{image.description}</Text>
        </View>
      );
    } else if (image.svgData) {
      return (
        <View style={styles.imageContainer}>
          <div dangerouslySetInnerHTML={{ __html: image.svgData }} />
          <Text style={styles.imageCaption}>{image.description}</Text>
        </View>
      );
    }
    return null;
  };

  // Render featured image
  const renderFeaturedImage = () => {
    if (enhancedSpec.featuredImage) {
      const image = findImageById(enhancedSpec.featuredImage);
      if (image) {
        return renderImage(image);
      }
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      {enhancedSpec.subtitle && (
        <Text style={styles.subtitle}>{enhancedSpec.subtitle}</Text>
      )}
      
      <Text style={styles.summary}>{enhancedSpec.summary}</Text>
      
      {/* Featured Image */}
      {renderFeaturedImage()}
      
      {/* Metadata Bar */}
      <View style={styles.metadataBar}>
        <Text style={styles.metadata}>
          <Text style={styles.metadataLabel}>Duration:</Text> {enhancedSpec.estimatedDuration} min
        </Text>
        <Text style={styles.metadata}>
          <Text style={styles.metadataLabel}>Level:</Text> {enhancedSpec.difficultyLevel}
        </Text>
        <Text style={styles.metadata}>
          <Text style={styles.metadataLabel}>Grade:</Text> {enhancedSpec.targetGradeLevel}
        </Text>
      </View>
      
      {/* Content Sections */}
      {enhancedSpec.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          {/* Section Images */}
          {section.imageIds && section.imageIds.map(imageId => {
            const image = findImageById(imageId);
            if (image) {
              return renderImage(image);
            }
            return null;
          })}
          
          {/* Section Content */}
          <Markdown style={markdownStyles}>
            {section.content}
          </Markdown>
        </View>
      ))}
      
      {/* Diagrams */}
      {enhancedSpec.diagrams.length > 0 && (
        <View style={styles.diagramsSection}>
          <Text style={styles.diagramsTitle}>Diagrams</Text>
          {enhancedSpec.diagrams.map((diagram, index) => (
            <View key={index} style={styles.diagram}>
              <Text style={styles.diagramTitle}>{diagram.title}</Text>
              <View style={styles.diagramContainer}>
                <div dangerouslySetInnerHTML={{ __html: diagram.svgData }} />
              </View>
              <Text style={styles.diagramDescription}>{diagram.description}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Keywords and Related Topics */}
      <View style={styles.tagsContainer}>
        <Text style={styles.tagsTitle}>Keywords:</Text>
        <View style={styles.tagsList}>
          {enhancedSpec.keywords.map((keyword, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {enhancedSpec.relatedTopics.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>Related Topics:</Text>
          <View style={styles.tagsList}>
            {enhancedSpec.relatedTopics.map((topic, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{topic}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  subtitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summary: {
    ...typography.body1,
    fontWeight: 'bold',
    marginBottom: 16,
    backgroundColor: colors.surfaceColor,
    padding: 16,
    borderRadius: 8,
  },
  metadataBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.divider,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  metadata: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  metadataLabel: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: 12,
    color: colors.primary,
  },
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imageCaption: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  diagramsSection: {
    marginVertical: 16,
  },
  diagramsTitle: {
    ...typography.h2,
    marginBottom: 12,
  },
  diagram: {
    marginBottom: 16,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 12,
  },
  diagramTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  diagramContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    marginVertical: 8,
  },
  diagramDescription: {
    ...typography.body2,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  tagsContainer: {
    marginVertical: 8,
  },
  tagsTitle: {
    ...typography.subtitle1,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});

export default EnhancedLessonContent;