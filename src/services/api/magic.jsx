import api from './index';

const magicAPI = {
  // Generate magic link
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

  // Validate magic link (public)
  validateMagicLink: async (token) => {
    try {
      const response = await api.get(`/magic/validate/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error in validateMagicLink:', error);
      throw error;
    }
  },

  // Get access data via magic link (public)
  getAccessViaMagicLink: async (token) => {
    try {
      const response = await api.get(`/magic/access/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAccessViaMagicLink:', error);
      throw error;
    }
  },

  // Submit decision via magic link (public)
  submitDecisionViaMagic: async (token, approvalId, status, comment = '') => {
    try {
      const response = await api.post(`/magic/decision/${token}`, {
        approvalId,
        status,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error in submitDecisionViaMagic:', error);
      throw error;
    }
  },

  // Add comment via magic link (public)
  addCommentViaMagic: async (token, approvalId, comment) => {
    try {
      const response = await api.post(`/magic/comment/${token}`, {
        approvalId,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error in addCommentViaMagic:', error);
      throw error;
    }
  },

  // Get all magic links (agency)
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

  // Get magic link stats
  getMagicLinkStats: async () => {
    try {
      const response = await api.get('/magic/stats');
      return response.data;
    } catch (error) {
      console.error('Error in getMagicLinkStats:', error);
      throw error;
    }
  },

  // Get single magic link
  getMagicLinkById: async (id) => {
    try {
      const response = await api.get(`/magic/links/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getMagicLinkById:', error);
      throw error;
    }
  },

  // Revoke magic link
  revokeMagicLink: async (id) => {
    try {
      const response = await api.delete(`/magic/links/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in revokeMagicLink:', error);
      throw error;
    }
  },

  // Resend magic link email
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