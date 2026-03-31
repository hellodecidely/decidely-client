// services/api/upload.js
import api from './index';

const uploadAPI = {
  // Get signed URL for direct upload
  getUploadUrl: async (fileData) => {
    const response = await api.post('/uploads/get-upload-url', fileData);
    return response.data;
  },

  // Confirm upload and attach to approval
  confirmUpload: async (confirmData) => {
    const response = await api.post('/uploads/confirm-upload', confirmData);
    return response.data;
  },

  // Delete file from S3
  deleteFile: async (key) => {
    try {
      const response = await api.delete(`/uploads/file/${encodeURIComponent(key)}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Check upload status
  getUploadStatus: async (key) => {
    const response = await api.get(`/uploads/status/${encodeURIComponent(key)}`);
    return response.data;
  }
};

export default uploadAPI;