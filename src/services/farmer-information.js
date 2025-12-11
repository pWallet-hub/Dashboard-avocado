import apiClient from './apiClient';

// Get farmer information and profile
export const getFarmerInformation = async (farmerId = null) => {
  try {
    const params = farmerId ? { farmerId } : {};
    const response = await apiClient.get('/farmer-information', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farmer information');
  }
};

// Update farmer profile information
export const updateFarmerInformation = async (farmerData) => {
  try {
    const response = await apiClient.put('/farmer-information', farmerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update farmer information');
  }
};

// Create farmer profile
export const createFarmerProfile = async (farmerData) => {
  try {
    const response = await apiClient.post('/farmer-information/create', farmerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create farmer profile');
  }
};

// Update tree count (quick update)
export const updateTreeCount = async (treeCount) => {
  try {
    const response = await apiClient.put('/farmer-information/tree-count', { tree_count: treeCount });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update tree count');
  }
};