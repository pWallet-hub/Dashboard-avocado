import apiClient from './apiClient';

// Import users from Excel/JSON with access keys
export const bulkImportUsers = async (data) => {
  try {
    const response = await apiClient.post('/profile-access/bulk-import', data, {
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to import users');
  }
};

// Verify access key for profile editing
export const verifyAccessKey = async (accessKey) => {
  try {
    const response = await apiClient.post('/profile-access/verify-access-key', { access_key: accessKey });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to verify access key');
  }
};

// Update profile using access key
export const updateProfileWithAccessKey = async (accessKey, profileData) => {
  try {
    const response = await apiClient.put('/profile-access/update-profile', {
      access_key: accessKey,
      profile_data: profileData,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Generate QR code with access key for a user
export const generateQRCode = async (userId) => {
  try {
    const response = await apiClient.get(`/profile-access/generate-qr/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate QR code');
  }
};