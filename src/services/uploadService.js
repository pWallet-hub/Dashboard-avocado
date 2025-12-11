import apiClient from './apiClient';

// Upload single file
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload file');
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files) => {
  try {
    const formData = new FormData();
    
    // Append each file to the FormData
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload files');
  }
};