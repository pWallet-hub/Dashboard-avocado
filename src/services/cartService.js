import apiClient, { extractData } from './apiClient';

/**
 * Cart Service
 * Implements endpoints from API documentation:
 * Base Path: /cart
 * - GET    /cart              Get the current user's cart
 * - DELETE /cart              Clear all items from the cart
 * - POST   /cart/checkout     Checkout — converts cart to an Order
 * - POST   /cart/items        Add a product to the cart (or increment quantity)
 * - PUT    /cart/items/{id}   Update quantity of a cart item
 * - DELETE /cart/items/{id}   Remove a single item from the cart
 */

// Get the current user's cart
export async function getCart() {
  try {
    const response = await apiClient.get('/cart');
    return extractData(response);
  } catch (error) {
    console.error('Error in getCart:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load cart');
  }
}

// Clear all items from the cart
export async function clearCart() {
  try {
    const response = await apiClient.delete('/cart');
    return extractData(response);
  } catch (error) {
    console.error('Error in clearCart:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to clear cart');
  }
}

// Add a product to the cart (or increment quantity if already present)
export async function addCartItem(productId, quantity = 1) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('Quantity must be a positive integer');
  }

  try {
    const response = await apiClient.post('/cart/items', { product_id: productId, quantity });
    return extractData(response);
  } catch (error) {
    console.error('Error in addCartItem:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to add item to cart');
  }
}

// Update quantity of a cart item
export async function updateCartItem(productId, quantity) {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error('Quantity must be a non-negative integer');
  }

  try {
    const response = await apiClient.put(`/cart/items/${productId}`, { quantity });
    return extractData(response);
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update cart item');
  }
}

// Remove a single item from the cart
export async function removeCartItem(productId) {
  if (!productId) {
    throw new Error('Product ID is required');
  }

  try {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to remove cart item');
  }
}

// Checkout — converts the current cart into an Order
export async function checkout(notes) {
  try {
    const payload = {};
    if (notes) payload.notes = notes;

    const response = await apiClient.post('/cart/checkout', payload);
    return extractData(response);
  } catch (error) {
    console.error('Error in checkout:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to checkout cart');
  }
}

export default {
  getCart,
  clearCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  checkout,
};
