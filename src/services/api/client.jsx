import api from './index';

const clientAPI = {
  // Get project clients
  getProjectClients: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/clients`);
      return response.data;
    } catch (error) {
      console.error('Error in getProjectClients:', error);
      throw error;
    }
  },

  // Add client to project
  addClient: async (projectId, clientData) => {
    try {
      const response = await api.post(`/projects/${projectId}/clients`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error in addClient:', error);
      throw error;
    }
  },

  // Remove client from project
  removeClient: async (projectId, clientId) => {
    try {
      const response = await api.delete(`/projects/${projectId}/clients/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error in removeClient:', error);
      throw error;
    }
  },

  // Update client
  updateClient: async (projectId, clientId, clientData) => {
    try {
      const response = await api.put(`/projects/${projectId}/clients/${clientId}`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error in updateClient:', error);
      throw error;
    }
  },

  // Get all clients across workspaces
  getAllClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Error in getAllClients:', error);
      throw error;
    }
  }
};

export default clientAPI;