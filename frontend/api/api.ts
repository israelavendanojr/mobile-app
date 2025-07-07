// api/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting token from secure store:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh');
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          await SecureStore.setItemAsync('access', access);
          
          // Retry the original request with new token
          original.headers.Authorization = `Bearer ${access}`;
          return api(original);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear stored tokens and redirect to login
        await SecureStore.deleteItemAsync('access');
        await SecureStore.deleteItemAsync('refresh');
        // You might want to navigate to login screen here
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;