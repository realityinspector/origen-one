import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import type { User as SelectUser, InsertUser } from "../../../shared/schema";
import { 
  getQueryFn, 
  apiRequest, 
  queryClient, 
  setAuthToken, 
  initializeAuthFromStorage, 
  axiosInstance,
  queryPersister 
} from "../lib/queryClient";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "PARENT" | "LEARNER";
  parentId?: number;
  gradeLevel?: number;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  
  // CRITICAL FIX: Initialize auth with stricter validation and safer defaults
  useEffect(() => {
    // Set initial state as NOT authenticated while we check
    queryClient.setQueryData(["/api/user"], null);
    
    const init = async () => {
      try {
        console.log('Starting FRESH auth initialization with stricter validation');
        
        // First, clear any potentially corrupted state to start fresh
        try {
          await setAuthToken(null);
          await AsyncStorage.removeItem('AUTH_TOKEN');
          await queryPersister.removeClient();
          
          // Remove any other cached data that might cause persistence issues
          await AsyncStorage.removeItem('LEARNER_APP_CACHE');
          
          console.log('Cleared all potential auth data for fresh start');
        } catch (clearError) {
          console.error('Initial state cleanup error (continuing):', clearError);
        }
        
        // Now explicitly check if we have a token in storage and validate it
        const token = await AsyncStorage.getItem('AUTH_TOKEN');
        const hasValidToken = !!token && token.length > 20;
        
        console.log('Strict token check:', { 
          hasToken: !!token, 
          tokenLength: token ? token.length : 0,
          seemsValid: hasValidToken
        });
        
        // Only proceed with validation if we have what appears to be a valid token
        if (hasValidToken) {
          try {
            console.log('Setting auth token for validation attempt');
            await setAuthToken(token); // Set the token in headers
            
            // Make a synchronous validation request that blocks initialization
            console.log('Making validation request to /api/user');
            const response = await axiosInstance.get('/api/user', { 
              timeout: 5000,  // Short timeout 
              validateStatus: (status) => status === 200 // Only 200 is valid
            });
            
            // Verify that the response contains a proper user object
            const userData = response.data;
            if (userData && userData.id && userData.role) {
              console.log('Valid user authentication confirmed:', { 
                userId: userData.id,
                role: userData.role,
                name: userData.name
              });
              
              // User is confirmed valid, update cache
              queryClient.setQueryData(["/api/user"], userData);
            } else {
              console.error('User validation failed: Invalid user data in response', userData);
              // Clear everything since data is invalid
              await setAuthToken(null);
              await AsyncStorage.removeItem('AUTH_TOKEN');
              await queryPersister.removeClient();
              queryClient.setQueryData(["/api/user"], null);
            }
          } catch (validationError) {
            console.error('Token validation request failed, clearing all auth state:', validationError);
            // Clear everything
            await setAuthToken(null);
            await AsyncStorage.removeItem('AUTH_TOKEN');
            await queryPersister.removeClient();
            queryClient.setQueryData(["/api/user"], null);
          }
        } else {
          console.log('No valid token found, user is not authenticated');
          queryClient.setQueryData(["/api/user"], null);
        }
        
        // Initialization complete
        setInitializationComplete(true);
      } catch (error) {
        console.error('Major error during auth initialization:', error);
        setInitError(error instanceof Error ? error : new Error('Unknown error during auth initialization'));
        
        // Clear all state on major error
        try {
          await setAuthToken(null);
          await AsyncStorage.removeItem('AUTH_TOKEN');
          await queryPersister.removeClient();
          await AsyncStorage.removeItem('LEARNER_APP_CACHE');
          queryClient.setQueryData(["/api/user"], null);
        } catch (clearError) {
          console.error('Failed to clear auth state after error:', clearError);
        }
        
        setInitializationComplete(true);
      }
    };
    
    // Run initialization
    init();
  }, []);
  
  // Set up the user query with strict type checking and specific behaviors
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // Critical settings to prevent false authentication
    initialData: null, // Always start with null (not authenticated)
    staleTime: 0, // Always validate freshness
    // Only consider query successful when the data is complete
    structuralSharing: (oldData, newData) => {
      // If new data doesn't look like a valid user, return null
      if (!newData || typeof newData !== 'object' || !('id' in newData) || !('role' in newData)) {
        console.log('Auth query: Received invalid user data, treating as unauthenticated');
        return null;
      }
      return newData as SelectUser;
    }
  });

  interface LoginResponse {
    user: SelectUser;
    userData?: SelectUser; // Fallback for compatibility
    token: string;
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log('Sending login request to server:', {
          url: '/api/login',
          username: credentials.username,
          passwordLength: credentials.password ? credentials.password.length : 0
        });
        
        // Always use the current domain for auth requests - critical for both dev and production
        const baseUrl = window.location.origin;
        console.log('Using current domain for auth:', baseUrl);
        
        // Create a fetch request directly to handle all environments consistently
        const response = await fetch(`${baseUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          throw new Error(`Login failed with status: ${response.status} ${response.statusText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Validate response data
        if (!data) {
          throw new Error('No response data received from login request');
        }
        
        // Log detailed response info
        console.log('Login response received:', {
          status: response.status,
          hasData: !!data,
          dataType: typeof data,
          responseKeys: data ? Object.keys(data) : [],
          hasToken: data?.token ? 'Yes' : 'No',
          tokenLength: data?.token ? data.token.length : 0,
          hasUser: data?.user ? 'Yes (object)' : (typeof data === 'object' ? 'Yes (raw)' : 'No'),
        });
        
        // We need to handle both the exact format expected (token + user) and also the case
        // where just the user object itself is returned
        let processedResponse: LoginResponse;
        
        if (data.token && (data.user || data.userData)) {
          // Standard expected response format
          processedResponse = data as LoginResponse;
          console.log('Login response is in standard format with token + user');
        } else if (typeof data === 'object' && 'id' in data && 'role' in data) {
          // The server returned just the user object directly
          console.log('Login response contains just the user object, creating standard format');
          processedResponse = {
            token: response.headers?.get('authorization')?.replace('Bearer ', '') || '',
            user: data,
            userData: data
          };
        } else {
          // Unexpected format
          console.error('Unexpected login response format:', data);
          throw new Error('Unexpected response format from login endpoint');
        }
        
        return processedResponse;
      } catch (err: any) {
        // Create a more descriptive error object
        const errorInfo = {
          message: err.message,
          responseData: err.response?.data,
          status: err.response?.status,
          isTransient: err.response?.data?.isTransient === true
        };
        
        console.error('Login request failed:', errorInfo);
        
        // Customize the error message based on response status
        if (err.response?.status === 503) {
          // Database connection error
          errorInfo.message = 'The server database is temporarily unavailable. Please try again in a few moments.';
        } else if (err.response?.status === 401) {
          // Invalid credentials
          errorInfo.message = 'Invalid username or password. Please check your credentials and try again.';
        } else if (err.response?.status === 500) {
          // Server error
          errorInfo.message = 'The server encountered an internal error. Please try again.';
        } else if (!navigator.onLine) {
          // No internet connection
          errorInfo.message = 'Please check your internet connection and try again.';
        }
        
        // Add better error information
        const enhancedError = new Error(errorInfo.message);
        (enhancedError as any).details = errorInfo;
        
        throw enhancedError;
      }
    },
    onSuccess: async (response: LoginResponse) => {
      try {
        // Store the token in AsyncStorage and set it in axios headers
        console.log('Processing login success:', {
          hasToken: !!response.token,
          tokenLength: response.token ? response.token.length : 0,
          hasUser: !!response.user,
          hasUserData: !!response.userData,
          userFields: response.user ? Object.keys(response.user) : [],
          userDataFields: response.userData ? Object.keys(response.userData) : [],
        });
        
        if (!response.token) {
          const detailedError = `No authentication token received. Response keys: ${Object.keys(response).join(', ')}`;
          console.error(detailedError, { response });
          throw new Error(detailedError);
        }
        
        await setAuthToken(response.token);
        console.log('Auth token set successfully:', { tokenLength: response.token.length });
        
        // Handle different response formats - some endpoints might return userData vs user
        const userData = response.user || response.userData;
        if (!userData) {
          const detailedError = `No user data received. Response keys: ${Object.keys(response).join(', ')}`;
          console.error(detailedError, { response });
          throw new Error(detailedError);
        }
        
        console.log('User data received:', {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          fields: Object.keys(userData)
        });
        
        // Update the user data in the query cache
        queryClient.setQueryData(["/api/user"], userData);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData?.name || 'user'}!`,
        });
      } catch (err: any) {
        console.error('Error in login success handler:', err);
        toast({
          title: "Login partially failed",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      toast({
        title: "Login failed",
        description: `Error: ${error.message}\nCheck console for details`,
        variant: "destructive",
      });
    },
  });

  interface RegisterResponse {
    user: SelectUser;
    userData?: SelectUser; // Fallback for compatibility
    token: string;
    wasPromotedToAdmin?: boolean;
  }

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        console.log('Sending registration request to server:', {
          url: '/api/register',
          userData: { ...userData, password: '***REDACTED***' } // Log without password
        });
        
        // Always use the current domain for auth requests - critical for both dev and production
        const baseUrl = window.location.origin;
        console.log('Using current domain for registration:', baseUrl);
        
        // Create a fetch request directly to handle all environments consistently
        const response = await fetch(`${baseUrl}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include' // Important for cookies
        });
        
        if (!response.ok) {
          throw new Error(`Registration failed with status: ${response.status} ${response.statusText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        console.log('Registration response received:', {
          status: response.status,
          hasData: !!data,
          dataType: typeof data,
          responseKeys: data ? Object.keys(data) : [],
          hasToken: data?.token ? 'Yes' : 'No',
          tokenLength: data?.token ? data.token.length : 0,
          hasUser: data?.user ? 'Yes (object)' : (typeof data === 'object' ? 'Yes (raw)' : 'No'),
        });
        
        // We need to handle both the exact format expected (token + user) and also the case
        // where just the user object itself is returned
        let processedResponse: RegisterResponse;
        
        if (data.token && (data.user || data.userData)) {
          // Standard expected response format
          processedResponse = data as RegisterResponse;
          console.log('Registration response is in standard format with token + user');
        } else if (typeof data === 'object' && 'id' in data && 'role' in data) {
          // The server returned just the user object directly
          console.log('Registration response contains just the user object, creating standard format');
          processedResponse = {
            token: response.headers?.get('authorization')?.replace('Bearer ', '') || '',
            user: data,
            userData: data
          };
        } else {
          // Unexpected format
          console.error('Unexpected registration response format:', data);
          throw new Error('Unexpected response format from registration endpoint');
        }
        
        return processedResponse;
      } catch (err: any) {
        console.error('Registration request failed:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        throw err;
      }
    },
    onSuccess: async (response: any) => {
      try {
        console.log('Processing registration success - raw response:', {
          responseType: typeof response,
          isArray: Array.isArray(response),
          objectKeys: typeof response === 'object' ? Object.keys(response) : 'not an object'
        });

        let token: string | undefined = undefined;
        let extractedUserData: any = undefined;

        // Handle different response formats - first extract token
        if (typeof response === 'string') {
          // Case 1: The response is just the JWT token as a string
          console.log('Response is a string, assuming it is the JWT token');
          token = response;
        } else if (Array.isArray(response)) {
          // Case 2: Response is an array (possibly binary data or incorrect format)
          console.log('Response is an array of length:', response.length);
          // If it's an array, check if any element looks like a JWT token
          for (let i = 0; i < response.length; i++) {
            const item = response[i];
            if (typeof item === 'string' && item.length > 50 && item.includes('.')) {
              token = item;
              console.log(`Found token in array at position ${i}, length:`, token.length);
              break;
            }
          }
        } else if (typeof response === 'object' && response !== null) {
          // Case 3: Standard object response
          console.log('Processing object response with keys:', Object.keys(response));
          
          // Look for standard token property
          if (response.token && typeof response.token === 'string') {
            token = response.token;
            console.log('Found token in response.token');
            // Also look for user data
            if (response.user) extractedUserData = response.user;
            else if (response.userData) extractedUserData = response.userData;
          } 
          // Special case: maybe the token is buried in another property
          else if (response.data && response.data.token && typeof response.data.token === 'string') {
            token = response.data.token;
            console.log('Found token in response.data.token');
            // Also look for user data
            if (response.data.user) extractedUserData = response.data.user;
            else if (response.data.userData) extractedUserData = response.data.userData;
          }
          // Last resort - search all properties for something that looks like a JWT token
          else {
            // Look through all properties for a string that looks like a JWT token
            for (const key of Object.keys(response)) {
              const val = response[key];
              if (typeof val === 'string' && val.length > 50 && val.includes('.')) {
                token = val;
                console.log(`Found token in property '${key}', length:`, token.length);
                break;
              }
            }
          }
        }
        
        // If we still don't have a token, this is a problem
        if (!token) {
          const detailedError = `No authentication token found in response. Response format: ${typeof response}`;
          console.error(detailedError, { response });
          throw new Error(detailedError);
        }
        
        // Store the token
        console.log('Token extracted successfully, length:', token.length);
        await setAuthToken(token);
        console.log('Auth token set successfully in storage and headers');
        
        // Now try to get user data if we don't already have it
        if (!extractedUserData) {
          try {
            console.log('Token available but no user data, fetching from /api/user');
            const userResponse = await axiosInstance.get('/api/user');
            if (userResponse.data) {
              extractedUserData = userResponse.data;
              console.log('Successfully fetched user data from API');
            }
          } catch (userFetchError) {
            console.error('Failed to fetch user data after auth:', userFetchError);
            // Continue anyway since we at least have a token
          }
        }
        
        // If we still don't have user data, we can continue with just the token
        if (!extractedUserData) {
          console.warn('No user data available after attempting to fetch it');
          toast({
            title: "Registration successful",
            description: "Your account was created. Loading your dashboard...",
          });
          
          // Redirect to dashboard and let the app fetch user data there
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
          return;
        }
        
        // If we've reached here, we have both token and user data
        console.log('User data received:', {
          id: extractedUserData.id,
          name: extractedUserData.name,
          role: extractedUserData.role,
          fields: Object.keys(extractedUserData)
        });
        
        // Update the user data in the query cache
        queryClient.setQueryData(["/api/user"], extractedUserData);
        
        // Show appropriate toast message
        if (response.wasPromotedToAdmin) {
          toast({
            title: "You are the first user!",
            description: `Welcome, ${extractedUserData?.name || 'user'}! As the first user, you've been automatically granted administrator privileges.`,
          });
        } else {
          toast({
            title: "Registration successful",
            description: `Welcome, ${extractedUserData?.name || 'user'}!`,
          });
        }
      } catch (err: any) {
        console.error('Error in registration success handler:', err);
        toast({
          title: "Registration partially failed",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error('Registration mutation error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      toast({
        title: "Registration failed",
        description: `Error: ${error.message}\nCheck console for details`,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Starting logout process...');
        
        // Always use the current domain for auth requests
        const baseUrl = window.location.origin;
        console.log('Using current domain for logout:', baseUrl);
        
        // First try to call the server logout endpoint with fetch for maximum reliability
        try {
          const response = await fetch(`${baseUrl}/api/logout`, {
            method: 'POST',
            credentials: 'include', // Important for cookies
          });
          
          console.log('Server logout response:', { 
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          });
        } catch (serverLogoutError) {
          console.warn('Server logout failed, but continuing with client-side logout:', serverLogoutError);
          // We still continue with client-side logout even if server logout fails
        }
      } catch (error) {
        console.warn('Initial logout process failed, but continuing with client-side cleanup:', error);
        // We still continue with client-side logout even if there's an error
      }
      
      // Thorough cleanup of all authentication state
      try {
        console.log('Clearing all auth tokens and persisted data...');
        // Clear auth token from axios headers
        await setAuthToken(null);
        
        // Clear persisted token
        await AsyncStorage.removeItem('AUTH_TOKEN');
        
        // Clear persisted query cache
        await queryPersister.removeClient();
        
        // Clear any other auth-related storage items
        await AsyncStorage.removeItem('LEARNER_APP_CACHE');
        
        console.log('All auth data cleared successfully');
      } catch (cleanupError) {
        console.error('Error during auth cleanup:', cleanupError);
        throw cleanupError; // Re-throw to trigger the error handler
      }
    },
    onSuccess: async () => {
      // Immediately clear in-memory user data
      queryClient.setQueryData(["/api/user"], null);
      
      // Clear all queries to prevent any auth-dependent data from persisting
      queryClient.clear();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      console.log('Logout complete, user state cleared');
      
      // Force page reload to ensure clean state if needed
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
      
      // Even on error, try to clear client-side state
      queryClient.setQueryData(["/api/user"], null);
      
      // Try to force reload to auth page as last resort
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    },
  });

  // If there was an initialization error, show a fallback UI
  if (initializationComplete && initError) {
    console.error('Auth initialization error, showing fallback UI', initError);
    return (
      <div style={{ 
        padding: '20px', 
        margin: '20px', 
        backgroundColor: '#f8d7da', 
        borderRadius: '5px',
        color: '#721c24'
      }}>
        <h2>Authentication Error</h2>
        <p>There was a problem initializing the authentication system.</p>
        <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', cursor: 'pointer' }}>
          <summary>Error Details</summary>
          <p>{initError.toString()}</p>
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
  
  // If still initializing, show a loading indicator
  if (!initializationComplete) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginTop: '40px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #6200EE', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#333' }}>Initializing authentication...</p>
      </div>
    );
  }
  
  // Normal rendering when initialization is complete and successful
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
