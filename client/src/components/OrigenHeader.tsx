import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../styles/theme';

interface OrigenHeaderProps {
  subtitle?: string;
}

const OrigenHeader: React.FC<OrigenHeaderProps> = ({ subtitle }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>ORIGEN™</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      <Text style={styles.copyright}>All materials copyright Sean McDonald 2025</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...typography.subtitle1,
    color: colors.onPrimary + 'CC',
    marginTop: 4,
  },
  copyright: {
    ...typography.caption,
    color: colors.onPrimary + '99',
    marginTop: 8,
    fontSize: 10,
  },
});

export default OrigenHeader;
