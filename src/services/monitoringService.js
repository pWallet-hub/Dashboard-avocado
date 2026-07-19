import apiClient, { extractData } from './apiClient';

// Service health check (public)
export async function getServiceHealth() {
  try {
    const response = await apiClient.get('/health');
    return extractData(response);
  } catch (error) {
    console.error('Error in getServiceHealth:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load service health');
  }
}

// Database and system health check
export async function getMonitoringHealth() {
  try {
    const response = await apiClient.get('/monitoring/health');
    return extractData(response);
  } catch (error) {
    console.error('Error in getMonitoringHealth:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load health status');
  }
}

// System resource information — CPU, memory, uptime (admin)
export async function getSystemInfo() {
  try {
    const response = await apiClient.get('/monitoring/system');
    return extractData(response);
  } catch (error) {
    console.error('Error in getSystemInfo:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load system information');
  }
}

// Request/log volume broken down by log level over a time window (admin)
export async function getUsageStats(period = '24h') {
  try {
    const validPeriods = ['24h', '7d', '30d'];
    const params = {};
    if (period && validPeriods.includes(period)) params.period = period;

    const response = await apiClient.get('/monitoring/usage', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error in getUsageStats:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load usage statistics');
  }
}

// Database connectivity check and row counts for key tables (admin)
export async function getDatabaseStatus() {
  try {
    const response = await apiClient.get('/monitoring/database');
    return extractData(response);
  } catch (error) {
    console.error('Error in getDatabaseStatus:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load database status');
  }
}
