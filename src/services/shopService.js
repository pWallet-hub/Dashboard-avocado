import apiClient from './apiClient';

/**
 * Shop Management Service
 * Handles all shop-related API operations
 * Base URL: /api/shops
 */

const SHOP_API_BASE = '/shops';

/**
 * Helper function to retry API calls with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retry attempts (default: 2)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise<any>} Result of the function
 */
const retryWithBackoff = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || error.response?.status === 401 || error.response?.status === 403) {
      throw error;
    }
    
    console.log(`⏳ Retrying... (${retries} attempts left, waiting ${delay}ms)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

/**
 * Create a new shop (Admin only)
 * @param {Object} shopData - Shop data
 * @returns {Promise<Object>} Created shop data
 */
export const createShop = async (shopData) => {
  try {
    const response = await apiClient.post(`${SHOP_API_BASE}/addshop`, shopData);
    return response.data;
  } catch (error) {
    console.error('Error creating shop:', error);
    throw error;
  }
};

/**
 * Get all shops
 * @returns {Promise<Object>} Response with shops data
 */
export const getAllShops = async () => {
  try {
    console.log('🔍 Fetching shops from:', `${SHOP_API_BASE}`);
    console.log('⏰ Note: First request may take 30-60s if backend is waking up from sleep');
    
    const response = await retryWithBackoff(async () => {
      return await apiClient.get(SHOP_API_BASE);
    });
    
    console.log('✅ Shop API Response Status:', response.status);
    console.log('✅ Shop API Response Data:', response.data);
    console.log('✅ Number of shops:', response.data?.data?.length || 0);
    
    // API returns: { success: true, data: [...], message: "Shops retrieved successfully", meta: {...} }
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching shops:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
    
    // Provide more helpful error messages
    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout. The backend server may be starting up. Please try again in a moment.');
    }
    throw error;
  }
};

/**
 * Get single shop by ID
 * @param {number} id - Shop ID
 * @returns {Promise<Object>} Shop data
 */
export const getShopById = async (id) => {
  try {
    const response = await apiClient.get(`${SHOP_API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shop:', error);
    throw error;
  }
};

/**
 * Update shop
 * @param {number} id - Shop ID
 * @param {Object} updateData - Updated shop data
 * @returns {Promise<Object>} Updated shop data
 */
export const updateShop = async (id, updateData) => {
  try {
    const response = await apiClient.put(`${SHOP_API_BASE}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating shop:', error);
    throw error;
  }
};

/**
 * Delete shop
 * @param {number} id - Shop ID
 * @returns {Promise<Object>} Deleted shop data
 */
export const deleteShop = async (id) => {
  try {
    const response = await apiClient.delete(`${SHOP_API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shop:', error);
    throw error;
  }
};

/**
 * Enable or disable a shop's ability to sell (Admin only)
 * @param {string} shopId - Shop UUID
 * @param {boolean} canSell - Whether the shop can sell
 * @returns {Promise<Object>} Updated shop data
 */
export const updateShopSellingPermission = async (shopId, canSell) => {
  try {
    const response = await apiClient.put(`${SHOP_API_BASE}/${shopId}/selling-permission`, { can_sell: canSell });
    return response.data;
  } catch (error) {
    console.error('Error updating shop selling permission:', error);
    throw error;
  }
};

/**
 * Get a shop's products/inventory (Products whose supplier_id equals this shop's id)
 * @param {number|string} shopNumber - Shop number
 * @param {Object} params - Optional query params (page, limit, etc.)
 * @returns {Promise<Object>} Response with inventory data
 */
export const getShopInventory = async (shopNumber, params = {}) => {
  if (!shopNumber) {
    throw new Error('Shop number is required');
  }
  try {
    const response = await apiClient.get(`${SHOP_API_BASE}/${shopNumber}/inventory`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop inventory:', error);
    throw error;
  }
};

/**
 * Get orders containing the shop's products
 * @param {number|string} shopNumber - Shop number
 * @param {Object} params - Optional query params (page, limit, status, etc.)
 * @returns {Promise<Object>} Response with orders data
 */
export const getShopOrders = async (shopNumber, params = {}) => {
  if (!shopNumber) {
    throw new Error('Shop number is required');
  }
  try {
    const response = await apiClient.get(`${SHOP_API_BASE}/${shopNumber}/orders`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    throw error;
  }
};

/**
 * Get shop analytics summary (totals, revenue, stock levels)
 * @param {number|string} shopNumber - Shop number
 * @returns {Promise<Object>} Response with analytics data
 */
export const getShopAnalytics = async (shopNumber) => {
  if (!shopNumber) {
    throw new Error('Shop number is required');
  }
  try {
    const response = await apiClient.get(`${SHOP_API_BASE}/${shopNumber}/analytics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shop analytics:', error);
    throw error;
  }
};

/**
 * Get a shop's wallet balance and top-up/adjustment transaction history
 * @param {number|string} shopNumber - Shop number
 * @param {Object} params - Optional query params (page, limit, etc.)
 * @returns {Promise<Object>} Response with wallet data
 */
export const getShopWallet = async (shopNumber, params = {}) => {
  if (!shopNumber) {
    throw new Error('Shop number is required');
  }
  try {
    const response = await apiClient.get(`${SHOP_API_BASE}/${shopNumber}/wallet`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching shop wallet:', error);
    throw error;
  }
};

/**
 * Add balance to a shop's wallet (Admin only)
 * @param {number|string} shopNumber - Shop number
 * @param {Object} topupData - { amount, description, payment_method }
 * @returns {Promise<Object>} Response with updated wallet data
 */
export const topUpShopWallet = async (shopNumber, topupData) => {
  if (!shopNumber) {
    throw new Error('Shop number is required');
  }
  if (!topupData || typeof topupData !== 'object') {
    throw new Error('Valid top-up data is required');
  }
  if (topupData.amount === undefined || topupData.amount === null || Number(topupData.amount) <= 0) {
    throw new Error('A valid top-up amount is required');
  }
  try {
    const response = await apiClient.post(`${SHOP_API_BASE}/${shopNumber}/wallet/topup`, topupData);
    return response.data;
  } catch (error) {
    console.error('Error topping up shop wallet:', error);
    throw error;
  }
};

/**
 * Export shops data to Excel format
 * @param {Array} shops - Shops data to export
 * @returns {void}
 */
export const exportShopsToExcel = (shops) => {
  // This is a placeholder for Excel export functionality
  // You can integrate a library like xlsx or export-to-csv
  const csvContent = [
    ['ID', 'Shop Name', 'Description', 'Province', 'District', 'Owner Name', 'Owner Email', 'Owner Phone', 'Created At'].join(','),
    ...shops.map(shop => [
      shop.id,
      shop.shopName,
      shop.description,
      shop.province,
      shop.district,
      shop.ownerName,
      shop.ownerEmail,
      shop.ownerPhone,
      new Date(shop.createdAt).toLocaleDateString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shops_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
