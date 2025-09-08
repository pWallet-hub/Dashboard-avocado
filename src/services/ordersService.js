import apiClient from './apiClient';

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
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
}

// Get order by ID
export async function getOrder(orderId) {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
}

// Create new order
export async function createOrder(orderData) {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
}

// Update order
export async function updateOrder(orderId, orderData) {
  try {
    const response = await apiClient.put(`/orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order');
  }
}

// Delete order
export async function deleteOrder(orderId) {
  try {
    const response = await apiClient.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete order');
  }
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
}

// Get orders for a specific user
export async function getOrdersForUser(userId, options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    
    const response = await apiClient.get(`/orders/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders for user');
  }
}