import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import type { User as SelectUser, InsertUser } from "../../../shared/schema";
import { getQueryFn, apiRequest, queryClient, setAuthToken, initializeAuthFromStorage, axiosInstance } from "../lib/queryClient";
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
  
  // Initialize auth from storage when the app loads
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuthFromStorage();
        console.log('Auth initialized from storage');
        // After initializing the token, the user query below will automatically run
        setInitializationComplete(true);
      } catch (error) {
        console.error('Failed to initialize auth from storage:', error);
        setInitError(error instanceof Error ? error : new Error('Unknown error during auth initialization'));
        setInitializationComplete(true); // Still mark as complete even on error
      }
    };
    init();
  }, []);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
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
        
        // Use absolute URL to ensure correct endpoint
        const baseUrl = window.location.origin;
        console.log('Using base URL for login:', baseUrl);
        
        const res = await axios.post(`${baseUrl}/api/login`, credentials, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Login response received:', {
          status: res.status,
          hasData: !!res.data,
          dataType: typeof res.data,
          responseKeys: res.data ? Object.keys(res.data) : [],
          hasToken: res.data?.token ? 'Yes' : 'No',
          tokenLength: res.data?.token ? res.data.token.length : 0,
          hasUser: res.data?.user ? 'Yes' : 'No',
          hasUserData: res.data?.userData ? 'Yes' : 'No',
        });
        
        return res.data as LoginResponse;
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
        
        // Use a more direct axios request for registration to avoid any middleware issues
        // Make sure to use the absolute URL or relative URL correctly
        const baseUrl = window.location.origin;
        console.log('Using base URL for registration:', baseUrl);
        
        const directResponse = await axios.post(`${baseUrl}/api/register`, userData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Registration direct response received:', {
          status: directResponse.status,
          hasData: !!directResponse.data,
          dataType: typeof directResponse.data,
          responseKeys: directResponse.data ? Object.keys(directResponse.data) : [],
          hasToken: directResponse.data?.token ? 'Yes' : 'No',
          tokenLength: directResponse.data?.token ? directResponse.data.token.length : 0,
          hasUser: directResponse.data?.user ? 'Yes' : 'No',
          hasUserData: directResponse.data?.userData ? 'Yes' : 'No',
        });
        
        // Make sure we have a token in the response, or throw an error
        if (!directResponse.data?.token) {
          console.error('No token in registration response:', directResponse.data);
          throw new Error('No authentication token received in registration response');
        }
        
        return directResponse.data as RegisterResponse;
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: async () => {
      // Clear the auth token
      await setAuthToken(null);
      
      // Clear the user data from the query cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
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
