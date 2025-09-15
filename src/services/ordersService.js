import apiClient, { extractData } from './apiClient';

// Get all orders
export async function listOrders(options = {}) {
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
  return extractData(response);
}

// Get order by ID
export async function getOrder(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  
  const response = await apiClient.get(`/orders/${orderId}`);
  return extractData(response);
}

// Create new order
export async function createOrder(orderData) {
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
}

// Update order
export async function updateOrder(orderId, orderData) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  
  if (!orderData || typeof orderData !== 'object') {
    throw new Error("Valid order data is required");
  }
  
  const response = await apiClient.put(`/orders/${orderId}`, orderData);
  return extractData(response);
}

// Delete order
export async function deleteOrder(orderId) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  
  const response = await apiClient.delete(`/orders/${orderId}`);
  return extractData(response);
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  if (!orderId) {
    throw new Error("Order ID is required");
  }
  
  if (!status || typeof status !== 'string') {
    throw new Error("Valid status is required");
  }
  
  const response = await apiClient.put(`/orders/${orderId}/status`, { status });
  return extractData(response);
}

// Get orders for a specific user
export async function getOrdersForUser(userId, options = {}) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  
  const response = await apiClient.get(`/orders/user/${userId}`, { params });
  return extractData(response);
}