import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, useTheme } from '../styles/theme';
import type { Theme } from '../styles/theme';

interface DirectHtmlRendererProps {
  content: string;
  images?: any[];
}

const DirectHtmlRenderer: React.FC<DirectHtmlRendererProps> = ({ content, images = [] }) => {
  const theme = useTheme();
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const processedContent = processContent(content, images, theme);
    setRenderedContent(processedContent);
  }, [content, images, theme]);

  return (
    <View style={styles.container}>
      {renderedContent}
    </View>
  );
};

function processContent(content: string, images: any[], theme: Theme): React.ReactNode[] {
  const lines = content.split('\n');

  const elements: React.ReactNode[] = [];
  let isFirstParagraph = true;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      return; // Skip empty lines
    }

    // Process headings
    if (trimmedLine.startsWith('# ')) {
      elements.push(
        <Text
          key={`h1-${index}`}
          style={[
            styles.heading1,
            { color: theme.colors.textPrimary, fontSize: 36, lineHeight: 44 },
          ]}
        >
          {trimmedLine.substring(2)}
        </Text>
      );
    }
    else if (trimmedLine.startsWith('## ')) {
      elements.push(
        <Text
          key={`h2-${index}`}
          style={[
            styles.heading2,
            { color: theme.colors.textPrimary, fontSize: 30, lineHeight: 38 },
          ]}
        >
          {trimmedLine.substring(3)}
        </Text>
      );
    }
    else if (trimmedLine.startsWith('### ')) {
      elements.push(
        <Text
          key={`h3-${index}`}
          style={[
            styles.heading3,
            { color: theme.colors.textPrimary, fontSize: 24, lineHeight: 32 },
          ]}
        >
          {trimmedLine.substring(4)}
        </Text>
      );
    }
    // Process list items
    else if (trimmedLine.startsWith('- ')) {
      elements.push(
        <View key={`li-${index}`} style={styles.listItemContainer}>
          <Text style={[styles.bulletPoint, { color: theme.colors.primary, fontSize: 20 }]}>
            {'\u25CF'}
          </Text>
          <Text
            style={[
              styles.listItemText,
              { color: theme.colors.textPrimary, fontSize: 20, lineHeight: 32 },
            ]}
          >
            {trimmedLine.substring(2)}
          </Text>
        </View>
      );
    }
    // Process paragraphs
    else {
      if (isFirstParagraph) {
        // First paragraph: styled as a highlighted callout / intro hook
        isFirstParagraph = false;
        elements.push(
          <View
            key={`p-callout-${index}`}
            style={[
              styles.calloutBox,
              {
                backgroundColor: theme.colors.primary + '12',
                borderLeftColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.paragraph,
                {
                  color: theme.colors.textPrimary,
                  fontSize: 20,
                  lineHeight: 32,
                  fontWeight: '600',
                  marginBottom: 0,
                },
              ]}
            >
              {trimmedLine}
            </Text>
          </View>
        );
      } else {
        elements.push(
          <Text
            key={`p-${index}`}
            style={[
              styles.paragraph,
              { color: theme.colors.textPrimary, fontSize: 20, lineHeight: 32 },
            ]}
          >
            {trimmedLine}
          </Text>
        );
      }
    }
  });

  // Add images at the end if available
  if (images && images.length > 0) {
    elements.push(
      <View key="images-container" style={styles.imagesContainer}>
        <Text
          style={[
            styles.heading2,
            { color: theme.colors.textPrimary, fontSize: 30, lineHeight: 38 },
          ]}
        >
          Educational Illustrations
        </Text>
        {images.map((image, index) => (
          <Text
            key={`img-${index}`}
            style={[
              styles.paragraph,
              { color: theme.colors.textPrimary, fontSize: 20, lineHeight: 32 },
            ]}
          >
            (Image: {image.description || "Educational illustration"})
          </Text>
        ))}
      </View>
    );
  }

  return elements;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingVertical: 8,
  },
  heading1: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 24,
    color: colors.textPrimary,
    lineHeight: 44,
  },
  heading2: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    color: colors.textPrimary,
    lineHeight: 38,
  },
  heading3: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  paragraph: {
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  calloutBox: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 16,
    marginTop: 4,
  },
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 4,
    color: colors.primary,
  },
  listItemText: {
    fontSize: 20,
    lineHeight: 32,
    flex: 1,
    color: colors.textPrimary,
  },
  imagesContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
});

export default DirectHtmlRenderer;
