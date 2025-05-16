import axios from 'axios';
import { axiosInstance } from '../lib/queryClient';

// Main API request helper that uses the authenticated axios instance
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  endpoint: string, 
  data?: any
) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    // Use the authenticated axiosInstance from the app
    let response;
    
    switch(method) {
      case 'GET':
        response = await axiosInstance.get(url);
        break;
      case 'POST':
        response = await axiosInstance.post(url, data);
        break;
      case 'PUT':
        response = await axiosInstance.put(url, data);
        break;
      case 'DELETE':
        response = await axiosInstance.delete(url);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API error (${method} ${url}):`, error);
    throw error;
  }
}