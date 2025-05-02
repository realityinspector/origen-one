import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';

export type UserMode = 'LEARNER' | 'GROWN_UP';

interface ModeContextType {
  mode: UserMode;
  toggleMode: () => void;
  isLearnerMode: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Add safer navigation function
  const safeNavigate = (path: string) => {
    try {
      console.log('Safe navigating to:', path);
      setLocation(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct location change if navigation fails
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    }
  };
  
  // Default to the user's actual role, or to stored preference
  const initialMode = (): UserMode => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      // Get preference from localStorage
      const storedPreference = window.localStorage.getItem('preferredMode');
      
      if (storedPreference === 'LEARNER' || storedPreference === 'GROWN_UP') {
        return storedPreference as UserMode;
      }
    }
    
    // Default to the user's role
    if (user?.role === 'LEARNER') {
      return 'LEARNER';
    }
    
    return 'GROWN_UP';
  };
  
  const [mode, setMode] = useState<UserMode>(initialMode());
  
  // Update mode when user changes
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Don't change the mode if the user has a preference already set
      const storedPreference = window.localStorage.getItem('preferredMode');
      if (!storedPreference) {
        // Default to the actual role
        if (user.role === 'LEARNER') {
          setMode('LEARNER');
        } else {
          setMode('GROWN_UP');
        }
      }
    }
  }, [user]);
  
  // Determine if user can toggle modes
  const canToggleMode = (): boolean => {
    // For development, allow toggling even without a user
    const isDev = true; // process.env.NODE_ENV === 'development';
    if (isDev) return true;
    
    if (!user) return false;
    
    // Allow all roles to toggle in this version
    return true;
  };
  
  const toggleMode = () => {
    // Add debug messages
    console.log('Toggle mode called', { mode, canToggle: canToggleMode() });
    
    if (!canToggleMode()) {
      console.log('Cannot toggle mode');
      return;
    }
    
    const newMode = mode === 'LEARNER' ? 'GROWN_UP' : 'LEARNER';
    console.log('Setting new mode', { newMode });
    
    // Store the preference if in browser
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredMode', newMode);
      console.log('Stored mode in localStorage');
    }
    
    setMode(newMode);
    
    // Navigate to the appropriate dashboard
    if (newMode === 'LEARNER') {
      console.log('Navigating to learner view');
      safeNavigate('/learner');
    } else {
      console.log('Navigating to dashboard');
      safeNavigate('/dashboard');
    }
  };
  
  return (
    <ModeContext.Provider value={{ 
      mode, 
      toggleMode,
      isLearnerMode: mode === 'LEARNER'
    }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};
