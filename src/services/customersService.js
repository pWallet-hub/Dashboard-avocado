import apiClient from './apiClient';

// Get all customers with filters
export const getCustomers = async (params = {}) => {
  try {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customers');
  }
};

// Get customers by shop
export const getCustomersByShop = async (shopId, params = {}) => {
  try {
    const response = await apiClient.get('/customers', {
      params: { ...params, shop_id: shopId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shop customers');
  }
};

// Get customer by ID
export const getCustomerById = async (customerId) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer');
  }
};

// Create new customer
export const createCustomer = async (customerData) => {
  try {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create customer');
  }
};

// Update customer
export const updateCustomer = async (customerId, customerData) => {
  try {
    const response = await apiClient.put(`/customers/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update customer');
  }
};

// Delete customer
export const deleteCustomer = async (customerId) => {
  try {
    const response = await apiClient.delete(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete customer');
  }
};

// Get customer orders
export const getCustomerOrders = async (customerId, params = {}) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/orders`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer orders');
  }
};

// Get customer statistics
export const getCustomerStatistics = async (customerId) => {
  try {
    const response = await apiClient.get(`/customers/${customerId}/statistics`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch customer statistics');
  }
};

// Search customers
export const searchCustomers = async (searchTerm, params = {}) => {
  try {
    const response = await apiClient.get('/customers/search', {
      params: { ...params, q: searchTerm }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to search customers');
  }
};