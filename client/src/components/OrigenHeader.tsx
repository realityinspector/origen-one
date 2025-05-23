import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Book, User, BarChart2 } from 'react-feather';
import { colors, typography } from '../styles/theme';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/use-auth';

interface OrigenHeaderProps {
  subtitle?: string;
}

const OrigenHeader: React.FC<OrigenHeaderProps> = ({ subtitle }) => {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => location === path;
  
  const getNavItems = () => {
    if (!user || !user.role) return [];
    
    // Ensure we have a valid string role
    const userRole = typeof user.role === 'string' ? (user.role as 'ADMIN' | 'PARENT' | 'LEARNER') : 'LEARNER';
    
    // Basic navigation items for all authenticated users
    const navItems = [
      { 
        label: 'Dashboard', 
        path: '/dashboard', 
        icon: Home,
        roles: ['ADMIN', 'PARENT', 'LEARNER']
      },
    ];
    
    // Additional items based on user role
    if (userRole === 'LEARNER') {
      navItems.push(
        { label: 'Lessons', path: '/learner', icon: Book, roles: ['LEARNER'] },
        { label: 'Progress', path: '/progress', icon: BarChart2, roles: ['LEARNER'] }
      );
    } else {
      navItems.push(
        { label: 'Learners', path: '/learners', icon: User, roles: ['ADMIN', 'PARENT'] },
        { label: 'Reports', path: '/reports', icon: BarChart2, roles: ['ADMIN', 'PARENT'] }
      );
    }
    
    // Admin-specific items
    if (userRole === 'ADMIN') {
      navItems.push(
        { label: 'Admin', path: '/admin', icon: User, roles: ['ADMIN'] }
      );
    }
    
    return navItems.filter(item => item.roles.includes(userRole));
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
        style={styles.titleContainer}
        onPress={() => {
          // Navigate to home/index page for all users
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          } else {
            navigate('/');
          }
        }}
      >
        <Text style={styles.headerTitle}>SUNSCHOOL™</Text>
        <Text style={styles.headerSubtitle}>{subtitle || "powered by Origen™"}</Text>
      </TouchableOpacity>
        
        {user && (
          <View style={styles.navigation}>
            {getNavItems().map((item, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.navItem, isActive(item.path) && styles.activeNavItem]}
                onPress={() => navigate(item.path)}
              >
                <item.icon 
                  size={18} 
                  color={isActive(item.path) ? colors.secondary : colors.onPrimary} 
                  style={styles.navIcon} 
                />
                <Text style={[styles.navText, isActive(item.path) && styles.activeNavText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: 1000,
    marginHorizontal: 'auto',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    ...typography.h2,
    color: colors.onPrimary,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  headerSubtitle: {
    ...typography.subtitle1,
    color: colors.onPrimary + 'CC',
    marginTop: 4,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeNavItem: {
    backgroundColor: colors.onPrimary + '22',
  },
  navIcon: {
    marginRight: 8,
  },
  navText: {
    ...typography.body2,
    color: colors.onPrimary,
    fontWeight: '500',
  },
  activeNavText: {
    color: colors.secondary,
    fontWeight: '600',
  }
});

export default OrigenHeader;
