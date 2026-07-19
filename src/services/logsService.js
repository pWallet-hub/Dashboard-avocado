import apiClient, { extractData } from './apiClient';

// Paginated system logs (admin)
export async function listLogs(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.level) params.level = options.level;
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;

    const response = await apiClient.get('/logs', { params });
    const extractedData = extractData(response);

    if (extractedData && extractedData.data) {
      return {
        data: Array.isArray(extractedData.data) ? extractedData.data : [],
        pagination: extractedData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.data ? extractedData.data.length : 0,
          itemsPerPage: options.limit || 20
        }
      };
    } else if (Array.isArray(extractedData)) {
      return {
        data: extractedData,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.length,
          itemsPerPage: options.limit || 20
        }
      };
    } else {
      console.warn('Unexpected response structure:', extractedData);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: options.limit || 20
        }
      };
    }
  } catch (error) {
    console.error('Error in listLogs:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load logs');
  }
}

// Delete logs older than a given number of days (admin)
export async function cleanupLogs(olderThanDays = 30) {
  try {
    if (!Number.isInteger(olderThanDays) || olderThanDays < 1) {
      throw new Error('older_than_days must be a positive integer');
    }

    const response = await apiClient.delete('/logs/cleanup', { data: { older_than_days: olderThanDays } });
    return extractData(response);
  } catch (error) {
    console.error('Error in cleanupLogs:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to clean up logs');
  }
}

// Export logs as a CSV file (admin) — returns a Blob for the caller to download
export async function exportLogs(options = {}) {
  try {
    const params = {};
    if (options.level) params.level = options.level;
    if (options.start_date) params.start_date = options.start_date;
    if (options.end_date) params.end_date = options.end_date;

    const response = await apiClient.get('/logs/export', { params, responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Error in exportLogs:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to export logs');
  }
}

// Log level statistics (admin)
export async function getLogStatistics() {
  try {
    const response = await apiClient.get('/logs/statistics');
    return extractData(response);
  } catch (error) {
    console.error('Error in getLogStatistics:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load log statistics');
  }
}
