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

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
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

export const apiRequest = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any
) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
    });
    return response;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || "Request failed");
    }
    throw error;
  }
};
