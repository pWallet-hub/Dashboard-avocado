import apiClient, { extractData } from './apiClient';

/**
 * System Logs Service
 * Implements endpoints from API documentation:
 * Base Path: /logs
 */

// View system logs (Admin only)
export async function getSystemLogs(options = {}) {
    try {
        const params = {};
        if (options.level) params.level = options.level;
        if (options.limit) params.limit = options.limit;
        if (options.page) params.page = options.page;

        const response = await apiClient.get('/logs', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching system logs:', error);
        throw error;
    }
}

export default {
    getSystemLogs,
};