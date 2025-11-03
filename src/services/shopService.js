import apiClient from './apiClient';

/**
 * Shop Management Service
 * Handles all shop-related API operations
 * Base URL: /api/addshops
 */

const SHOP_API_BASE = '/addshops';

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
