import React from 'react';
import { Switch, Route } from 'wouter';
import AuthPage from './pages/auth-page';
import HomePage from './pages/home-page';
import { ProtectedRoute } from './lib/protected-route';
import { Toaster } from './components/ui/toast';

export default function App() {
  return (
    <div className="app-container">
      <Switch>
        <Route path="/auth" component={AuthPage} />
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
