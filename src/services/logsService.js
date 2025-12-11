import apiClient from './apiClient';

// Get system logs with advanced filtering
export const getLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/logs', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch logs');
  }
};

// Get logs by level
export const getLogsByLevel = async (level, params = {}) => {
  try {
    const response = await apiClient.get('/logs', { 
      params: { ...params, level } 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch logs by level');
  }
};

// Get logs by date range
export const getLogsByDateRange = async (startDate, endDate, params = {}) => {
  try {
    const response = await apiClient.get('/logs', { 
      params: { 
        ...params, 
        start_date: startDate, 
        end_date: endDate 
      } 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch logs by date range');
  }
};

// Export logs to file
export const exportLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/logs/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to export logs');
  }
};

// Clear old logs
export const clearOldLogs = async (olderThanDays = 30) => {
  try {
    const response = await apiClient.delete('/logs/cleanup', {
      data: { older_than_days: olderThanDays }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to clear old logs');
  }
};

// Get log statistics
export const getLogStatistics = async (params = {}) => {
  try {
    const response = await apiClient.get('/logs/statistics', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch log statistics');
  }
};