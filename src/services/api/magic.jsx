import api from './index';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const magicAPI = {
  // 🔒 GENERATE MAGIC LINK - Requires Auth
  generateMagicLink: async (projectId, email, approvalIds = [], sendEmail = true) => {
    try {
      const response = await api.post('/magic/generate', {
        projectId,
        email,
        approvalIds,
        sendEmail
      });
      return response.data;
    } catch (error) {
      console.error('Error in generateMagicLink:', error);
      throw error;
    }
  },

  // ✅ VALIDATE MAGIC LINK - PUBLIC (No auth)
  validateMagicLink: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/magic/validate/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error in validateMagicLink:', error);
      throw error;
    }
  },

  // ✅ GET ACCESS VIA MAGIC LINK - PUBLIC (No auth)
  getAccessViaMagicLink: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/magic/access/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.error('Error in getAccessViaMagicLink:', error);
      throw error;
    }
  },

  // ✅ SUBMIT DECISION VIA MAGIC LINK - PUBLIC (No auth)
  submitDecisionViaMagic: async (token, approvalId, status, comment = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/magic/decision/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, status, comment })
      });
      return await response.json();
    } catch (error) {
      console.error('Error in submitDecisionViaMagic:', error);
      throw error;
    }
  },

  // ✅ ADD COMMENT VIA MAGIC LINK - PUBLIC (No auth)
  addCommentViaMagic: async (token, approvalId, comment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/magic/comment/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, comment })
      });
      return await response.json();
    } catch (error) {
      console.error('Error in addCommentViaMagic:', error);
      throw error;
    }
  },

  // 🔒 GET ALL MAGIC LINKS - Requires Auth (Agency only)
  getAllMagicLinks: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/magic/links?${queryParams}` : '/magic/links';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getAllMagicLinks:', error);
      throw error;
    }
  },

  // 🔒 GET MAGIC LINK STATS - Requires Auth
  getMagicLinkStats: async () => {
    try {
      const response = await api.get('/magic/stats');
      return response.data;
    } catch (error) {
      console.error('Error in getMagicLinkStats:', error);
      throw error;
    }
  },

  // 🔒 GET SINGLE MAGIC LINK - Requires Auth
  getMagicLinkById: async (id) => {
    try {
      const response = await api.get(`/magic/links/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getMagicLinkById:', error);
      throw error;
    }
  },

  // 🔒 REVOKE MAGIC LINK - Requires Auth
  revokeMagicLink: async (id) => {
    try {
      const response = await api.delete(`/magic/links/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in revokeMagicLink:', error);
      throw error;
    }
  },

  // 🔒 RESEND MAGIC LINK EMAIL - Requires Auth
  resendMagicLinkEmail: async (id) => {
    try {
      const response = await api.post(`/magic/links/${id}/resend`);
      return response.data;
    } catch (error) {
      console.error('Error in resendMagicLinkEmail:', error);
      throw error;
    }
  }
};

export default magicAPI;