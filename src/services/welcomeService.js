import apiClient, { extractData } from './apiClient';

/**
 * Welcome Service
 * Implements endpoints from API documentation:
 * Base Path: /welcome
 * - GET /welcome        Platform overview and public statistics
 * - GET /welcome/stats  Detailed system statistics — user/product/order counts and process memory/uptime (public)
 */

// Get the platform overview and public statistics
export async function getPlatformOverview() {
  try {
    const response = await apiClient.get('/welcome');
    return extractData(response);
  } catch (error) {
    console.error('Error in getPlatformOverview:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load platform overview');
  }
}

// Get detailed public system statistics
export async function getPlatformStats() {
  try {
    const response = await apiClient.get('/welcome/stats');
    return extractData(response);
  } catch (error) {
    console.error('Error in getPlatformStats:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load platform statistics');
  }
}

export default {
  getPlatformOverview,
  getPlatformStats,
};
