import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Redirect, Route } from 'wouter';

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();

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

  // If not logged in, redirect to auth
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If logged in but not admin, redirect to dashboard
  if (user.role !== 'ADMIN') {
    return (
      <Route path={path}>
        <Redirect to="/dashboard" />
      </Route>
    );
  }

  // User is admin, render the component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
