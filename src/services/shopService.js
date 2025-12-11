import apiClient from './apiClient';

// Get all shops
export const getShops = async (params = {}) => {
  try {
    const response = await apiClient.get('/shops', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shops');
  }
};

// Get shop by ID
export const getShopById = async (shopId) => {
  try {
    const response = await apiClient.get(`/shops/${shopId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shop');
  }
};

// Create new shop
export const createShop = async (shopData) => {
  try {
    const response = await apiClient.post('/shops/addshop', shopData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create shop');
  }
};

// Update shop
export const updateShop = async (shopId, shopData) => {
  try {
    const response = await apiClient.put(`/shops/${shopId}`, shopData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update shop');
  }
};

// Delete shop
export const deleteShop = async (shopId) => {
  try {
    const response = await apiClient.delete(`/shops/${shopId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete shop');
  }
};

// Get shop inventory
export const getShopInventory = async (shopId, params = {}) => {
  try {
    const response = await apiClient.get(`/shops/${shopId}/inventory`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shop inventory');
  }
};

// Get shop orders
export const getShopOrders = async (shopId, params = {}) => {
  try {
    const response = await apiClient.get(`/shops/${shopId}/orders`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shop orders');
  }
};

// Get shop analytics
export const getShopAnalytics = async (shopId) => {
  try {
    const response = await apiClient.get(`/shops/${shopId}/analytics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shop analytics');
  }
};