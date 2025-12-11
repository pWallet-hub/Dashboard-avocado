import apiClient from './apiClient';

// Get all orders
export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order');
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

// Update order
export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}`, orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order');
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const response = await apiClient.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete order');
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

// Get orders for a specific user
export const getUserOrders = async (userId, params = {}) => {
  try {
    const response = await apiClient.get(`/orders/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user orders');
  }
};