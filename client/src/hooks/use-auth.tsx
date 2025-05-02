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
      await initializeAuthFromStorage();
      // After initializing the token, the user query below will automatically run
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
      const res = await apiRequest("POST", "/api/login", credentials);
      return res.data as LoginResponse;
    },
    onSuccess: async (response: LoginResponse) => {
      // Store the token in AsyncStorage and set it in axios headers
      if (!response.token) {
        throw new Error("No authentication token received");
      }
      
      await setAuthToken(response.token);
      
      // Handle different response formats - some endpoints might return userData vs user
      const userData = response.user || response.userData;
      if (!userData) {
        throw new Error("No user data received");
      }
      
      // Update the user data in the query cache
      queryClient.setQueryData(["/api/user"], userData);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData?.name || 'user'}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
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
      const res = await apiRequest("POST", "/api/register", userData);
      return res.data as RegisterResponse;
    },
    onSuccess: async (response: RegisterResponse) => {
      // Store the token in AsyncStorage and set it in axios headers
      if (!response.token) {
        throw new Error("No authentication token received");
      }
      
      await setAuthToken(response.token);
      
      // Handle different response formats - some endpoints might return userData vs user
      const userData = response.user || response.userData;
      if (!userData) {
        throw new Error("No user data received");
      }
      
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
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
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
