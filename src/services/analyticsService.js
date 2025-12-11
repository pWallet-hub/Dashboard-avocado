import apiClient from './apiClient';

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
  }
};

// Get sales analytics
export const getSalesAnalytics = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/sales', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales analytics');
  }
};

// Get product analytics
export const getProductAnalytics = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product analytics');
  }
};

// Get user analytics
export const getUserAnalytics = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user analytics');
  }
};

// Get monthly order trends
export const getMonthlyOrderTrends = async (params = {}) => {
  try {
    const response = await apiClient.get('/analytics/orders/monthly', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch monthly order trends');
  }
};