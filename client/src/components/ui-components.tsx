import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator, ScrollView } from 'react-native';
import { ThemeColors } from '../theme';

// Page container for consistent layout
export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollView style={styles.pageContainer}>
      <View style={styles.pageContent}>
        {children}
      </View>
    </ScrollView>
  );
};

// Loading spinner component
export const LoadingSpinner = ({ size = 'large', color = ThemeColors.blue }: { size?: 'small' | 'large', color?: string }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

// Error message component
export const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

// Card component
export const Card = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

// Section title component
export const SectionTitle = ({ title }: { title: string }) => {
  return <Text style={styles.sectionTitle}>{title}</Text>;
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pageContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: ThemeColors.textSecondary,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: ThemeColors.red,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: ThemeColors.text,
  },
});