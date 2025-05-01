import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'wouter';
import AuthPage from './pages/auth-page';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import AdminPage from './pages/admin-page';
import WelcomePage from './pages/welcome-page';
import { ProtectedRoute } from './lib/protected-route';
import { AdminRoute } from './lib/admin-route';
import { Toaster } from './components/ui/toast';
import { PlausibleAnalytics } from './components/PlausibleAnalytics';
import { useAuth } from './hooks/use-auth';

// Home redirect component to handle auth status
const HomeRedirect = () => {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Only redirect if we're on the homepage
  if (location !== '/') return null;
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (user) {
    return <Redirect to="/dashboard" />;
  } else {
    return <Redirect to="/welcome" />;
  }
};

export default function App() {
  return (
    <div className="app-container">
      <PlausibleAnalytics 
        domain="origen-ai-tutor.org" 
        enabled={process.env.NODE_ENV === 'production' && process.env.ENABLE_STATS !== 'false'} 
      />
      <HomeRedirect />
      <Switch>
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <AdminRoute path="/admin" component={AdminPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <Route>
          <div className="not-found">
            <h1>404: Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        </Route>
      </Switch>
      <Toaster />
    </div>
  );
}
