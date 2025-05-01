import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { colors, typography, commonStyles } from '../styles/theme';
import { Book, User, Shield } from 'react-feather';

const AuthPage = ({ navigation }: any) => {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('PARENT'); // Default role
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
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
      }
    }
  }, [user, navigation]);
  
  const handleLogin = () => {
    if (!loginUsername || !loginPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    loginMutation.mutate({
      username: loginUsername,
      password: loginPassword,
    });
  };
  
  const handleRegister = () => {
    // Validate inputs
    if (!regUsername || !regEmail || !regName || !regPassword || !regConfirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (regPassword !== regConfirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    registerMutation.mutate({
      username: regUsername,
      email: regEmail,
      name: regName,
      password: regPassword,
      role: regRole as any,
    });
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Book size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>AI Tutor</Text>
          <Text style={styles.subtitle}>Personalized learning for every child</Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin ? styles.activeTab : null]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin ? styles.activeTabText : null]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin ? styles.activeTab : null]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin ? styles.activeTabText : null]}>Register</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formContainer}>
          {isLogin ? (
            // Login Form
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChangeText={setLoginUsername}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
              </View>
              
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loginMutation.isPending}
              >
                <Text style={styles.buttonText}>
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Registration Form
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  value={regUsername}
                  onChangeText={setRegUsername}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={regName}
                  onChangeText={setRegName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  secureTextEntry
                  value={regPassword}
                  onChangeText={setRegPassword}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  secureTextEntry
                  value={regConfirmPassword}
                  onChangeText={setRegConfirmPassword}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>I am a:</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      regRole === 'PARENT' ? styles.selectedRole : null,
                    ]}
                    onPress={() => setRegRole('PARENT')}
                  >
                    <User size={20} color={regRole === 'PARENT' ? colors.onPrimary : colors.primary} />
                    <Text style={[
                      styles.roleText,
                      regRole === 'PARENT' ? styles.selectedRoleText : null,
                    ]}>Parent</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      regRole === 'ADMIN' ? styles.selectedRole : null,
                    ]}
                    onPress={() => setRegRole('ADMIN')}
                  >
                    <Shield size={20} color={regRole === 'ADMIN' ? colors.onPrimary : colors.primary} />
                    <Text style={[
                      styles.roleText,
                      regRole === 'ADMIN' ? styles.selectedRoleText : null,
                    ]}>Admin</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={registerMutation.isPending}
              >
                <Text style={styles.buttonText}>
                  {registerMutation.isPending ? 'Registering...' : 'Register'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Why Choose AI Tutor?</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Book size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Personalized Learning</Text>
              <Text style={styles.featureDescription}>
                Lessons adapt to each child's learning style and pace
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <User size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Parent Involvement</Text>
              <Text style={styles.featureDescription}>
                Monitor progress and support your child's learning journey
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Shield size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Safe Environment</Text>
              <Text style={styles.featureDescription}>
                Age-appropriate content in a secure digital space
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
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
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  activeTabText: {
    color: colors.onPrimary,
  },
  formContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.subtitle2,
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
    marginBottom: 0,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  selectedRole: {
    backgroundColor: colors.primary,
  },
  roleText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: 8,
  },
  selectedRoleText: {
    color: colors.onPrimary,
  },
  button: {
    ...commonStyles.button,
    marginTop: 8,
  },
  buttonText: {
    ...commonStyles.buttonText,
  },
  featuresContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    ...typography.h3,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.subtitle1,
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.body2,
  },
});

export default AuthPage;
