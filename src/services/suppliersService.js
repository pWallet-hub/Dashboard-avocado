import apiClient from './apiClient';

// Get all suppliers with filters
export const getSuppliers = async (params = {}) => {
  try {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch suppliers');
  }
};

// Get supplier by ID
export const getSupplierById = async (supplierId) => {
  try {
    const response = await apiClient.get(`/suppliers/${supplierId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier');
  }
};

// Create new supplier
export const createSupplier = async (supplierData) => {
  try {
    const response = await apiClient.post('/suppliers', supplierData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create supplier');
  }
};

// Update supplier
export const updateSupplier = async (supplierId, supplierData) => {
  try {
    const response = await apiClient.put(`/suppliers/${supplierId}`, supplierData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update supplier');
  }
};

// Delete supplier
export const deleteSupplier = async (supplierId) => {
  try {
    const response = await apiClient.delete(`/suppliers/${supplierId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete supplier');
  }
};

// Get supplier products
export const getSupplierProducts = async (supplierId, params = {}) => {
  try {
    const response = await apiClient.get(`/suppliers/${supplierId}/products`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier products');
  }
};

// Get supplier orders
export const getSupplierOrders = async (supplierId, params = {}) => {
  try {
    const response = await apiClient.get(`/suppliers/${supplierId}/orders`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch supplier orders');
  }
};

// Get suppliers by location
export const getSuppliersByLocation = async (province, district = null) => {
  try {
    const params = { province };
    if (district) params.district = district;
    
    const response = await apiClient.get('/suppliers/by-location', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch suppliers by location');
  }
};