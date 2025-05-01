import React from 'react';
import { useAuth } from "../hooks/use-auth";
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';

type ProtectedRouteProps = {
  component: React.ComponentType<any>;
  navigation: NavigationProp<any>;
  route: RouteProp<any, any>;
  allowedRoles?: string[];
};

export function ProtectedRoute({
  component: Component,
  navigation,
  route,
  allowedRoles,
  ...rest
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigation.navigate('Auth');
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect based on role if user doesn't have permission
      switch (user.role) {
        case 'ADMIN':
          navigation.navigate('AdminDashboard');
          break;
        case 'PARENT':
          navigation.navigate('ParentDashboard');
          break;
        case 'LEARNER':
          navigation.navigate('LearnerDashboard');
          break;
        default:
          navigation.navigate('Auth');
      }
    }
  }, [isLoading, user, navigation, allowedRoles]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to auth in useEffect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect to appropriate dashboard in useEffect
  }

  return <Component {...rest} navigation={navigation} route={route} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
