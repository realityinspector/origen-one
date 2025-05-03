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
  // Create a unique request ID for tracing this request through logs
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const isAuthRequest = (url.includes('/login') || url.includes('/register')) && method === 'POST';
  
  try {
    console.log(`[REQ:${requestId}] Starting ${method} request to ${url}`);
    
    // Log auth requests for debugging
    if (isAuthRequest) {
      console.log(`[REQ:${requestId}] Auth request details:`, { 
        username: data?.username,
        hasPassword: !!data?.password,
        passwordLength: data?.password ? data.password.length : 0,
        url,
        method
      });
    }
    
    // Add explicit headers to avoid potential content-type and parsing issues
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Request-ID': requestId
    };
    
    // Start the request with timeout and validation
    const response = await axiosInstance({
      method,
      url,
      data,
      headers,
      // Force response as JSON to prevent potential response type issues
      responseType: 'json',
      // Add timeout to prevent hanging requests
      timeout: 30000, // 30 second timeout
      // Only accept 2xx status codes for auth endpoints to ensure token presence
      validateStatus: (status) => {
        if (isAuthRequest) {
          // For auth requests, only accept 2xx responses to ensure token is present
          return status >= 200 && status < 300;
        }
        // For other endpoints, handle 4xx errors explicitly below
        return status >= 200 && status < 500;
      }
    });
    
    // Check for 4xx errors that weren't automatically rejected
    if (response.status >= 400 && response.status < 500) {
      console.error(`[REQ:${requestId}] Server returned ${response.status} error:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
      
      // Handle 4xx explicitly
      throw new Error(response.data?.error || `Server returned error ${response.status}`);
    }
    
    // Log success responses with detailed information
    console.log(`[REQ:${requestId}] Response received (${response.status}):`, {
      url,
      method,
      status: response.status,
      contentType: response.headers?.['content-type'],
      dataSize: JSON.stringify(response.data).length
    });
    
    // Special logging for auth endpoints
    if (isAuthRequest) {
      console.log(`[REQ:${requestId}] Auth response details:`, {
        hasToken: !!response?.data?.token,
        tokenType: typeof response?.data?.token,
        tokenLength: response?.data?.token ? response.data.token.length : 0,
        hasUser: !!response?.data?.user,
        hasUserData: !!response?.data?.userData,
        responseStatus: response.status,
        responseContentType: response.headers?.['content-type'],
        responseDataType: typeof response.data,
        responseDataKeys: response.data ? Object.keys(response.data) : null,
        userFieldsIfPresent: response?.data?.user ? Object.keys(response.data.user) : null,
        userDataFieldsIfPresent: response?.data?.userData ? Object.keys(response.data.userData) : null
      });
    }
    
    return response;
  } catch (error: any) {
    console.error(`[REQ:${requestId}] Request failed:`, {
      url,
      method,
      errorName: error.name,
      errorMessage: error.message,
      errorType: error.constructor.name,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      isAxiosError: error.isAxiosError,
      stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
    });
    
    // Detailed logging for auth requests
    if (isAuthRequest) {
      console.error(`[REQ:${requestId}] Auth request failed details:`, {
        url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
        message: error.message
      });
    }
    
    // Specific error handling based on error types
    if (error.response) {
      // Server responded with error status code
      console.error(`[REQ:${requestId}] Server error response:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      // Format error message with more details
      const errorText = error.response.data?.error || error.response.statusText || "Request failed";
      throw new Error(`${errorText} (${error.response.status})`);
    } else if (error.request) {
      // Request was made but no response received (network errors)
      console.error(`[REQ:${requestId}] No response received:`, { 
        request: error.request._currentUrl || error.request.responseURL || url 
      });
      throw new Error("Network error: No response received from server");
    } else {
      // Request setup error
      console.error(`[REQ:${requestId}] Request configuration error:`, { message: error.message });
      throw new Error(`Request error: ${error.message}`);
    }
  }
};
