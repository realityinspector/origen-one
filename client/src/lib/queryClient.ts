import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = process.env.NODE_ENV === "production" 
  ? "https://api.ai-tutor-app.example.com" 
  : "http://localhost:8000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
