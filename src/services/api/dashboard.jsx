import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
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

// Dashboard service
export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

// Auth service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};

// Project service
export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
};

// Approval service
export const approvalService = {
  getApprovals: async () => {
    const response = await api.get('/approvals');
    return response.data;
  },
  getApproval: async (id) => {
    const response = await api.get(`/approvals/${id}`);
    return response.data;
  },
  createApproval: async (approvalData) => {
    const response = await api.post('/approvals', approvalData);
    return response.data;
  },
  updateApproval: async (id, approvalData) => {
    const response = await api.put(`/approvals/${id}`, approvalData);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/approvals/${id}/status`, { status });
    return response.data;
  }
};

export default api;