import api from './index';
import { approvalAPI } from '../../services/api/approval';

export const projectAPI = {
  // Create project in workspace
  createProject: async (workspaceId, data) => {
    const response = await api.post(`/projects/workspaces/${workspaceId}/projects`, data);
    return response.data;
  },

  // Get all projects for current user
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get projects in specific workspace
  getProjectsByWorkspace: async (workspaceId) => {
    const response = await api.get(`/projects/workspaces/${workspaceId}/projects`);
    return response.data;
  },

  // Get single project
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Update project
  updateProject: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Get all projects
  getProjects: async () => {
  const response = await api.get('/projects');
  return response.data;
},
};