// Save or update suppliers in backend API
export async function saveSuppliers(suppliers) {
  if (!Array.isArray(suppliers)) throw new Error('Suppliers must be an array');
  // This assumes a bulk update endpoint exists. Adjust as needed for your API.
  const response = await apiClient.put('/market/suppliers/bulk', suppliers);
  return extractData(response);
}
export async function getProducts({ page, limit, category, supplier_id, status, price_min, price_max, in_stock, search } = {}) {
  const params = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (category) params.category = category;
  if (supplier_id) params.supplier_id = supplier_id;
  if (status) params.status = status;
  if (price_min) params.price_min = price_min;
  if (price_max) params.price_max = price_max;
  if (typeof in_stock !== 'undefined') params.in_stock = in_stock;
  if (search) params.search = search;

  const response = await apiClient.get('/products', { params });
  return extractData(response);
}
// Stub for syncAllFarmerData to prevent import errors
export function syncAllFarmerData() {
  // No sync needed; API-based only
  return true;
}
// Fetch market transactions from backend API
export async function getMarketTransactions() {
  const response = await apiClient.get('/market/transactions');
  return extractData(response);
}
// Stub for initializeStorage to prevent import errors
export function initializeStorage() {
  // No initialization needed; API-based only
  return true;
}
import apiClient, { extractData } from './apiClient';

// Supplier management
export async function getSuppliers() {
  try {
    const response = await apiClient.get('/market/suppliers');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
}

export async function createSupplier(supplierData) {
  if (!supplierData || typeof supplierData !== 'object') {
    throw new Error('Valid supplier data is required');
  }
  
  try {
    const response = await apiClient.post('/market/suppliers', supplierData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
}

export async function updateSupplier(supplierId, supplierData) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }
  
  if (!supplierData || typeof supplierData !== 'object') {
    throw new Error('Valid supplier data is required');
  }
  
  try {
    const response = await apiClient.put(`/market/suppliers/${supplierId}`, supplierData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
}

export async function deleteSupplier(supplierId) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }
  
  try {
    const response = await apiClient.delete(`/market/suppliers/${supplierId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
}

// Shop inventory management
export async function getShopInventory() {
  try {
    const response = await apiClient.get('/market/inventory');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching shop inventory:', error);
    throw error;
  }
}

export async function addToShopInventory(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Valid inventory item data is required');
  }
  
  try {
    const response = await apiClient.post('/market/inventory', item);
    return extractData(response);
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    throw error;
  }
}

export async function updateShopInventory(id, item) {
  if (!id) {
    throw new Error('Inventory item ID is required');
  }
  
  if (!item || typeof item !== 'object') {
    throw new Error('Valid inventory item data is required');
  }
  
  try {
    const response = await apiClient.put(`/market/inventory/${id}`, item);
    return extractData(response);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id) {
  if (!id) {
    throw new Error('Inventory item ID is required');
  }
  
  try {
    const response = await apiClient.delete(`/market/inventory/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

// Order management
export async function getOrders() {
  try {
    const response = await apiClient.get('/market/orders');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function createOrder(orderData) {
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('Valid order data is required');
  }
  
  try {
    const response = await apiClient.post('/market/orders', orderData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrder(id, order) {
  if (!id) {
    throw new Error('Order ID is required');
  }
  
  if (!order || typeof order !== 'object') {
    throw new Error('Valid order data is required');
  }
  
  try {
    const response = await apiClient.put(`/market/orders/${id}`, order);
    return extractData(response);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

export async function deleteOrder(id) {
  if (!id) {
    throw new Error('Order ID is required');
  }
  
  try {
    const response = await apiClient.delete(`/market/orders/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// Farmer products
export async function getFarmerProducts(farmerId) {
  try {
    const params = farmerId ? { farmerId } : {};
    const response = await apiClient.get('/market/products', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    throw error;
  }
}

export async function addFarmerProduct(product) {
  if (!product || typeof product !== 'object') {
    throw new Error('Valid product data is required');
  }
  
  try {
    const response = await apiClient.post('/market/products', product);
    return extractData(response);
  } catch (error) {
    console.error('Error adding farmer product:', error);
    throw error;
  }
}

export async function updateFarmerProduct(id, product) {
  if (!id) {
    throw new Error('Product ID is required');
  }
  
  if (!product || typeof product !== 'object') {
    throw new Error('Valid product data is required');
  }
  
  try {
    const response = await apiClient.put(`/market/products/${id}`, product);
    return extractData(response);
  } catch (error) {
    console.error('Error updating farmer product:', error);
    throw error;
  }
}

export async function deleteFarmerProduct(id) {
  if (!id) {
    throw new Error('Product ID is required');
  }
  
  try {
    const response = await apiClient.delete(`/market/products/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting farmer product:', error);
    throw error;
  }
}

// Transactions
export async function getFarmerToShopTransactions() {
  try {
    const response = await apiClient.get('/market/transactions');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export async function createTransaction(transactionData) {
  if (!transactionData || typeof transactionData !== 'object') {
    throw new Error('Valid transaction data is required');
  }
  
  try {
    const response = await apiClient.post('/market/transactions', transactionData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Shop orders
export async function getShopOrders() {
  try {
    const response = await apiClient.get('/market/shop-orders');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching shop orders:', error);
    throw error;
  }
}

export async function createShopOrder(orderData) {
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('Valid order data is required');
  }
  
  try {
    const response = await apiClient.post('/market/shop-orders', orderData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating shop order:', error);
    throw error;
  }
}

// Shop customers
export async function getShopCustomers() {
  try {
    const response = await apiClient.get('/market/customers');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

export async function createCustomer(customerData) {
  if (!customerData || typeof customerData !== 'object') {
    throw new Error('Valid customer data is required');
  }
  
  try {
    const response = await apiClient.post('/market/customers', customerData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

export async function updateCustomer(id, customerData) {
  if (!id) {
    throw new Error('Customer ID is required');
  }
  
  if (!customerData || typeof customerData !== 'object') {
    throw new Error('Valid customer data is required');
  }
  
  try {
    const response = await apiClient.put(`/market/customers/${id}`, customerData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

export async function deleteCustomer(id) {
  if (!id) {
    throw new Error('Customer ID is required');
  }
  
  try {
    const response = await apiClient.delete(`/market/customers/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

// Sales data
export async function getSalesData() {
  try {
    const response = await apiClient.get('/market/sales');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}

export async function addSalesData(salesData) {
  if (!salesData || typeof salesData !== 'object') {
    throw new Error('Valid sales data is required');
  }
  
  try {
    const response = await apiClient.post('/market/sales', salesData);
    return extractData(response);
  } catch (error) {
    console.error('Error adding sales data:', error);
    throw error;
  }
}

// Utility functions
export function calculateExpiryDate(harvestDate, category) {
  if (!harvestDate) return '';
  
  const date = new Date(harvestDate);
  
  // Different expiry times based on category
  let daysToAdd = 7; // Default to 1 week
  
  switch (category) {
    case 'Hass Avocados':
    case 'Fuerte Avocados':
    case 'Bacon Avocados':
    case 'Zutano Avocados':
      daysToAdd = 14; // 2 weeks for avocados
      break;
    case 'Avocado Seedlings':
      daysToAdd = 30; // 1 month for seedlings
      break;
    case 'Fertilizers':
      daysToAdd = 365; // 1 year for fertilizers
      break;
    case 'Pesticides':
      daysToAdd = 180; // 6 months for pesticides
      break;
    default:
      daysToAdd = 7; // 1 week default
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}