import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'wouter';
import AuthPage from './pages/auth-page';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import LearnersPage from './pages/learners-page';
import AddLearnerPage from './pages/add-learner-page';
import ChangeLearnerSubjectsPage from './pages/change-learner-subjects';
import ReportsPage from './pages/reports-page';
import AdminPage from './pages/admin-page';
import AdminUsersPage from './pages/admin-users-page';
import AdminLessonsPage from './pages/admin-lessons-page';
import AdminSettingsPage from './pages/admin-settings-page';
import WelcomePage from './pages/modern-welcome';
import LearnerHome from './pages/learner-home';
import ActiveLessonPage from './pages/active-lesson-page';
import QuizPage from './pages/quiz-page';
import ProgressPage from './pages/progress-page';
import DatabaseSyncPage from './pages/database-sync-page';
import LessonsPage from './pages/lessons-page';
import { ProtectedRoute } from './lib/protected-route';
import { AdminRoute } from './lib/admin-route';
import { LearnerRoute } from './lib/learner-route';
import { Toaster } from './components/ui/toast';
import { PlausibleAnalytics } from './components/PlausibleAnalytics';
import { useAuth } from './hooks/use-auth';
import { ModeProvider } from './context/ModeContext';
import ModeToggle from './components/ModeToggle';
import AppLayout from './components/AppLayout';
import WelcomeModal from './components/WelcomeModal';
import { useWelcomeModal } from './hooks/use-welcome-modal';

// Home redirect component to handle auth status
const HomeRedirect = () => {
  const { user, isLoading } = useAuth();
  
  console.log("HomeRedirect: User authentication status", { 
    isAuthenticated: !!user, 
    isLoading,
    userId: user?.id,
    userRole: user?.role
  });
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading authentication status...</p>
      </div>
    );
  }
  
  // Force redirect to welcome page for unauthenticated users
  if (!user) {
    console.log("HomeRedirect: User is not authenticated, redirecting to /welcome");
    return <Redirect to="/welcome" />;
  }
  
  // Only proceed with role-based redirects if user is authenticated
  console.log("HomeRedirect: User is authenticated with role:", user.role);
  if (user.role === 'LEARNER') {
    return <Redirect to="/learner" />;
  } else {
    return <Redirect to="/dashboard" />;
  }
};

export default function App() {
  const { user } = useAuth();
  const { isVisible, closeModal } = useWelcomeModal();

  return (
    <div className="app-container">
      <PlausibleAnalytics 
        domain="origen-ai-tutor.org" 
        enabled={process.env.NODE_ENV === 'production' && process.env.ENABLE_STATS !== 'false'} 
      />
      {/* Welcome Modal */}
      <WelcomeModal isVisible={isVisible} onClose={closeModal} />
      
      <ModeProvider>
        {user && (
          <div style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
          }}>
            <ModeToggle />
          </div>
        )}
        <AppLayout>
          <Switch>
            {/* Public routes (no auth required) */}
            <Route path="/welcome" component={WelcomePage} />
            <Route path="/auth" component={AuthPage} />
            
            {/* Protected admin routes */}
            <AdminRoute path="/admin" component={AdminPage} />
            <AdminRoute path="/admin/users" component={AdminUsersPage} />
            <AdminRoute path="/admin/lessons" component={AdminLessonsPage} />
            <AdminRoute path="/admin/settings" component={AdminSettingsPage} />
            
            {/* Protected parent/admin routes */}
            <ProtectedRoute path="/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/learners" component={LearnersPage} />
            <ProtectedRoute path="/add-learner" component={AddLearnerPage} />
            <ProtectedRoute path="/change-learner-subjects/:id" component={ChangeLearnerSubjectsPage} />
            <ProtectedRoute path="/reports" component={ReportsPage} />
            <ProtectedRoute path="/database-sync" component={DatabaseSyncPage} />
            
            {/* Learner specific routes */}
            <LearnerRoute path="/learner" component={LearnerHome} />
            <LearnerRoute path="/lessons" component={LessonsPage} />
            <LearnerRoute path="/lesson" component={ActiveLessonPage} />
            <LearnerRoute path="/quiz/:lessonId" component={QuizPage} />
            <LearnerRoute path="/progress" component={ProgressPage} />
            
            {/* Root path - will show welcome page but with auth-aware handling */}
            <Route path="/">
              {() => {
                console.log("App.tsx: Rendering root path (/), showing welcome page");
                return <WelcomePage />;
              }}
            </Route>
            
            {/* Catch-all for 404 */}
            <Route>
              <div className="not-found">
                <h1>404: Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </Route>
          </Switch>
        </AppLayout>
        <Toaster />
      </ModeProvider>
    </div>
  );
}
