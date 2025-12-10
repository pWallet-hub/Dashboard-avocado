import apiClient, { extractData } from './apiClient';

/**
 * System Monitoring Service
 * Implements endpoints from API documentation:
 * Base Path: /monitoring
 */

// Get system usage statistics (Admin only)
export async function getSystemUsage(period = '24h') {
    try {
        const params = { period };

        const response = await apiClient.get('/monitoring/usage', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching system usage:', error);
        throw error;
    }
}

// Get recent system activity (Admin only)
export async function getSystemActivity(options = {}) {
    try {
        const params = {};
        if (options.limit) params.limit = options.limit;

        const response = await apiClient.get('/monitoring/activity', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching system activity:', error);
        throw error;
    }
}

export default {
    getSystemUsage,
    getSystemActivity,
};