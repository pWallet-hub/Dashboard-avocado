import apiClient from './apiClient';

// Helper function to extract data from API responses
const extractData = (response) => {
  if (response.data?.success) {
    return response.data.data;
  }
  return response.data;
};

// Helper function to extract paginated data
const extractPaginatedData = (response) => {
  if (response.data?.success) {
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {}
    };
  }
  return {
    data: Array.isArray(response.data) ? response.data : [],
    pagination: {}
  };
};

// =============================================================================
// PRODUCT API FUNCTIONS
// =============================================================================

/**
 * Get all products with optional filtering and pagination
 */
export async function getAllProducts(options = {}) {
  try {
    console.log('🔄 Fetching products with options:', options);
    
    const params = {};
    
    // Add pagination parameters
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    
    // Add filter parameters
    if (options.category) params.category = options.category;
    if (options.status) params.status = options.status;
    if (options.supplier_id) params.supplier_id = options.supplier_id;
    if (options.min_price) params.min_price = options.min_price;
    if (options.max_price) params.max_price = options.max_price;
    if (options.price_min) params.price_min = options.price_min;
    if (options.price_max) params.price_max = options.price_max;
    if (options.in_stock !== undefined) params.in_stock = options.in_stock;
    if (options.search) params.search = options.search;
    if (options.sort) params.sort = options.sort;
    
    console.log('📤 Request params:', params);
    
    const response = await apiClient.get('/products', { params });
    console.log('✅ Products fetched successfully:', response.data);
    
    return extractPaginatedData(response);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
}

/**
 * Alias for getAllProducts (for backward compatibility)
 */
export async function listProducts(options = {}) {
  return await getAllProducts(options);
}

/**
 * Get products by category (specific helper for kit pages)
 */
export async function getProductsByCategory(category, options = {}) {
  try {
    if (!category) {
      throw new Error("Category is required");
    }
    
    console.log(`🔄 Fetching ${category} products...`);
    
    const requestOptions = {
      ...options,
      category: category,
      status: options.status || 'available', // Default to available products
      sort: options.sort || '-created_at' // Default sort by newest first
    };
    
    return await getAllProducts(requestOptions);
  } catch (error) {
    console.error(`❌ Error fetching ${category} products:`, error);
    throw error;
  }
}

/**
 * Get irrigation products
 */
export async function getIrrigationProducts(options = {}) {
  return await getProductsByCategory('irrigation', options);
}

/**
 * Get harvesting products
 */
export async function getHarvestingProducts(options = {}) {
  return await getProductsByCategory('harvesting', options);
}

/**
 * Get container products
 */
export async function getContainerProducts(options = {}) {
  return await getProductsByCategory('containers', options);
}

/**
 * Get pest management products
 */
export async function getPestManagementProducts(options = {}) {
  return await getProductsByCategory('pest-management', options);
}

/**
 * Get product by ID
 */
export async function getProductById(productId) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  try {
    console.log(`🔄 Fetching product: ${productId}`);
    
    const response = await apiClient.get(`/products/${productId}`);
    console.log('✅ Product fetched successfully:', response.data);
    
    return extractData(response);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    throw error;
  }
}

/**
 * Alias for getProductById (for backward compatibility)
 */
export async function getProduct(productId) {
  return await getProductById(productId);
}

/**
 * Create a new product
 */
export async function createProduct(productData) {
  try {
    console.log('🔄 Creating product:', productData);
    
    // Validate required fields
    if (!productData || typeof productData !== 'object') {
      throw new Error("Product data is required");
    }
    
    if (!productData.name) {
      throw new Error("Product name is required");
    }
    
    if (productData.name.length < 2 || productData.name.length > 200) {
      throw new Error('Product name must be between 2-200 characters');
    }
    
    if (!productData.category) {
      throw new Error("Product category is required");
    }
    
    if (!['irrigation', 'harvesting', 'containers', 'pest-management'].includes(productData.category)) {
      throw new Error('Invalid category. Must be one of: irrigation, harvesting, containers, pest-management');
    }
    
    if (productData.price === undefined || productData.price === null) {
      throw new Error("Product price is required");
    }
    
    if (typeof productData.price !== 'number' || productData.price < 0) {
      throw new Error('Price must be a non-negative number');
    }
    
    if (productData.quantity === undefined || productData.quantity === null) {
      throw new Error("Product quantity is required");
    }
    
    if (!Number.isInteger(productData.quantity) || productData.quantity < 0) {
      throw new Error('Quantity must be a non-negative integer');
    }
    
    if (!productData.unit) {
      throw new Error("Product unit is required");
    }
    
    if (!['kg', 'g', 'lb', 'oz', 'ton', 'liter', 'ml', 'gallon', 'piece', 'dozen', 'box', 'bag', 'bottle', 'can', 'packet'].includes(productData.unit)) {
      throw new Error('Invalid unit');
    }
    
    if (!productData.supplier_id) {
      throw new Error('Supplier ID is required');
    }
    
    const response = await apiClient.post('/products', productData);
    console.log('✅ Product created successfully:', response.data);
    
    return extractData(response);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    throw error;
  }
}

/**
 * Update product
 */
export async function updateProduct(productId, updateData) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  if (!updateData || typeof updateData !== 'object') {
    throw new Error("Valid product data is required");
  }
  
  try {
    console.log(`🔄 Updating product ${productId}:`, updateData);
    
    const response = await apiClient.put(`/products/${productId}`, updateData);
    console.log('✅ Product updated successfully:', response.data);
    
    return extractData(response);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  
  try {
    console.log(`🔄 Deleting product: ${productId}`);
    
    const response = await apiClient.delete(`/products/${productId}`);
    console.log('✅ Product deleted successfully');
    
    return extractData(response);
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    throw error;
  }
}

/**
 * Update product stock
 */
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
  
  try {
    console.log(`🔄 Updating stock for product ${productId}: ${quantity}`);
    
    const response = await apiClient.put(`/products/${productId}/stock`, { quantity });
    console.log('✅ Product stock updated successfully');
    
    return extractData(response);
  } catch (error) {
    console.error('❌ Error updating product stock:', error);
    throw error;
  }
}

/**
 * Search products
 */
export async function searchProducts(query, options = {}) {
  try {
    console.log(`🔄 Searching products with query: "${query}"`);
    
    const params = {
      ...options,
      search: query
    };
    
    const response = await apiClient.get('/products', { params });
    console.log('✅ Product search completed:', response.data);
    
    return extractPaginatedData(response);
  } catch (error) {
    console.error('❌ Error searching products:', error);
    throw error;
  }
}