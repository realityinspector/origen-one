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
    queryFn: async () => {
      if (!user) return Promise.resolve([]);
      
      try {
        let response;
        
        if (user.role === 'ADMIN') {
          response = await apiRequest('GET', `/api/learners?parentId=${user.id}`);
        } else if (user.role === 'PARENT') {
          response = await apiRequest('GET', "/api/learners");
        } else {
          return [];
        }
        
        // Check if we have valid data
        if (!response) {
          console.error('No response received from API');
          return [];
        }
        
        // Handle both direct data and data wrapped in a data property
        const learnerData = response.data ? response.data : response;
        
        if (!Array.isArray(learnerData)) {
          console.error('Invalid learners data received, expected array:', response);
          return [];
        }
        
        return learnerData;
      } catch (error) {
        console.error('Error fetching learners:', error);
        return [];
      }
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
        } else if (availableLearners && availableLearners.length > 0) {
          // Default to first learner if stored one not found
          const firstLearner = availableLearners[0];
          if (firstLearner && typeof firstLearner.id !== 'undefined') {
            setSelectedLearner(firstLearner);
            window.localStorage.setItem('selectedLearnerId', String(firstLearner.id));
          } else {
            console.error('Invalid learner object found:', firstLearner);
          }
        }
      } else if (availableLearners && availableLearners.length > 0) {
        // Default to first learner if none stored
        const firstLearner = availableLearners[0];
        if (firstLearner && typeof firstLearner.id !== 'undefined') {
          setSelectedLearner(firstLearner);
          window.localStorage.setItem('selectedLearnerId', String(firstLearner.id));
        } else {
          console.error('Invalid learner object found:', firstLearner);
        }
      }
    }
  }, [availableLearners]);
  
  // Function to select a learner with added safety checks
  const selectLearner = (learner: LearnerUser) => {
    // Validate learner object
    if (!learner || typeof learner !== 'object') {
      console.error('Invalid learner object provided to selectLearner:', learner);
      return;
    }

    console.log('Selecting learner:', learner.name, learner.id);

    // Update selectedLearner state
    setSelectedLearner(learner);

    // Save to localStorage
    if (typeof window !== 'undefined' && learner.id !== undefined) {
      window.localStorage.setItem('selectedLearnerId', String(learner.id));
      window.localStorage.setItem('preferredMode', 'LEARNER');
      console.log('Saved learner ID and mode to localStorage:', learner.id);
    }

    // Switch to LEARNER mode using state updater callback to ensure immediate update
    setMode(prevMode => {
      console.log('Mode update: switching to LEARNER from', prevMode);
      // Use requestAnimationFrame to navigate after React finishes state updates
      requestAnimationFrame(() => {
        console.log('Navigating to /learner after mode switch');
        safeNavigate('/learner');
      });
      return 'LEARNER';
    });
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
    console.log('Toggle mode called', { currentMode: mode, canToggle: canToggleMode() });

    if (!canToggleMode()) {
      console.log('Cannot toggle mode - conditions not met');
      return;
    }

    const newMode = mode === 'LEARNER' ? 'GROWN_UP' : 'LEARNER';

    // For parents and admins switching to learner mode, ensure a learner is selected
    if (newMode === 'LEARNER' && (user?.role === 'PARENT' || user?.role === 'ADMIN')) {
      if (!selectedLearner && availableLearners && availableLearners.length > 0) {
        // Auto-select the first learner if none is selected
        const firstLearner = availableLearners[0];
        if (firstLearner && typeof firstLearner.id !== 'undefined') {
          console.log('Auto-selecting first learner for mode switch:', firstLearner.name);
          selectLearner(firstLearner);
          return; // selectLearner handles mode switch and navigation
        } else {
          console.error('Cannot auto-select learner: Invalid first learner object');
          return;
        }
      } else if (!selectedLearner && (!availableLearners || availableLearners.length === 0)) {
        console.log('No learners available - directing to learners management page');
        safeNavigate('/learners');
        return;
      }
    }

    console.log('Toggling mode:', mode, '->', newMode);

    // Store the preference
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredMode', newMode);
    }

    // Update mode state and navigate after state is committed
    setMode(prevMode => {
      console.log('Mode state updated:', prevMode, '->', newMode);

      // Use requestAnimationFrame to ensure navigation happens after React state updates
      requestAnimationFrame(() => {
        const targetPath = newMode === 'LEARNER' ? '/learner' : '/dashboard';
        console.log('Navigating to:', targetPath);
        safeNavigate(targetPath);
      });

      return newMode;
    });
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
