import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { colors, typography } from '../styles/theme';

interface Props {
  learnerId?: string | number;
}

const TokenBalance: React.FC<Props> = ({ learnerId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: learnerId ? ['/api/points/balance', learnerId] : ['/api/points/balance'],
    queryFn: () =>
      apiRequest('GET', '/api/points/balance', learnerId ? { learnerId } : undefined).then((res) => res.data),
  });

  if (isLoading) return <ActivityIndicator size="small" color={colors.primary} />;
  if (isError) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tokens</Text>
      <Text style={styles.value}>{data.balance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.h2,
    color: colors.primary,
  },
});

export default TokenBalance;
