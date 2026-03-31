import api from './index';

export const approvalAPI = {
  // Create approval item
  // In services/api/approval.js
createApprovalItem: async (projectId, data) => {
  // If data is FormData, let the browser set the Content-Type with boundary
  const config = data instanceof FormData 
    ? { 
        headers: { 
          'Content-Type': 'multipart/form-data' 
        } 
      }
    : { 
        headers: { 
          'Content-Type': 'application/json' 
        } 
      };
    
  const response = await api.post(`/approvals/project/${projectId}/approvals`, data, config);
  return response.data;
},

  // Get approval items in project
  getApprovalItems: async (projectId) => {
    const response = await api.get(`/approvals/project/${projectId}/approvals`);
    return response.data;
  },

  // Get single approval item
  getApprovalItem: async (id) => {
    const response = await api.get(`/approvals/${id}`);
    return response.data;
  },

  // Update approval item
  updateApprovalItem: async (id, data) => {
    const response = await api.put(`/approvals/${id}`, data);
    return response.data;
  },

  // Delete approval item
  deleteApprovalItem: async (id) => {
    const response = await api.delete(`/approvals/${id}`);
    return response.data;
  },

  // Update approval status
  updateApprovalStatus: async (id, status) => {
    const response = await api.put(`/approvals/${id}/status`, { status });
    return response.data;
  },

  // Add comment to approval
  addComment: async (id, data) => {
    const response = await api.post(`/approvals/${id}/comments`, data);
    return response.data;
  },

  // Update status via magic link
  updateStatusViaMagic: async (token, itemId, data) => {
    const response = await api.put(`/approvals/magic/item/${token}/${itemId}/status`, data);
    return response.data;
  },

  // Add comment via magic link
  addCommentViaMagic: async (token, itemId, data) => {
    const response = await api.post(`/approvals/magic/item/${token}/${itemId}/comments`, data);
    return response.data;
  },

  // Get approvals stats
  getApprovalStats: async (projectId) => {
    const response = await api.get(`/approvals/project/${projectId}/stats`);
    return response.data;
  },

  // Search approvals
  searchApprovals: async (projectId, filters) => {
    const response = await api.get(`/approvals/project/${projectId}/search`, { params: filters });
    return response.data;
  },

  // Get ALL approvals across all projects (ADD THIS)
  getAllApprovals: async () => {
    const response = await api.get('/approvals');
    return response.data;
  },


};