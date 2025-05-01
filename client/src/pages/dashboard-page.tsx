import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { colors, typography } from '../styles/theme';
import { Link } from 'wouter';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
      </View>
      
      <View style={styles.content}>
        {user?.role === 'ADMIN' && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>
            <Link href="/admin">
              <View style={styles.linkButton}>
                <Text style={styles.linkButtonText}>Go to Admin Panel</Text>
              </View>
            </Link>
          </View>
        )}
        
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <Link href="/">
            <Text style={styles.linkText}>Home</Text>
          </Link>
          {user?.role === 'PARENT' && (
            <Link href="/learners">
              <Text style={styles.linkText}>Manage Learners</Text>
            </Link>
          )}
          {user?.role === 'LEARNER' && (
            <Link href="/lessons">
              <Text style={styles.linkText}>My Lessons</Text>
            </Link>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  welcomeText: {
    ...typography.subtitle1,
    color: colors.onPrimary,
  },
  content: {
    padding: 24,
  },
  adminSection: {
    backgroundColor: colors.warning + '33', // Adding transparency
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  contentSection: {
    backgroundColor: colors.surfaceColor,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h6,
    marginBottom: 16,
    color: colors.text,
  },
  linkButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  linkButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  linkText: {
    ...typography.body1,
    color: colors.primary,
    marginBottom: 12,
  },
});

export default DashboardPage;
