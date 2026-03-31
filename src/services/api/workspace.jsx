// services/api/workspace.jsx
import api from './index';

export const workspaceAPI = {
  getAllWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },
  
  getWorkspace: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },
  
  createWorkspace: async (data) => {
    const response = await api.post('/workspaces', data);
    return response.data;
  },
  
  updateWorkspace: async (id, data) => {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data;
  },
  
  deleteWorkspace: async (id) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  }
};