import apiClient, { extractData } from './apiClient';

// Get all orders
export async function listOrders(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.customer_id) params.customer_id = options.customer_id;
    if (options.status) params.status = options.status;
    if (options.payment_status) params.payment_status = options.payment_status;
    if (options.date_from) params.date_from = options.date_from;
    if (options.date_to) params.date_to = options.date_to;
    if (options.amount_min) params.amount_min = options.amount_min;
    if (options.amount_max) params.amount_max = options.amount_max;
    if (options.search) params.search = options.search;
    
    const response = await apiClient.get('/orders', { params });
    const extractedData = extractData(response);
    
    // Handle different response structures
    if (extractedData && extractedData.data) {
      // Standard API response with data property
      return {
        data: Array.isArray(extractedData.data) ? extractedData.data : [],
        pagination: extractedData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.data ? extractedData.data.length : 0,
          itemsPerPage: options.limit || 10
        }
      };
    } else if (Array.isArray(extractedData)) {
      // Direct array response
      return {
        data: extractedData,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.length,
          itemsPerPage: options.limit || 10
        }
      };
    } else {
      // Unexpected response structure
      console.warn('Unexpected response structure:', extractedData);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: options.limit || 10
        }
      };
    }
  } catch (error) {
    console.error('Error in listOrders:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load orders');
  }
}

// Get order by ID
export async function getOrder(orderId) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    const response = await apiClient.get(`/orders/${orderId}`);
    const extractedData = extractData(response);
    
    // Handle different response structures
    if (extractedData && extractedData.data) {
      return extractedData.data;
    } else if (extractedData && typeof extractedData === 'object') {
      return extractedData;
    } else {
      throw new Error('Invalid order data received');
    }
  } catch (error) {
    console.error('Error in getOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get order');
  }
}

// Create new order
export async function createOrder(orderData) {
  try {
    // Validate required fields
    if (!orderData || typeof orderData !== 'object') {
      throw new Error("Order data is required");
    }
    
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error("At least one item is required in the order");
    }
    
    if (!orderData.shipping_address) {
      throw new Error("Shipping address is required");
    }
    
    // Validate shipping address required fields
    if (!orderData.shipping_address.full_name) {
      throw new Error("Shipping address full name is required");
    }
    
    if (!orderData.shipping_address.phone) {
      throw new Error("Shipping address phone is required");
    }
    
    if (!orderData.shipping_address.street_address) {
      throw new Error("Shipping address street address is required");
    }
    
    if (!orderData.shipping_address.city) {
      throw new Error("Shipping address city is required");
    }
    
    if (!orderData.shipping_address.province) {
      throw new Error("Shipping address province is required");
    }
    
    if (!orderData.shipping_address.country) {
      throw new Error("Shipping address country is required");
    }
    
    const response = await apiClient.post('/orders', orderData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create order');
  }
}

// Update order
export async function updateOrder(orderId, orderData) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    if (!orderData || typeof orderData !== 'object') {
      throw new Error("Valid order data is required");
    }
    
    const response = await apiClient.put(`/orders/${orderId}`, orderData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update order');
  }
}

// Delete order
export async function deleteOrder(orderId) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    const response = await apiClient.delete(`/orders/${orderId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete order');
  }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    if (!status || typeof status !== 'string') {
      throw new Error("Valid status is required");
    }
    
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    const extractedData = extractData(response);
    
    // Handle different response structures
    if (extractedData && extractedData.data) {
      return extractedData.data;
    } else if (extractedData && typeof extractedData === 'object') {
      return extractedData;
    } else {
      return { success: true };
    }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update order status');
  }
}

// Get orders for a specific user
export async function getOrdersForUser(userId, options = {}) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    
    const response = await apiClient.get(`/orders/user/${userId}`, { params });
    const extractedData = extractData(response);
    
    // Handle different response structures
    if (extractedData && extractedData.data) {
      return {
        data: Array.isArray(extractedData.data) ? extractedData.data : [],
        pagination: extractedData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.data ? extractedData.data.length : 0,
          itemsPerPage: options.limit || 10
        }
      };
    } else if (Array.isArray(extractedData)) {
      return {
        data: extractedData,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.length,
          itemsPerPage: options.limit || 10
        }
      };
    } else {
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: options.limit || 10
        }
      };
    }
  } catch (error) {
    console.error('Error in getOrdersForUser:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get user orders');
  }
}