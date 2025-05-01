import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'wouter';
import { useAuth } from '../hooks/use-auth';
import { Redirect } from 'wouter';
import { colors, typography } from '../styles/theme';

const WelcomePage: React.FC = () => {
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Origen AI Tutor</Text>
        <Text style={styles.subtitle}>The personalized learning platform powered by AI</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featureItem}>✓ Personalized learning paths</Text>
          <Text style={styles.featureItem}>✓ Adaptive content for your grade level</Text>
          <Text style={styles.featureItem}>✓ Track progress with detailed analytics</Text>
          <Text style={styles.featureItem}>✓ Parent and admin dashboards</Text>
        </View>
        
        <View style={styles.ctaContainer}>
          <Link href="/auth">
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </View>
          </Link>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 800,
    width: '100%',
  },
  title: {
    ...typography.h1,
    marginBottom: 16,
    textAlign: 'center',
    color: colors.primary,
  },
  subtitle: {
    ...typography.subtitle1,
    marginBottom: 32,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  featuresContainer: {
    marginBottom: 48,
    alignSelf: 'center',
  },
  featureItem: {
    ...typography.body1,
    marginBottom: 12,
    color: colors.text,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  ctaButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});

export default WelcomePage;
