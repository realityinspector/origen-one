import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { AuthProvider } from './hooks/use-auth';
import { ToastProvider } from './hooks/use-toast';
import { queryClient, queryPersister } from './lib/queryClient';
import { ModeProvider } from './context/ModeContext';

// Import global CSS for hover effects and animations
import './styles/global.css';

// Set up persistence for offline support
persistQueryClient({
  queryClient,
  persister: queryPersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateQuery: query => {
      // Only persist specific queries that are needed offline
      return [
        '/api/lessons/active',
        '/api/learner-profile',
        '/api/achievements'
      ].some(path => query.queryKey[0].includes(path));
    },
  },
});

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to the console
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          backgroundColor: '#f8d7da', 
          borderRadius: '5px',
          color: '#721c24'
        }}>
          <h2>Something went wrong.</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', cursor: 'pointer' }}>
            <summary>Error Details</summary>
            <p>{this.state.error?.toString()}</p>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '10px', 
              padding: '8px 16px', 
              backgroundColor: '#6200EE', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer' 
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Root() {
  useEffect(() => {
    // Handle online/offline status changes
    const handleOnline = () => {
      queryClient.resumePausedMutations();
      queryClient.invalidateQueries();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <ModeProvider>
                <App />
              </ModeProvider>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
