import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { Redirect, Link } from 'wouter';
import { colors, typography } from '../styles/theme';

const AdminLessonsPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect if not an admin
  if (user?.role !== 'ADMIN') {
    return <Redirect to="/dashboard" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lessons Management</Text>
        <Text style={styles.headerSubtitle}>Manage system lessons</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Lessons</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              This is a placeholder for the Lessons management UI. This page will include a list of all lessons and functionality to create, edit and manage them.
            </Text>
          </View>
        </View>

        <View style={styles.navigation}>
          <Link href="/admin">
            <Text style={styles.navigationLink}>← Back to Admin Panel</Text>
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
    ...typography.h3,
    marginBottom: 16,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
  },
  cardDescription: {
    ...typography.body1,
    color: colors.textSecondary,
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

export default AdminLessonsPage;
