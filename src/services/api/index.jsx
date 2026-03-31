// services/api/index.js
import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30 * 60 * 1000, // 30mins timeout
});

// Request interceptor - adds auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => {
    // Return successful response data
    return response;
  },
  (error) => {
    // Handle specific error status codes
    if (error.response) {
      const { status, data } = error.response;
      
      // Check for token expired due to plan change
      if (data?.code === 'TOKEN_EXPIRED') {
        // Clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show message
        console.log('Your plan has been updated. Please login again.');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Check for plan expired
      if (data?.code === 'PLAN_EXPIRED') {
        // Clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show message
        console.log('Your plan has expired. Please login again.');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          if (data?.code !== 'TOKEN_EXPIRED' && data?.code !== 'PLAN_EXPIRED') { // Avoid double handling
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Forbidden: You do not have permission to access this resource');
          break;
          
        case 404:
          // Not found
          console.error('Resource not found');
          break;
          
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
          
        default:
          console.error(`HTTP error: ${status}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default api;