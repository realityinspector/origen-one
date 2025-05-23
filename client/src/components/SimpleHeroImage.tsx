import React from 'react';
import { View, StyleSheet } from 'react-native';

// Simple component to render a colored hero image placeholder
const SimpleHeroImage: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.sun} />
      <View style={styles.panel} />
      <View style={styles.dish} />
      <View style={styles.cabin}>
        <View style={styles.roof} />
        <View style={styles.window} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#1E90FF',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8
  },
  sun: {
    position: 'absolute',
    top: 30,
    right: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    elevation: 5
  },
  panel: {
    position: 'absolute',
    bottom: 50,
    left: '50%',
    width: 60,
    height: 40,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#666',
    transform: [{ translateX: -30 }, { rotate: '15deg' }]
  },
  dish: {
    position: 'absolute',
    bottom: 60,
    right: 60,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DDD',
    borderWidth: 1,
    borderColor: '#999'
  },
  cabin: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    width: 100,
    height: 70,
    backgroundColor: '#8B4513'
  },
  roof: {
    position: 'absolute',
    top: -30,
    left: -10,
    width: 120,
    height: 30,
    backgroundColor: '#A52A2A',
    transform: [{ rotate: '-5deg' }],
    zIndex: 1
  },
  window: {
    position: 'absolute',
    top: 20,
    left: 35,
    width: 30,
    height: 30,
    backgroundColor: '#87CEFA',
    borderWidth: 2,
    borderColor: '#654321'
  }
});

export default SimpleHeroImage;