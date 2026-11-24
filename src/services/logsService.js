import apiClient, { extractData } from './apiClient';

// Paginated system logs (admin).
// Backend returns data: { logs, pagination: { total, page, pages } } and only
// filters by level (start/end dates are honoured by /logs/export only).
// Returns { data, pagination: { page, totalPages, total } }.
export async function listLogs(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.level) params.level = options.level;

    const response = await apiClient.get('/logs', { params });
    const body = extractData(response) || {};
    const rows = Array.isArray(body.logs) ? body.logs : Array.isArray(body) ? body : [];
    const p = body.pagination || {};
    return {
      data: rows,
      pagination: {
        page: p.page || options.page || 1,
        totalPages: Math.max(1, p.pages || 1),
        total: p.total ?? rows.length,
      },
    };
  } catch (error) {
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
    throw new Error(error.response?.data?.message || error.message || 'Failed to export logs');
  }
}

// Log level statistics (admin)
export async function getLogStatistics() {
  try {
    const response = await apiClient.get('/logs/statistics');
    return extractData(response);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load log statistics');
  }
}
