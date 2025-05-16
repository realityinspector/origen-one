import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../styles/theme';

interface DirectHtmlRendererProps {
  content: string;
  images?: any[];
}

const DirectHtmlRenderer: React.FC<DirectHtmlRendererProps> = ({ content, images = [] }) => {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);
  
  console.log("DirectHtmlRenderer - Received content:", content.substring(0, 100) + "...");
  
  useEffect(() => {
    console.log("DirectHtmlRenderer - Processing content...");
    const processedContent = processContent(content, images);
    setRenderedContent(processedContent);
    console.log("DirectHtmlRenderer - Content processed into", processedContent.length, "elements");
  }, [content, images]);
  
  return (
    <View style={styles.container}>
      {renderedContent}
    </View>
  );
};

function processContent(content: string, images: any[]): React.ReactNode[] {
  console.log("processContent - Starting with content length:", content.length);
  const lines = content.split('\n');
  console.log("processContent - Split into", lines.length, "lines");
  
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      return; // Skip empty lines
    }

    // Process headings
    if (trimmedLine.startsWith('# ')) {
      console.log("processContent - Found h1:", trimmedLine);
      elements.push(
        <Text key={`h1-${index}`} style={styles.heading1}>
          {trimmedLine.substring(2)}
        </Text>
      );
    } 
    else if (trimmedLine.startsWith('## ')) {
      console.log("processContent - Found h2:", trimmedLine);
      elements.push(
        <Text key={`h2-${index}`} style={styles.heading2}>
          {trimmedLine.substring(3)}
        </Text>
      );
    } 
    else if (trimmedLine.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${index}`} style={styles.heading3}>
          {trimmedLine.substring(4)}
        </Text>
      );
    }
    // Process list items
    else if (trimmedLine.startsWith('- ')) {
      elements.push(
        <View key={`li-${index}`} style={styles.listItemContainer}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.listItemText}>{trimmedLine.substring(2)}</Text>
        </View>
      );
    }
    // Process paragraphs
    else {
      elements.push(
        <Text key={`p-${index}`} style={styles.paragraph}>
          {trimmedLine}
        </Text>
      );
    }
  });
  
  // Add images at the end if available
  if (images && images.length > 0) {
    elements.push(
      <View key="images-container" style={styles.imagesContainer}>
        <Text style={styles.heading2}>Educational Illustrations</Text>
        {images.map((image, index) => (
          <Text key={`img-${index}`} style={styles.paragraph}>
            (Image: {image.description || "Educational illustration"})
          </Text>
        ))}
      </View>
    );
  }
  
  console.log("processContent - Returning", elements.length, "elements");
  return elements;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingVertical: 8,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
    color: colors.textPrimary,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    color: colors.textPrimary,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: colors.textPrimary,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: colors.primary,
  },
  listItemText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    color: colors.textPrimary,
  },
  imagesContainer: {
    marginTop: 24,
    marginBottom: 16,
  }
});

export default DirectHtmlRenderer;