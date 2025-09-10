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
    
    setSelectedLearner(learner);
    
    if (typeof window !== 'undefined' && learner.id !== undefined) {
      // Use String() which safely handles undefined/null better than toString()
      window.localStorage.setItem('selectedLearnerId', String(learner.id));
      console.log('Saved learner ID to localStorage:', learner.id);
    } else {
      console.warn('Could not save learner ID to localStorage - invalid ID or not in browser');
    }
    
    // When a learner is selected, automatically switch to LEARNER mode
    // This ensures that the learner switcher always puts users in learner mode
    if (mode !== 'LEARNER') {
      console.log('Switching to LEARNER mode because a learner was selected');
      setMode('LEARNER');
    }
    
    // Always persist LEARNER mode preference when selecting a learner
    // This ensures persistence across reloads regardless of current mode
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferredMode', 'LEARNER');
    }
    
    // Use a small delay to ensure mode state is committed before navigation
    // This prevents race conditions with route guards that depend on isLearnerMode
    setTimeout(() => {
      safeNavigate('/learner');
    }, 0);
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
      if (!selectedLearner && availableLearners && availableLearners.length > 0) {
        // Auto-select the first learner if none is selected
        const firstLearner = availableLearners[0];
        if (firstLearner && typeof firstLearner.id !== 'undefined') {
          selectLearner(firstLearner);
        } else {
          console.error('Cannot auto-select learner: Invalid first learner object', firstLearner);
          return;
        }
      } else if (!selectedLearner && (!availableLearners || availableLearners.length === 0)) {
        console.log('Cannot switch to learner mode: no learners available');
        // Continue anyway to allow navigation to /learners page where they can add learners
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
      // If no learners are available, direct to the learners management page
      if (!selectedLearner && (!availableLearners || availableLearners.length === 0)) {
        console.log('No learners available, navigating to learners page');
        safeNavigate('/learners');
      } else {
        console.log('Navigating to learner view');
        safeNavigate('/learner');
      }
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
