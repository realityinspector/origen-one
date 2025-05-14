import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { colors, typography, commonStyles } from '../styles/theme';
import { Book, Award, BarChart2 } from 'react-feather';
import { useLocation } from 'wouter';

const HomePage = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const navigateBasedOnRole = () => {
    if (!user) return;
    
    switch (user.role) {
      case 'ADMIN':
        setLocation('/admin');
        break;
      case 'PARENT':
        setLocation('/dashboard');
        break;
      case 'LEARNER':
        setLocation('/learner');
        break;
      default:
        setLocation('/auth');
    }
  };

  React.useEffect(() => {
    if (user) {
      navigateBasedOnRole();
    }
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Book size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>ORIGEN</Text>
          <Text style={styles.subtitle}>Welcome, {user.name}!</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigateBasedOnRole()}
          >
            <View style={styles.cardIconContainer}>
              <Book size={24} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Continue Learning</Text>
            <Text style={styles.cardDescription}>
              {user.role === 'LEARNER' 
                ? 'Return to your personalized lessons' 
                : user.role === 'PARENT'
                  ? 'Monitor your child\'s progress'
                  : 'Manage platform users and content'}
            </Text>
          </TouchableOpacity>

          {user.role === 'LEARNER' && (
            <>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => setLocation('/progress')}
              >
                <View style={styles.cardIconContainer}>
                  <BarChart2 size={24} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>View Progress</Text>
                <Text style={styles.cardDescription}>
                  See your learning journey and knowledge graph
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.card}
                onPress={() => setLocation('/learner')}
              >
                <View style={styles.cardIconContainer}>
                  <Award size={24} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>Achievements</Text>
                <Text style={styles.cardDescription}>
                  View your earned badges and rewards
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => logoutMutation.mutate()}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.subtitle1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cardContainer: {
    marginTop: 24,
  },
  card: {
    ...commonStyles.card,
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  cardDescription: {
    ...typography.body2,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.error,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.onError,
  },
});

export default HomePage;
