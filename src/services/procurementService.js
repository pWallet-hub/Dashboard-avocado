import apiClient, { extractData } from './apiClient';

// List purchase orders with supplier details, paginated (admin/shop_manager)
export async function listPurchaseOrders(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.supplier_id) params.supplier_id = options.supplier_id;

    const response = await apiClient.get('/procurement', { params });
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
    console.error('Error in listPurchaseOrders:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load purchase orders');
  }
}

// Create a draft purchase order with line items (admin/shop_manager)
export async function createPurchaseOrder(poData) {
  try {
    if (!poData || typeof poData !== 'object') {
      throw new Error('Purchase order data is required');
    }

    if (!poData.supplier_id) {
      throw new Error('Supplier is required');
    }

    if (!poData.items || !Array.isArray(poData.items) || poData.items.length === 0) {
      throw new Error('At least one line item is required');
    }

    for (const item of poData.items) {
      if (!item.product_name) {
        throw new Error('Each item requires a product name');
      }
      if (item.quantity_ordered === undefined || item.quantity_ordered === null || item.quantity_ordered <= 0) {
        throw new Error('Each item requires a valid ordered quantity');
      }
      if (item.unit_price === undefined || item.unit_price === null || item.unit_price < 0) {
        throw new Error('Each item requires a valid unit price');
      }
    }

    const response = await apiClient.post('/procurement', poData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createPurchaseOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create purchase order');
  }
}

// Get a purchase order with items, supplier, and goods receipts (admin/shop_manager)
export async function getPurchaseOrder(poId) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    const response = await apiClient.get(`/procurement/${poId}`);
    const extractedData = extractData(response);

    if (extractedData && extractedData.data) {
      return extractedData.data;
    } else if (extractedData && typeof extractedData === 'object') {
      return extractedData;
    } else {
      throw new Error('Invalid purchase order data received');
    }
  } catch (error) {
    console.error('Error in getPurchaseOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get purchase order');
  }
}

// Update a purchase order — only allowed while status is draft (admin/shop_manager)
export async function updatePurchaseOrder(poId, poData) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    if (!poData || typeof poData !== 'object') {
      throw new Error('Valid purchase order data is required');
    }

    const response = await apiClient.put(`/procurement/${poId}`, poData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updatePurchaseOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update purchase order');
  }
}

// Submit a draft purchase order for approval: draft -> submitted (admin/shop_manager)
export async function submitPurchaseOrder(poId) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    const response = await apiClient.put(`/procurement/${poId}/submit`);
    return extractData(response);
  } catch (error) {
    console.error('Error in submitPurchaseOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to submit purchase order');
  }
}

// Approve a submitted purchase order: submitted -> approved (admin only)
export async function approvePurchaseOrder(poId) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    const response = await apiClient.put(`/procurement/${poId}/approve`);
    return extractData(response);
  } catch (error) {
    console.error('Error in approvePurchaseOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to approve purchase order');
  }
}

// Cancel a purchase order (admin only). Cannot cancel once fully received.
export async function cancelPurchaseOrder(poId) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    const response = await apiClient.put(`/procurement/${poId}/cancel`);
    return extractData(response);
  } catch (error) {
    console.error('Error in cancelPurchaseOrder:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to cancel purchase order');
  }
}

// List goods receipts recorded against a purchase order (admin/shop_manager)
export async function listGoodsReceipts(poId) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    const response = await apiClient.get(`/procurement/${poId}/receipts`);
    const extractedData = extractData(response);

    if (Array.isArray(extractedData)) {
      return extractedData;
    } else if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    }
    return [];
  } catch (error) {
    console.error('Error in listGoodsReceipts:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load goods receipts');
  }
}

// Record a goods receipt against a purchase order and increment product stock (admin/shop_manager)
export async function receiveGoods(poId, receiptData) {
  try {
    if (!poId) {
      throw new Error('Purchase order ID is required');
    }

    if (!receiptData || typeof receiptData !== 'object') {
      throw new Error('Receipt data is required');
    }

    if (!receiptData.items || !Array.isArray(receiptData.items) || receiptData.items.length === 0) {
      throw new Error('At least one received item is required');
    }

    for (const item of receiptData.items) {
      if (!item.product_name) {
        throw new Error('Each received item requires a product name');
      }
      if (item.quantity === undefined || item.quantity === null || item.quantity <= 0) {
        throw new Error('Each received item requires a valid quantity');
      }
      if (item.unit_price === undefined || item.unit_price === null || item.unit_price < 0) {
        throw new Error('Each received item requires a valid unit price');
      }
    }

    const response = await apiClient.post(`/procurement/${poId}/receive`, receiptData);
    return extractData(response);
  } catch (error) {
    console.error('Error in receiveGoods:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to record goods receipt');
  }
}
