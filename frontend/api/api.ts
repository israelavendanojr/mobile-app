// api/api.ts - Add debugging
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      console.log('🔑 Token found:', token ? 'Yes' : 'No');
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Authorization header set:', config.headers.Authorization);
      }
      
      console.log('📍 Making request to:', config.baseURL + config.url);
      return config;
    } catch (error) {
      console.error('❌ Error getting token from secure store:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      console.log('🔄 Attempting token refresh...');
      original._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        console.log('🔑 Refresh token found:', refreshToken ? 'Yes' : 'No');
        
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          await SecureStore.setItemAsync('access_token', access);
          console.log('✅ Token refreshed successfully');
          
          // Retry the original request with new token
          original.headers.Authorization = `Bearer ${access}`;
          return api(original);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear stored tokens and redirect to login
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // You might want to navigate to login screen here
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;