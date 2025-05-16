import axios from 'axios';

// Main API request helper
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
  endpoint: string, 
  data?: any
) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  try {
    const response = await axios({
      method,
      url,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response;
  } catch (error) {
    console.error(`API error (${method} ${url}):`, error);
    throw error;
  }
}