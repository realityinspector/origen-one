import React from 'react';
import { StatusBar, SafeAreaView, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ToastProvider } from './hooks/use-toast';
import { useAuth } from './hooks/use-auth';

// Screens
import AuthPage from './pages/auth-page';
import AdminDashboard from './pages/admin-dashboard';
import ParentDashboard from './pages/parent-dashboard';
import LearnerDashboard from './pages/learner-dashboard';
import LessonPage from './pages/lesson-page';
import QuizPage from './pages/quiz-page';
import ProgressPage from './pages/progress-page';
import { ProtectedRoute } from './lib/protected-route';

// Disable specific warnings
LogBox.ignoreLogs([
  'Asyncstorage is deprecated',
  'ViewPropTypes will be removed',
]);

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You could add a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200EE',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Auth routes
          <Stack.Screen 
            name="Auth" 
            component={AuthPage} 
            options={{ headerShown: false }}
          />
        ) : (
          // Logged in routes based on role
          <>
            {user.role === 'ADMIN' && (
              <>
                <Stack.Screen
                  name="AdminDashboard"
                  options={{ title: 'Admin Dashboard' }}
                >
                  {(props) => <ProtectedRoute component={AdminDashboard} allowedRoles={['ADMIN']} {...props} />}
                </Stack.Screen>
              </>
            )}
            
            {user.role === 'PARENT' && (
              <>
                <Stack.Screen
                  name="ParentDashboard"
                  options={{ title: 'Parent Dashboard' }}
                >
                  {(props) => <ProtectedRoute component={ParentDashboard} allowedRoles={['PARENT']} {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="ProgressPage"
                  options={{ title: 'Child Progress' }}
                >
                  {(props) => <ProtectedRoute component={ProgressPage} allowedRoles={['PARENT']} {...props} />}
                </Stack.Screen>
              </>
            )}
            
            {user.role === 'LEARNER' && (
              <>
                <Stack.Screen
                  name="LearnerDashboard"
                  options={{ title: 'My Learning' }}
                >
                  {(props) => <ProtectedRoute component={LearnerDashboard} allowedRoles={['LEARNER']} {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="LessonPage"
                  options={{ title: 'Lesson' }}
                >
                  {(props) => <ProtectedRoute component={LessonPage} allowedRoles={['LEARNER']} {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="QuizPage"
                  options={{ title: 'Quiz' }}
                >
                  {(props) => <ProtectedRoute component={QuizPage} allowedRoles={['LEARNER']} {...props} />}
                </Stack.Screen>
                <Stack.Screen
                  name="ProgressPage"
                  options={{ title: 'My Progress' }}
                >
                  {(props) => <ProtectedRoute component={ProgressPage} allowedRoles={['LEARNER']} {...props} />}
                </Stack.Screen>
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </SafeAreaView>
    </ToastProvider>
  );
}
