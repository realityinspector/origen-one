import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../styles/theme';
import LessonImage from './LessonImage';

interface SimpleMarkdownRendererProps {
  content: string;
  images?: Array<{
    id: string;
    alt: string;
    description?: string;
    svgData?: string;
  }>;
}

/**
 * A simple markdown renderer that handles basic markdown formatting
 * without external dependencies that might cause build issues
 */
export const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content, images = [] }) => {
  // Parse content into sections
  const sections = parseMarkdownContent(content);

  return (
    <View style={styles.container}>
      {sections.map((section, index) => renderSection(section, index))}
      
      {/* Render SVG images */}
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

interface MarkdownSection {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'bullet' | 'numbered';
  content: string;
}

/**
 * Parse markdown content into sections
 */
function parseMarkdownContent(content: string): MarkdownSection[] {
  const lines = content.split('\n');
  const sections: MarkdownSection[] = [];
  
  let currentParagraph: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (line === '') {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      continue;
    }
    
    // Headings
    if (line.startsWith('# ')) {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      
      sections.push({
        type: 'h1',
        content: line.substring(2)
      });
    } 
    else if (line.startsWith('## ')) {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      
      sections.push({
        type: 'h2',
        content: line.substring(3)
      });
    } 
    else if (line.startsWith('### ')) {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      
      sections.push({
        type: 'h3',
        content: line.substring(4)
      });
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      
      sections.push({
        type: 'bullet',
        content: line.substring(2)
      });
    }
    // Numbered list
    else if (/^\d+\./.test(line)) {
      if (currentParagraph.length > 0) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
      
      const content = line.replace(/^\d+\.\s*/, '');
      sections.push({
        type: 'numbered',
        content
      });
    }
    // Regular paragraph text
    else {
      currentParagraph.push(line);
    }
  }
  
  // Add the remaining paragraph if any
  if (currentParagraph.length > 0) {
    sections.push({
      type: 'paragraph',
      content: currentParagraph.join(' ')
    });
  }
  
  return sections;
}

/**
 * Render a markdown section
 */
function renderSection(section: MarkdownSection, index: number) {
  switch (section.type) {
    case 'h1':
      return (
        <Text key={`section-${index}`} style={styles.h1}>
          {section.content}
        </Text>
      );
    case 'h2':
      return (
        <Text key={`section-${index}`} style={styles.h2}>
          {section.content}
        </Text>
      );
    case 'h3':
      return (
        <Text key={`section-${index}`} style={styles.h3}>
          {section.content}
        </Text>
      );
    case 'bullet':
      return (
        <View key={`section-${index}`} style={styles.bulletContainer}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.bulletText}>{section.content}</Text>
        </View>
      );
    case 'numbered':
      return (
        <View key={`section-${index}`} style={styles.numberedContainer}>
          <Text style={styles.bulletPoint}>{index + 1}.</Text>
          <Text style={styles.bulletText}>{section.content}</Text>
        </View>
      );
    case 'paragraph':
    default:
      return (
        <Text key={`section-${index}`} style={styles.paragraph}>
          {section.content}
        </Text>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  h1: {
    ...typography.h1,
    marginTop: 24,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  h2: {
    ...typography.h2,
    marginTop: 20,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  h3: {
    ...typography.h3,
    marginTop: 16,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  paragraph: {
    ...typography.body1,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  numberedContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 20,
    ...typography.body1,
    color: colors.textPrimary,
  },
  bulletText: {
    flex: 1,
    ...typography.body1,
    color: colors.textPrimary,
  },
  imagesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default SimpleMarkdownRenderer;