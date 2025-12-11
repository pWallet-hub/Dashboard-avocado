import apiClient from './apiClient';

// Get all products with filters and pagination
export const getProducts = async (params = {}) => {
  try {
    const response = await apiClient.get('/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

// Get product by ID
export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
};

// Create new product
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

// Update product stock
export const updateProductStock = async (productId, stockData) => {
  try {
    const response = await apiClient.put(`/products/${productId}/stock`, stockData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product stock');
  }
};

// Get product stock history
export const getProductStockHistory = async (productId, params = {}) => {
  try {
    const response = await apiClient.get(`/products/${productId}/stock-history`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stock history');
  }
};

// Helper functions for specific product categories
export const getProductsByCategory = async (category, params = {}) => {
  return getProducts({ ...params, category });
};

export const getIrrigationProducts = async (params = {}) => {
  return getProductsByCategory('irrigation', params);
};

export const getHarvestingProducts = async (params = {}) => {
  return getProductsByCategory('harvesting', params);
};

export const getContainerProducts = async (params = {}) => {
  return getProductsByCategory('containers', params);
};

export const getPestManagementProducts = async (params = {}) => {
  return getProductsByCategory('pest-management', params);
};