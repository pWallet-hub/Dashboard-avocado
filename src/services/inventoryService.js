import apiClient, { extractData } from './apiClient';

/**
 * Inventory Management Service
 * Implements endpoints from API documentation:
 * Base Path: /inventory
 */

// Get all inventory items
export async function listInventory(options = {}) {
    try {
        const params = {};
        if (options.page) params.page = options.page;
        if (options.limit) params.limit = options.limit;
        if (options.shopId) params.shopId = options.shopId;

        const response = await apiClient.get('/inventory', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
}

// Get low stock items
export async function getLowStockItems(options = {}) {
    try {
        const params = {};
        if (options.threshold) params.threshold = options.threshold;
        if (options.shopId) params.shopId = options.shopId;

        const response = await apiClient.get('/inventory/low-stock', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching low stock items:', error);
        throw error;
    }
}

// Get out of stock items
export async function getOutOfStockItems(options = {}) {
    try {
        const params = {};
        if (options.shopId) params.shopId = options.shopId;

        const response = await apiClient.get('/inventory/out-of-stock', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching out of stock items:', error);
        throw error;
    }
}

// Adjust stock levels
export async function adjustStock(adjustmentData) {
    try {
        if (!adjustmentData || typeof adjustmentData !== 'object') {
            throw new Error('Adjustment data is required');
        }

        if (!adjustmentData.productId) {
            throw new Error('Product ID is required');
        }

        if (adjustmentData.quantity === undefined || adjustmentData.quantity === null) {
            throw new Error('Quantity is required');
        }

        if (!adjustmentData.reason) {
            throw new Error('Reason is required');
        }

        const response = await apiClient.post('/inventory/stock-adjustment', adjustmentData);
        return extractData(response);
    } catch (error) {
        console.error('Error adjusting stock:', error);
        throw error;
    }
}

// Get inventory valuation
export async function getInventoryValuation(options = {}) {
    try {
        const params = {};
        if (options.shopId) params.shopId = options.shopId;

        const response = await apiClient.get('/inventory/valuation', { params });
        return extractData(response);
    } catch (error) {
        console.error('Error fetching inventory valuation:', error);
        throw error;
    }
}

export default {
    listInventory,
    getLowStockItems,
    getOutOfStockItems,
    adjustStock,
    getInventoryValuation,
};