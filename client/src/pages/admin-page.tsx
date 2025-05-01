import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { Redirect, Link } from 'wouter';
import { colors, typography } from '../styles/theme';

const AdminPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect if not an admin
  if (user?.role !== 'ADMIN') {
    return <Redirect to="/dashboard" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>System Administration</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Users</Text>
            <Text style={styles.cardDescription}>
              Manage all users in the system, including admins, parents, and learners.
            </Text>
            <Link href="/admin/users">
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Manage Users</Text>
              </View>
            </Link>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lessons</Text>
            <Text style={styles.cardDescription}>
              View and manage all lessons in the system.
            </Text>
            <Link href="/admin/lessons">
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Manage Lessons</Text>
              </View>
            </Link>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Settings</Text>
            <Text style={styles.cardDescription}>
              Configure system settings and preferences.
            </Text>
            <Link href="/admin/settings">
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>System Settings</Text>
              </View>
            </Link>
          </View>
        </View>

        <View style={styles.navigation}>
          <Link href="/dashboard">
            <Text style={styles.navigationLink}>← Back to Dashboard</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.onPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.subtitle1,
    color: colors.onPrimary + 'CC', // Adding transparency
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h5,
    marginBottom: 16,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    ...typography.h6,
    marginBottom: 8,
    color: colors.text,
  },
  cardDescription: {
    ...typography.body1,
    marginBottom: 16,
    color: colors.textSecondary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  navigation: {
    marginTop: 24,
    marginBottom: 24,
  },
  navigationLink: {
    ...typography.body1,
    color: colors.primary,
  },
});

export default AdminPage;
