import apiClient, { extractData } from './apiClient';

/**
 * Profile Access Service
 * Implements endpoints from API documentation:
 * Base Path: /profile-access
 * - GET    /profile-access/qr/{userId}           Generate QR code image for a user (agent/admin)
 * - GET    /profile-access/generate-qr/{userId}  Generate a QR code containing a fresh 7-day access key (agent/admin)
 * - POST   /profile-access/regenerate/{userId}   Regenerate QR code token for a user
 * - DELETE /profile-access/expire/{userId}       Immediately expire a user's QR code token
 * - GET    /profile-access/activity/{userId}     QR scan activity log for a user
 * - POST   /profile-access/bulk-import           Bulk import users from Excel file (admin)
 *
 * Public endpoints (no auth) — implemented here for completeness, intentionally unused
 * by the authenticated dashboard UI. These are meant to be hit from a farmer's phone
 * after scanning a QR code / receiving an access key, outside this app's auth flow.
 * - GET    /profile-access/scan/{token}          Get user profile by QR token (public)
 * - PUT    /profile-access/scan/{token}           Update user profile via QR scan (agent/admin)
 * - POST   /profile-access/verify-access-key     Verify a one-time access key (public)
 * - PUT    /profile-access/update-profile        Update a user profile using a one-time access key (public)
 */

// Generate/fetch the QR code image for a user (agent/admin)
export async function getUserQRCode(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await apiClient.get(`/profile-access/qr/${userId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getUserQRCode:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to generate QR code');
  }
}

// Generate a QR code containing a fresh 7-day access key for a user (agent/admin)
export async function generateAccessKeyQRCode(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await apiClient.get(`/profile-access/generate-qr/${userId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in generateAccessKeyQRCode:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to generate access key QR code');
  }
}

// Regenerate QR code token for a user
export async function regenerateQRToken(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await apiClient.post(`/profile-access/regenerate/${userId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in regenerateQRToken:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to regenerate QR code token');
  }
}

// Immediately expire a user's QR code token
export async function expireQRToken(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await apiClient.delete(`/profile-access/expire/${userId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in expireQRToken:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to expire QR code token');
  }
}

// QR scan activity log for a user
export async function getActivityLog(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await apiClient.get(`/profile-access/activity/${userId}`);
    const extractedData = extractData(response);

    if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    } else if (Array.isArray(extractedData)) {
      return extractedData;
    }
    return [];
  } catch (error) {
    console.error('Error in getActivityLog:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load activity log');
  }
}

// Bulk import users from an Excel file (admin). Each imported user gets an access key.
export async function bulkImportUsers(file) {
  if (!file) {
    throw new Error('Excel file is required');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/profile-access/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response);
  } catch (error) {
    console.error('Error in bulkImportUsers:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to bulk import users');
  }
}

// --- Public / out-of-scope-for-this-UI endpoints (implemented for completeness only) ---

// Get user profile by QR token (public — no auth required)
export async function getProfileByScanToken(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const response = await apiClient.get(`/profile-access/scan/${token}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getProfileByScanToken:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load profile');
  }
}

// Update user profile via QR scan (agent/admin)
export async function updateProfileByScanToken(token, profileData) {
  if (!token) {
    throw new Error('Token is required');
  }
  if (!profileData || typeof profileData !== 'object') {
    throw new Error('Valid profile data is required');
  }

  try {
    const response = await apiClient.put(`/profile-access/scan/${token}`, profileData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateProfileByScanToken:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
  }
}

// Verify a one-time access key (public)
export async function verifyAccessKey(accessKey) {
  if (!accessKey) {
    throw new Error('Access key is required');
  }

  try {
    const response = await apiClient.post('/profile-access/verify-access-key', { access_key: accessKey });
    return extractData(response);
  } catch (error) {
    console.error('Error in verifyAccessKey:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to verify access key');
  }
}

// Update a user profile using a one-time access key (public). Marks the access key as used.
export async function updateProfileWithAccessKey(accessKey, profileData) {
  if (!accessKey) {
    throw new Error('Access key is required');
  }
  if (!profileData || typeof profileData !== 'object') {
    throw new Error('Valid profile data is required');
  }

  try {
    const response = await apiClient.put('/profile-access/update-profile', {
      access_key: accessKey,
      profile_data: profileData,
    });
    return extractData(response);
  } catch (error) {
    console.error('Error in updateProfileWithAccessKey:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update profile');
  }
}

export default {
  getUserQRCode,
  generateAccessKeyQRCode,
  regenerateQRToken,
  expireQRToken,
  getActivityLog,
  bulkImportUsers,
  getProfileByScanToken,
  updateProfileByScanToken,
  verifyAccessKey,
  updateProfileWithAccessKey,
};
