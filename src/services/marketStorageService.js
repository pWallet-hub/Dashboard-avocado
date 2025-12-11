import apiClient from './apiClient';

// This service handles market-related storage operations
// Since the API documentation doesn't specify market storage endpoints,
// we'll create a basic structure that can be extended

// Get market data
export const getMarketData = async (params = {}) => {
  try {
    // This would typically call a market-specific endpoint
    // For now, we'll use the products endpoint as market items
    const response = await apiClient.get('/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch market data');
  }
};

// Get market statistics
export const getMarketStats = async () => {
  try {
    // This would call a market stats endpoint
    // For now, we'll use analytics dashboard
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch market statistics');
  }
};

// Search market items
export const searchMarketItems = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/products', { 
      params: { ...params, search: query } 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search market items');
  }
};