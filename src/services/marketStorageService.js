import apiClient, { extractData } from './apiClient';

// Save or update suppliers in backend API
export async function saveSuppliers(suppliers) {
  if (!Array.isArray(suppliers)) throw new Error('Suppliers must be an array');
  const response = await apiClient.put('/suppliers/bulk', { suppliers });
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
export async function getMarketTransactions(params = {}) {
  const response = await apiClient.get('/transactions', { params });
  return extractData(response);
}

// Create a transaction
export async function createTransaction(transactionData) {
  if (!transactionData || typeof transactionData !== 'object') {
    throw new Error('Valid transaction data is required');
  }
  const required = ['payer_id', 'payee_id', 'amount', 'type', 'payment_method'];
  const missing = required.filter((field) => transactionData[field] === undefined || transactionData[field] === null || transactionData[field] === '');
  if (missing.length > 0) {
    throw new Error(`Missing required transaction fields: ${missing.join(', ')}`);
  }

  try {
    const response = await apiClient.post('/transactions', transactionData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Financial summary (admin)
export async function getTransactionsSummary(params = {}) {
  try {
    const response = await apiClient.get('/transactions/summary', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching transactions summary:', error);
    throw error;
  }
}

// Get a single transaction by ID
export async function getTransactionById(transactionId) {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }

  try {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

// Update transaction status (admin)
export async function updateTransactionStatus(transactionId, status) {
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }
  if (!status) {
    throw new Error('Status is required');
  }
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'processing'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    const response = await apiClient.put(`/transactions/${transactionId}/status`, { status });
    return extractData(response);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}
// Stub for initializeStorage to prevent import errors
export function initializeStorage() {
  // No initialization needed; API-based only
  return true;
}

// Supplier management
export async function getSuppliers() {
  try {
    const response = await apiClient.get('/suppliers');
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
    const response = await apiClient.post('/suppliers', supplierData);
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
    const response = await apiClient.put(`/suppliers/${supplierId}`, supplierData);
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
    const response = await apiClient.delete(`/suppliers/${supplierId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
}

export async function getSupplierById(supplierId) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }

  try {
    const response = await apiClient.get(`/suppliers/${supplierId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw error;
  }
}

export async function getSupplierProducts(supplierId) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }

  try {
    const response = await apiClient.get(`/suppliers/${supplierId}/products`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    throw error;
  }
}

export async function getSupplierEvaluations(supplierId) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }

  try {
    const response = await apiClient.get(`/suppliers/${supplierId}/evaluations`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching supplier evaluations:', error);
    throw error;
  }
}

export async function createSupplierEvaluation(supplierId, evaluationData) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }

  if (!evaluationData || typeof evaluationData !== 'object') {
    throw new Error('Valid evaluation data is required');
  }

  if (!evaluationData.rating || evaluationData.rating < 1 || evaluationData.rating > 5) {
    throw new Error('Rating is required and must be between 1 and 5');
  }

  try {
    const response = await apiClient.post(`/suppliers/${supplierId}/evaluations`, evaluationData);
    return extractData(response);
  } catch (error) {
    console.error('Error submitting supplier evaluation:', error);
    throw error;
  }
}

export async function getSupplierHistory(supplierId) {
  if (!supplierId) {
    throw new Error('Supplier ID is required');
  }

  try {
    const response = await apiClient.get(`/suppliers/${supplierId}/history`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching supplier history:', error);
    throw error;
  }
}

// Shop inventory management
export async function getShopInventory() {
  try {
    const response = await apiClient.get('/inventory');
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
    const response = await apiClient.post('/inventory', item);
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
    const response = await apiClient.put(`/inventory/${id}`, item);
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
    const response = await apiClient.delete(`/inventory/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

export async function getLowStockInventory(threshold) {
  try {
    const params = {};
    if (threshold !== undefined && threshold !== null) params.threshold = threshold;
    const response = await apiClient.get('/inventory/low-stock', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching low-stock inventory:', error);
    throw error;
  }
}

export async function getOutOfStockInventory() {
  try {
    const response = await apiClient.get('/inventory/out-of-stock');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching out-of-stock inventory:', error);
    throw error;
  }
}

export async function getInventorySummary() {
  try {
    const response = await apiClient.get('/inventory/summary');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    throw error;
  }
}

export async function getInventoryItemById(id) {
  if (!id) {
    throw new Error('Inventory item ID is required');
  }

  try {
    const response = await apiClient.get(`/inventory/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
}

export async function getInventoryItemHistory(id, params = {}) {
  if (!id) {
    throw new Error('Inventory item ID is required');
  }

  try {
    const response = await apiClient.get(`/inventory/${id}/history`, { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching inventory item history:', error);
    throw error;
  }
}

export async function restockInventoryItem(id, quantity, notes) {
  if (!id) {
    throw new Error('Inventory item ID is required');
  }
  if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Quantity is required and must be a positive integer');
  }

  try {
    const payload = { quantity };
    if (notes) payload.notes = notes;
    const response = await apiClient.put(`/inventory/${id}/restock`, payload);
    return extractData(response);
  } catch (error) {
    console.error('Error restocking inventory item:', error);
    throw error;
  }
}

// Farmer products (best-effort: Product records filtered by supplier_id)
export async function getFarmerProducts(farmerId) {
  try {
    const params = farmerId ? { supplier_id: farmerId } : {};
    const response = await apiClient.get('/products', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    throw error;
  }
}

// Transactions
export async function getFarmerToShopTransactions() {
  try {
    const response = await apiClient.get('/transactions');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Shop customers
export async function getShopCustomers() {
  try {
    const response = await apiClient.get('/customers');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

export async function getCustomerById(id) {
  if (!id) {
    throw new Error('Customer ID is required');
  }

  try {
    const response = await apiClient.get(`/customers/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

export async function createCustomer(customerData) {
  if (!customerData || typeof customerData !== 'object') {
    throw new Error('Valid customer data is required');
  }

  try {
    const response = await apiClient.post('/customers', customerData);
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
    const response = await apiClient.put(`/customers/${id}`, customerData);
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
    const response = await apiClient.delete(`/customers/${id}`);
    return extractData(response);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

export async function getCustomerOrders(id) {
  if (!id) {
    throw new Error('Customer ID is required');
  }

  const response = await apiClient.get(`/customers/${id}/orders`);
  return extractData(response);
}

export async function getCustomerStatistics(id) {
  if (!id) {
    throw new Error('Customer ID is required');
  }

  const response = await apiClient.get(`/customers/${id}/statistics`);
  return extractData(response);
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
