import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = ''; // Empty base URL since we're on the same origin

export async function apiRequest(method: string, endpoint: string, data?: any, config?: AxiosRequestConfig) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    if (method.toUpperCase() === 'GET') {
      return await axios.get(url, config);
    } else if (method.toUpperCase() === 'POST') {
      return await axios.post(url, data, config);
    } else if (method.toUpperCase() === 'PUT') {
      return await axios.put(url, data, config);
    } else if (method.toUpperCase() === 'DELETE') {
      return await axios.delete(url, config);
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    console.error(`API request failed: ${method} ${endpoint}`, error);
    throw error;
  }
}