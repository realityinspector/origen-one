import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/use-auth';
import OrigenHeader from './OrigenHeader';
import AppFooter from './AppFooter';
import { colors } from '../styles/theme';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Don't show the header and footer for unauthenticated users
  if (!user && !isLoading) {
    return <>{children}</>;
  }
  
  // Also don't show when authentication is still loading
  if (isLoading) {
    return <>{children}</>;
  }
  
  return (
    <View style={styles.container}>
      <OrigenHeader />
      <View style={styles.content}>
        {children}
      </View>
      <AppFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    padding: 20,
  },
});

export default AppLayout;