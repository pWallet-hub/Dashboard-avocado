import apiClient from './apiClient';

// Get dashboard statistics
export async function getDashboardStatistics() {
  try {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
  }
}

// Get sales analytics
export async function getSalesAnalytics(options = {}) {
  try {
    const params = {};
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;
    
    const response = await apiClient.get('/analytics/sales', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch sales analytics');
  }
}

// Get product analytics
export async function getProductAnalytics(options = {}) {
  try {
    const params = {};
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;
    
    const response = await apiClient.get('/analytics/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product analytics');
  }
}

// Get user analytics
export async function getUserAnalytics(options = {}) {
  try {
    const params = {};
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;
    
    const response = await apiClient.get('/analytics/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user analytics');
  }
}

// Get monthly order trends
export async function getMonthlyOrderTrends(options = {}) {
  try {
    const params = {};
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;
    
    const response = await apiClient.get('/analytics/orders/monthly', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch monthly order trends');
  }
}