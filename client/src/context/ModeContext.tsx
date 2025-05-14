import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

export type UserMode = 'LEARNER' | 'GROWN_UP';

interface LearnerUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ModeContextType {
  mode: UserMode;
  toggleMode: () => void;
  isLearnerMode: boolean;
  selectedLearner: LearnerUser | null;
  selectLearner: (learner: LearnerUser) => void;
  availableLearners: LearnerUser[];
  isLoadingLearners: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedLearner, setSelectedLearner] = useState<LearnerUser | null>(null);
  
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
  
  // Fetch available learners for the current user
  const {
    data: availableLearners = [],
    isLoading: isLoadingLearners,
  } = useQuery({
    queryKey: ["/api/learners", user?.id, user?.role],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      
      if (user.role === 'ADMIN') {
        return apiRequest('GET', `/api/learners?parentId=${user.id}`).then(res => res.data);
      } else if (user.role === 'PARENT') {
        return apiRequest('GET', "/api/learners").then(res => res.data);
      }
      
      return Promise.resolve([]);
    },
    enabled: (user?.role === 'PARENT' || user?.role === 'ADMIN') && !!user?.id,
  });
  
  // Select the learner from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined' && availableLearners?.length > 0) {
      const storedLearnerId = window.localStorage.getItem('selectedLearnerId');
      
      if (storedLearnerId) {
        const learnerId = parseInt(storedLearnerId, 10);
        const foundLearner = availableLearners.find(learner => learner.id === learnerId);
        
        if (foundLearner) {
          setSelectedLearner(foundLearner);
        } else if (availableLearners.length > 0) {
          // Default to first learner if stored one not found
          setSelectedLearner(availableLearners[0]);
          window.localStorage.setItem('selectedLearnerId', availableLearners[0].id.toString());
        }
      } else if (availableLearners.length > 0) {
        // Default to first learner if none stored
        setSelectedLearner(availableLearners[0]);
        window.localStorage.setItem('selectedLearnerId', availableLearners[0].id.toString());
      }
    }
  }, [availableLearners]);
  
  // Function to select a learner
  const selectLearner = (learner: LearnerUser) => {
    setSelectedLearner(learner);
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('selectedLearnerId', learner.id.toString());
    }
    
    // If in learner mode, refresh to show the selected learner's content
    if (mode === 'LEARNER') {
      safeNavigate('/learner');
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
    
    // Parents and admins can only toggle if they have at least one learner
    if ((user.role === 'PARENT' || user.role === 'ADMIN') && (!availableLearners || availableLearners.length === 0)) {
      return false;
    }
    
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
    
    // For parents and admins switching to learner mode, ensure a learner is selected
    if (mode === 'GROWN_UP' && (user?.role === 'PARENT' || user?.role === 'ADMIN')) {
      if (!selectedLearner && availableLearners?.length > 0) {
        // Auto-select the first learner if none is selected
        selectLearner(availableLearners[0]);
      } else if (!selectedLearner) {
        console.log('Cannot switch to learner mode: no learners available');
        return;
      }
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
      isLearnerMode: mode === 'LEARNER',
      selectedLearner,
      selectLearner,
      availableLearners: availableLearners || [],
      isLoadingLearners
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
