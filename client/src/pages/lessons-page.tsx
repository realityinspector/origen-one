import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../hooks/use-api';
import SubjectDashboard from '../components/SubjectDashboard';
import { PageContainer, LoadingSpinner } from '../components/ui-components';
import { useAuth } from '../hooks/use-auth';

export function LessonsPage() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch learner profile to get grade level and subjects
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/learner-profile', user?.id],
    queryFn: () => apiRequest('GET', `/api/learner-profile/${user?.id}`).then(res => res.data),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <View style={styles.container}>
        <SubjectDashboard 
          subjects={profile?.subjects}
          userGradeLevel={profile?.gradeLevel}
        />
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
});

export default LessonsPage;