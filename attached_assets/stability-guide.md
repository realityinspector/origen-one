# Developer Guide: Using Stability AI Base 3.5 in React Native

## Overview

This guide shows how to integrate Stability AI's Base 3.5 image generation model into a React Native application using the REST API. Stability AI Base 3.5 offers high-quality image generation with excellent prompt adherence.

## Prerequisites

- React Native project set up
- Stability AI API key from [platform.stability.ai](https://platform.stability.ai/)
- Node.js and npm/yarn

## Installation

Add required dependencies:

```bash
npm install axios react-native-fs
# or
yarn add axios react-native-fs
```

Link React Native FS if using React Native < 0.60:

```bash
react-native link react-native-fs
```

## API Integration

### 1. Create API Service

Create a file called `stabilityService.js`:

```javascript
import axios from 'axios';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const API_HOST = 'https://api.stability.ai';
const API_KEY = 'YOUR_STABILITY_API_KEY'; // Replace with your key or use environment variables

class StabilityService {
  constructor(apiKey = API_KEY) {
    this.client = axios.create({
      baseURL: API_HOST,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
  }

  // Get available engines
  async listEngines() {
    try {
      const response = await this.client.get('/v1/engines/list');
      return response.data;
    } catch (error) {
      console.error('Error listing engines:', error);
      throw error;
    }
  }

  // Generate image with SD 3.5
  async generateImage(prompt, options = {}) {
    try {
      const defaultOptions = {
        width: 1024,
        height: 1024,
        samples: 1,
        steps: 30,
        cfgScale: 7,
        sampler: 'K_DPMPP_2M',
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      const formData = new FormData();
      
      // Add text prompts
      formData.append('text_prompts[0][text]', prompt);
      formData.append('text_prompts[0][weight]', 1);
      
      // Add negative prompt if provided
      if (options.negativePrompt) {
        formData.append('text_prompts[1][text]', options.negativePrompt);
        formData.append('text_prompts[1][weight]', -1);
      }
      
      // Add other parameters
      formData.append('cfg_scale', mergedOptions.cfgScale);
      formData.append('samples', mergedOptions.samples);
      formData.append('steps', mergedOptions.steps);
      formData.append('width', mergedOptions.width);
      formData.append('height', mergedOptions.height);
      formData.append('sampler', mergedOptions.sampler);
      
      // SD 3.5 base endpoint
      const response = await this.client.post(
        '/v2beta/stable-image/generate/sd3',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'json',
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error generating image:', error.response?.data || error.message);
      throw error;
    }
  }

  // Save base64 image to file
  async saveBase64Image(base64Data, fileName) {
    try {
      const directory = Platform.OS === 'ios' 
        ? RNFS.DocumentDirectoryPath 
        : RNFS.PicturesDirectoryPath;
        
      const filePath = `${directory}/${fileName}.png`;
      
      await RNFS.writeFile(filePath, base64Data, 'base64');
      
      return filePath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }
}

export default new StabilityService();
```

### 2. Create Image Generation Component

Create a component to handle image generation:

```javascript
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  Alert 
} from 'react-native';
import stabilityService from './stabilityService';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt) {
      Alert.alert('Error', 'Please enter a prompt.');
      return;
    }

    setLoading(true);
    try {
      const result = await stabilityService.generateImage(prompt, {
        negativePrompt: negativePrompt,
        width: 1024,
        height: 1024,
      });

      if (result.artifacts && result.artifacts.length > 0) {
        // Get the base64 data
        const base64Data = result.artifacts[0].base64;
        
        // Save and set the image
        setImage(`data:image/png;base64,${base64Data}`);
        
        // Optionally save to file system
        const filePath = await stabilityService.saveBase64Image(
          base64Data,
          `stability_image_${Date.now()}`
        );
        console.log('Image saved to:', filePath);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate image: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stability AI Image Generator</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your prompt here..."
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />
      
      <TextInput
        style={styles.input}
        placeholder="Negative prompt (optional)"
        value={negativePrompt}
        onChangeText={setNegativePrompt}
        multiline
      />
      
      <TouchableOpacity 
        style={styles.button}
        onPress={generateImage}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Generate Image</Text>
        )}
      </TouchableOpacity>
      
      {image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image }} 
            style={styles.image} 
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
  },
  button: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageGenerator;
```

### 3. Add to App.js

```javascript
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ImageGenerator from './ImageGenerator';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <ImageGenerator />
    </SafeAreaView>
  );
};

export default App;
```

## Android Permissions

For Android, add storage permissions in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

For Android 13+ (API level 33+), you'll also need:

```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## Advanced Options

### Model Options

Stability AI Base 3.5 provides several parameters to control the image generation:

- `cfg_scale`: Controls how strictly the model follows your prompt (default: 7)
- `steps`: Number of diffusion steps (default: 30)
- `sampler`: Diffusion algorithm (K_DPMPP_2M, K_EULER, etc.)
- `width`/`height`: Image dimensions (default: 1024x1024)

### Error Handling

Implement proper error handling to account for:

- API quota limits
- Network failures
- Authentication errors
- Parameter validation errors

### Security

- Always store your API key securely using environment variables or a secure storage solution
- Consider implementing server-side proxying of requests to protect your API key

## Conclusion

This implementation provides a simple way to integrate Stability AI's Base 3.5 model in your React Native application. You can extend it to include additional features like:

- Image history
- Sharing capabilities
- Advanced configuration options
- Progress indicators
- Seed control for reproducible results

For more information, visit the [Stability AI documentation](https://platform.stability.ai/docs/api-reference).
