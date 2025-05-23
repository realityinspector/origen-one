import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Logo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>☀️</Text>
      <Text style={styles.text}>AOT LABS</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#333',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Logo;