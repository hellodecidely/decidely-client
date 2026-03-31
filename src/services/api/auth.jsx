// services/api/auth.js
import axios from 'axios';
import { API_URL } from '../../utils/constants';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔍 Auth response interceptor - Status:', error.response?.status);
    console.log('   URL:', error.config?.url);
    console.log('   Code:', error.response?.data?.code);
    
    // ✅ EXCLUDE reset password and validation routes from redirect
    const isResetPasswordRoute = error.config?.url?.includes('/auth/validate-reset-token') || 
                                  error.config?.url?.includes('/auth/reset-password');
    
    if (error.response?.status === 401 && !isResetPasswordRoute) {
      // Check for specific error codes
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        console.log('Token expired due to plan change');
      } else if (error.response?.data?.code === 'PLAN_EXPIRED') {
        console.log('Plan expired');
      }
      
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login or reset password page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/reset-password')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions - USE RELATIVE PATHS!
export const authAPI = {
  // Register new agency
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login agency
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/update', userData);
    return response.data;
  },

  // Get user usage statistics
  getUserUsage: async () => {
    const response = await api.get('/auth/usage');
    return response.data;
  },

  validateToken: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },

  getCurrentPlan: async () => {
    const response = await api.get('/auth/current-plan');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  validateResetToken: async (token) => {
    const response = await api.get(`/auth/validate-reset-token/${token}`);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;