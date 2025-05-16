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
    // Process the content line by line for better control
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Skip empty lines
      if (line === '') {
        html += '<br>';
        continue;
      }
      
      // Process headings
      if (line.startsWith('# ')) {
        html += `<h1>${line.substring(2)}</h1>`;
      } 
      else if (line.startsWith('## ')) {
        html += `<h2>${line.substring(3)}</h2>`;
      } 
      else if (line.startsWith('### ')) {
        html += `<h3>${line.substring(4)}</h3>`;
      } 
      // Process list items
      else if (line.startsWith('- ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${line.substring(2)}</li>`;
        
        // Check if next line is not a list item
        if ((i + 1 >= lines.length) || 
            !lines[i + 1].trim().startsWith('- ')) {
          html += '</ul>';
          inList = false;
        }
      } 
      // Process regular paragraphs
      else {
        html += `<p>${line}</p>`;
      }
    }
    
    return html;
  };
  
  // Build image HTML
  const imageHtml = images && images.length > 0
    ? images.map(img => {
        if (img.svgData) {
          return `
            <div style="margin: 20px 0; text-align: center; width: 100%;">
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 16px; width: 100%; max-width: 500px; margin: 0 auto;">
                ${img.svgData}
              </div>
              ${img.description ? `<p style="color: #666; font-size: 14px; margin-top: 8px;">${img.description}</p>` : ''}
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