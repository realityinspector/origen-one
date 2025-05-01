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
  const [, navigate] = useLocation();
  
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
    if (!user) return false;
    
    // Only parent users can toggle to LEARNER mode
    if (user.role === 'PARENT') return true;
    
    // Learners can toggle to GROWN_UP if they have the parent permission
    // (We'd need to add this flag to the user profile schema)
    if (user.role === 'LEARNER') {
      return true; // For now, allow all learners to toggle
    }
    
    return false;
  };
  
  const toggleMode = () => {
    if (!canToggleMode()) return;
    
    const newMode = mode === 'LEARNER' ? 'GROWN_UP' : 'LEARNER';
    
    // Store the preference if in browser
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredMode', newMode);
    }
    
    setMode(newMode);
    
    // Navigate to the appropriate dashboard
    if (newMode === 'LEARNER') {
      navigate('/learner');
    } else {
      navigate('/dashboard');
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
