import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { AuthProvider } from './hooks/use-auth';
import { ToastProvider } from './hooks/use-toast';
import { queryClient, queryPersister } from './lib/queryClient';

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
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
