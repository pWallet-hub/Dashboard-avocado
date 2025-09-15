import apiClient, { extractData } from './apiClient';

// Get all products
export async function listProducts(options = {}) {
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
  return extractData(response);
}

// Get product by ID
export async function getProduct(productId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  
  const response = await apiClient.get(`/products/${productId}`);
  return extractData(response);
}

// Create new product
export async function createProduct(productData) {
  // Validate required fields
  if (!productData || typeof productData !== 'object') {
    throw new Error("Product data is required");
  }
  
  if (!productData.name) {
    throw new Error("Product name is required");
  }
  
  if (!productData.category) {
    throw new Error("Product category is required");
  }
  
  if (productData.price === undefined || productData.price === null) {
    throw new Error("Product price is required");
  }
  
  if (productData.quantity === undefined || productData.quantity === null) {
    throw new Error("Product quantity is required");
  }
  
  if (!productData.unit) {
    throw new Error("Product unit is required");
  }
  
  if (!productData.supplier_id) {
    throw new Error("Product supplier ID is required");
  }
  
  const response = await apiClient.post('/products', productData);
  return extractData(response);
}

// Update product
export async function updateProduct(productId, productData) {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  
  if (!productData || typeof productData !== 'object') {
    throw new Error("Valid product data is required");
  }
  
  const response = await apiClient.put(`/products/${productId}`, productData);
  return extractData(response);
}

// Delete product (mark as discontinued)
export async function deleteProduct(productId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  
  const response = await apiClient.delete(`/products/${productId}`);
  return extractData(response);
}

// Get products by category
export async function getProductsByCategory(category, options = {}) {
  if (!category) {
    throw new Error("Category is required");
  }
  
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  
  const response = await apiClient.get(`/products/category/${category}`, { params });
  return extractData(response);
}

// Update product stock
export async function updateProductStock(productId, quantity) {
  if (!productId) {
    throw new Error("Product ID is required");
  }
  
  if (quantity === undefined || quantity === null) {
    throw new Error("Quantity is required");
  }
  
  if (typeof quantity !== 'number' || quantity < 0) {
    throw new Error("Quantity must be a non-negative number");
  }
  
  const response = await apiClient.put(`/products/${productId}/stock`, { quantity });
  return extractData(response);
}