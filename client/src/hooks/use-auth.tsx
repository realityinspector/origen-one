import React, { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import type { User as SelectUser, InsertUser } from "../../../shared/schema";
import { getQueryFn, apiRequest, queryClient, setAuthToken, initializeAuthFromStorage } from "../lib/queryClient";
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
  
  // Initialize auth from storage when the app loads
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuthFromStorage();
        console.log('Auth initialized from storage');
        // After initializing the token, the user query below will automatically run
      } catch (error) {
        console.error('Failed to initialize auth from storage:', error);
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
        
        const res = await apiRequest("POST", "/api/login", credentials);
        
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
        console.error('Login request failed:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        throw err;
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
        
        const res = await apiRequest("POST", "/api/register", userData);
        
        console.log('Registration response received:', {
          status: res.status,
          hasData: !!res.data,
          dataType: typeof res.data,
          responseKeys: res.data ? Object.keys(res.data) : [],
          hasToken: res.data?.token ? 'Yes' : 'No',
          tokenLength: res.data?.token ? res.data.token.length : 0,
          hasUser: res.data?.user ? 'Yes' : 'No',
          hasUserData: res.data?.userData ? 'Yes' : 'No',
        });
        
        return res.data as RegisterResponse;
      } catch (err: any) {
        console.error('Registration request failed:', {
          error: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        throw err;
      }
    },
    onSuccess: async (response: RegisterResponse) => {
      try {
        // Store the token in AsyncStorage and set it in axios headers
        console.log('Processing registration success:', {
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
        
        // Check if user was automatically promoted to admin
        if (response.wasPromotedToAdmin) {
          toast({
            title: "You are the first user!",
            description: `Welcome, ${userData?.name || 'user'}! As the first user, you've been automatically granted administrator privileges.`,
          });
        } else {
          toast({
            title: "Registration successful",
            description: `Welcome, ${userData?.name || 'user'}!`,
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
