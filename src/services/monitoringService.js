import apiClient from './apiClient';

// Comprehensive health check
export const getHealthCheck = async () => {
  try {
    const response = await apiClient.get('/monitoring/health');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch health check');
  }
};

// Get detailed system metrics
export const getSystemMetrics = async () => {
  try {
    const response = await apiClient.get('/monitoring/metrics');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system metrics');
  }
};

// Get system usage statistics
export const getSystemUsage = async (params = {}) => {
  try {
    const response = await apiClient.get('/monitoring/usage', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system usage');
  }
};

// Get recent system activity feed
export const getSystemActivity = async (params = {}) => {
  try {
    const response = await apiClient.get('/monitoring/activity', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system activity');
  }
};

// Clean up expired access keys and old logs
export const performCleanup = async () => {
  try {
    const response = await apiClient.post('/monitoring/cleanup');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to perform cleanup');
  }
};