import apiClient from './apiClient';

// Get all inventory
export const getInventory = async (params = {}) => {
  try {
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch inventory');
  }
};

// Get low stock items
export const getLowStockItems = async (params = {}) => {
  try {
    const response = await apiClient.get('/inventory/low-stock', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch low stock items');
  }
};

// Get out of stock items
export const getOutOfStockItems = async (params = {}) => {
  try {
    const response = await apiClient.get('/inventory/out-of-stock', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch out of stock items');
  }
};

// Adjust stock (delta adjustment)
export const adjustStock = async (adjustmentData) => {
  try {
    const response = await apiClient.post('/inventory/stock-adjustment', adjustmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to adjust stock');
  }
};

// Get inventory valuation
export const getInventoryValuation = async (params = {}) => {
  try {
    const response = await apiClient.get('/inventory/valuation', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch inventory valuation');
  }
};