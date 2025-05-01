import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Redirect, Route } from 'wouter';
import { useMode } from '../context/ModeContext';

export function LearnerRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();
  const { isLearnerMode } = useMode();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </Route>
    );
  }

  // Not logged in, redirect to auth
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Not in learner mode, redirect to dashboard
  if (!isLearnerMode) {
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      {(params) => <Component params={params} />}
    </Route>
  );
}
