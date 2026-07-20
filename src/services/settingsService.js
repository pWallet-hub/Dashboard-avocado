import apiClient, { extractData } from './apiClient';

// List all system settings, optionally filtered by category (admin)
export async function listSettings(category) {
  try {
    const params = {};
    if (category) params.category = category;

    const response = await apiClient.get('/settings', { params });
    const extractedData = extractData(response);

    if (Array.isArray(extractedData)) {
      return extractedData;
    } else if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    }
    return [];
  } catch (error) {
    console.error('Error in listSettings:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load settings');
  }
}

// Create a new system setting (admin)
export async function createSetting(settingData) {
  try {
    if (!settingData || typeof settingData !== 'object') {
      throw new Error('Setting data is required');
    }

    if (!settingData.key) {
      throw new Error('Setting key is required');
    }

    if (settingData.value === undefined || settingData.value === null || settingData.value === '') {
      throw new Error('Setting value is required');
    }

    const response = await apiClient.post('/settings', settingData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createSetting:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create setting');
  }
}

// Seed default system settings if none exist yet (admin). No-op if settings already exist.
export async function initializeSettings() {
  try {
    const response = await apiClient.get('/settings/initialize');
    return extractData(response);
  } catch (error) {
    console.error('Error in initializeSettings:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to initialize settings');
  }
}

// Get a single setting by key
export async function getSetting(key) {
  try {
    if (!key) {
      throw new Error('Setting key is required');
    }

    const response = await apiClient.get(`/settings/${key}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getSetting:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get setting');
  }
}

// Set or update a setting value (admin)
export async function updateSetting(key, settingData) {
  try {
    if (!key) {
      throw new Error('Setting key is required');
    }

    if (!settingData || typeof settingData !== 'object') {
      throw new Error('Valid setting data is required');
    }

    if (settingData.value === undefined || settingData.value === null || settingData.value === '') {
      throw new Error('Setting value is required');
    }

    const response = await apiClient.put(`/settings/${key}`, settingData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateSetting:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update setting');
  }
}

// Delete a setting (admin)
export async function deleteSetting(key) {
  try {
    if (!key) {
      throw new Error('Setting key is required');
    }

    const response = await apiClient.delete(`/settings/${key}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteSetting:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete setting');
  }
}
