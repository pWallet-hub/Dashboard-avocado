import apiClient from './apiClient';

// Get all products
export async function listProducts(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.category) params.category = options.category;
    if (options.supplier_id) params.supplier_id = options.supplier_id;
    if (options.status) params.status = options.status;
    if (options.price_min) params.price_min = options.price_min;
    if (options.price_max) params.price_max = options.price_max;
    if (options.in_stock !== undefined) params.in_stock = options.in_stock;
    if (options.search) params.search = options.search;
    
    const response = await apiClient.get('/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
}

// Get product by ID
export async function getProduct(productId) {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
}

// Create new product
export async function createProduct(productData) {
  try {
    const response = await apiClient.post('/products', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
}

// Update product
export async function updateProduct(productId, productData) {
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
}

// Delete product (mark as discontinued)
export async function deleteProduct(productId) {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
}

// Get products by category
export async function getProductsByCategory(category, options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    
    const response = await apiClient.get(`/products/category/${category}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products by category');
  }
}

// Update product stock
export async function updateProductStock(productId, quantity) {
  try {
    const response = await apiClient.put(`/products/${productId}/stock`, { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product stock');
  }
}