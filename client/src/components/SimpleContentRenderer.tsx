import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { WebView } from 'react-native-web';
import { colors } from '../styles/theme';

interface SimpleContentRendererProps {
  content: string;
  images?: any[];
}

const SimpleContentRenderer: React.FC<SimpleContentRendererProps> = ({ content, images = [] }) => {
  
  // Convert markdown to simple HTML
  const convertToHtml = (markdown: string) => {
    // Replace headings
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Replace lists
    html = html
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/<\/li>\n<li>/g, '</li><li>');
    
    // Wrap lists
    html = html.replace(/<li>([^<]*)<\/li>/g, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/g, '');
    
    // Replace paragraphs
    html = html.replace(/^([^<#\-\n].*)/gm, '<p>$1</p>');
    
    // Replace line breaks
    html = html.replace(/\n/g, '');
    
    return html;
  };
  
  // Build image HTML
  const imageHtml = images && images.length > 0
    ? images.map(img => {
        if (img.svgData) {
          return `
            <div style="margin: 20px 0; text-align: center;">
              ${img.svgData}
              ${img.description ? `<p style="color: #666; font-size: 14px;">${img.description}</p>` : ''}
            </div>
          `;
        }
        return '';
      }).join('')
    : '';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            padding: 0;
            margin: 0;
          }
          h1 {
            font-size: 24px;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 20px;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          h3 {
            font-size: 18px;
            margin-top: 10px;
            margin-bottom: 8px;
          }
          p {
            margin-bottom: 10px;
          }
          ul {
            margin-bottom: 15px;
            padding-left: 25px;
          }
          li {
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        ${convertToHtml(content)}
        ${imageHtml}
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={false}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surfaceColor,
    minHeight: 200,
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});

export default SimpleContentRenderer;