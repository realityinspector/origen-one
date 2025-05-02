import { QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Create a custom persister since the package exports have changed
export const queryPersister = {
  persistClient: async (client: any) => {
    await AsyncStorage.setItem(
      'LEARNER_APP_CACHE',
      JSON.stringify({
        timestamp: Date.now(),
        buster: 'v1',
        clientState: client
      })
    );
  },
  restoreClient: async () => {
    const cacheString = await AsyncStorage.getItem('LEARNER_APP_CACHE');
    if (!cacheString) return;
    
    try {
      const cache = JSON.parse(cacheString);
      return cache.clientState;
    } catch {}
    
    return undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem('LEARNER_APP_CACHE');
  }
};

// In Replit environment, the API is served from the same origin
const API_URL = '';  // Empty string means use the current origin

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      networkMode: 'offlineFirst',
    },
  },
});

// We're using our custom persister defined above for offline support

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests and store it
export const setAuthToken = async (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await AsyncStorage.setItem('AUTH_TOKEN', token);
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem('AUTH_TOKEN');
  }
};

// Initialize token from storage (call this when app starts)
export const initializeAuthFromStorage = async () => {
  const token = await AsyncStorage.getItem('AUTH_TOKEN');
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  }
  return false;
};

type QueryFnOptions = {
  on401?: "throw" | "returnNull";
};

export const getQueryFn = (options: QueryFnOptions = { on401: "throw" }) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const endpoint = queryKey[0];
    
    try {
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 && options.on401 === "returnNull") {
        return null;
      }
      throw new Error(error.response?.data?.error || "An error occurred");
    }
  };
};

// Add error logging function
const logAuthError = (method: string, url: string, error: any) => {
  console.error(`Auth ${method} Error for ${url}:`, error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Status code:', error.response.status);
  }
};

export const apiRequest = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any
) => {
  try {
    // Log auth requests for debugging
    if ((url.includes('/login') || url.includes('/register')) && method === 'POST') {
      console.log(`Sending ${method} to ${url}`, { username: data?.username });
    }
    
    const response = await axiosInstance({
      method,
      url,
      data,
    });
    
    // Log auth response structures for debugging
    if ((url.includes('/login') || url.includes('/register')) && method === 'POST') {
      console.log(`Success response for ${url}:`, {
        hasToken: !!response?.data?.token,
        hasUser: !!response?.data?.user,
        hasUserData: !!response?.data?.userData,
        userFieldsIfPresent: response?.data?.user ? Object.keys(response.data.user) : null
      });
    }
    
    return response;
  } catch (error: any) {
    if ((url.includes('/login') || url.includes('/register')) && method === 'POST') {
      logAuthError(method, url, error);
    }
    
    if (error.response) {
      throw new Error(error.response.data?.error || "Request failed");
    }
    throw error;
  }
};
