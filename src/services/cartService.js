// Cart Service for managing shopping cart functionality
class CartService {
  static STORAGE_KEY = 'avocado_cart';
  static CART_EVENT = 'cartUpdated';
  static listeners = new Set();

  // Initialize cart service
  static init() {
    // Ensure cart exists in localStorage
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.saveCartItems([]);
    }
  }

  // Add event listener for cart updates
  static addListener(callback) {
    this.listeners.add(callback);
  }

  // Remove event listener
  static removeListener(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners of cart changes
  static notifyListeners() {
    const summary = this.getCartSummary();
    this.listeners.forEach(callback => {
      try {
        callback(summary);
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  }

  // Get cart items from localStorage
  static getCartItems() {
    try {
      const cart = localStorage.getItem(this.STORAGE_KEY);
      const items = cart ? JSON.parse(cart) : [];
      
      // Validate cart items structure
      return items.filter(item => 
        item && 
        typeof item === 'object' && 
        item.id && 
        item.name && 
        typeof item.price === 'number' && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );
    } catch (error) {
      console.error('Error getting cart items:', error);
      // Reset cart if corrupted
      this.saveCartItems([]);
      return [];
    }
  }

  // Save cart items to localStorage
  static saveCartItems(items) {
    try {
      // Validate items before saving
      const validItems = items.filter(item => 
        item && 
        typeof item === 'object' && 
        item.id && 
        item.name && 
        typeof item.price === 'number' && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validItems));
      this.notifyListeners();
      return validItems;
    } catch (error) {
      console.error('Error saving cart items:', error);
      throw new Error('Failed to save cart items');
    }
  }

  // Add item to cart
  static addToCart(product, quantity = 1) {
    try {
      this.init(); // Ensure cart is initialized
      const cartItems = this.getCartItems();
      const productId = product._id || product.id;
      
      if (!productId || !product.name || !product.price) {
        throw new Error('Invalid product data');
      }

      const existingItemIndex = cartItems.findIndex(item => item.id === productId);

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].updatedAt = new Date().toISOString();
      } else {
        // Parse price safely
        let price;
        if (typeof product.price === 'string') {
          price = parseFloat(product.price.replace(/,/g, ''));
        } else {
          price = parseFloat(product.price);
        }

        let originalPrice = null;
        if (product.originalPrice) {
          if (typeof product.originalPrice === 'string') {
            originalPrice = parseFloat(product.originalPrice.replace(/,/g, ''));
          } else {
            originalPrice = parseFloat(product.originalPrice);
          }
        }

        // Add new item to cart
        const cartItem = {
          id: productId,
          name: product.name,
          price: price,
          originalPrice: originalPrice,
          image: product.image || '',
          quantity: quantity,
          category: product.category || 'general',
          inStock: product.inStock !== false,
          discount: product.discount || 0,
          capacity: product.capacity || '',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        cartItems.push(cartItem);
      }

      return this.saveCartItems(cartItems);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  static removeFromCart(productId) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      const cartItems = this.getCartItems();
      const updatedItems = cartItems.filter(item => item.id !== productId);
      return this.saveCartItems(updatedItems);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Update item quantity
  static updateQuantity(productId, quantity) {
    try {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      if (typeof quantity !== 'number' || quantity < 0) {
        throw new Error('Invalid quantity');
      }

      const cartItems = this.getCartItems();
      const itemIndex = cartItems.findIndex(item => item.id === productId);

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          return this.removeFromCart(productId);
        } else {
          cartItems[itemIndex].quantity = quantity;
          cartItems[itemIndex].updatedAt = new Date().toISOString();
          return this.saveCartItems(cartItems);
        }
      }

      return cartItems;
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  // Clear entire cart
  static clearCart() {
    try {
      return this.saveCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Backup cart to prevent data loss
  static backupCart() {
    try {
      const cartItems = this.getCartItems();
      const backup = {
        items: cartItems,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(this.STORAGE_KEY + '_backup', JSON.stringify(backup));
      return backup;
    } catch (error) {
      console.error('Error backing up cart:', error);
    }
  }

  // Restore cart from backup
  static restoreCart() {
    try {
      const backup = localStorage.getItem(this.STORAGE_KEY + '_backup');
      if (backup) {
        const backupData = JSON.parse(backup);
        if (backupData.items && Array.isArray(backupData.items)) {
          return this.saveCartItems(backupData.items);
        }
      }
      return [];
    } catch (error) {
      console.error('Error restoring cart:', error);
      return [];
    }
  }

  // Get cart summary
  static getCartSummary() {
    try {
      const items = this.getCartItems();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalDiscount = items.reduce((sum, item) => {
        if (item.originalPrice && item.discount) {
          const discountAmount = (item.originalPrice - item.price) * item.quantity;
          return sum + discountAmount;
        }
        return sum;
      }, 0);

      return {
        items,
        totalItems,
        subtotal,
        totalDiscount,
        total: subtotal,
        isEmpty: items.length === 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalDiscount: 0,
        total: 0,
        isEmpty: true,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Check if item is in cart
  static isInCart(productId) {
    try {
      if (!productId) return false;
      const cartItems = this.getCartItems();
      return cartItems.some(item => item.id === productId);
    } catch (error) {
      console.error('Error checking if item is in cart:', error);
      return false;
    }
  }

  // Get item quantity in cart
  static getItemQuantity(productId) {
    try {
      if (!productId) return 0;
      const cartItems = this.getCartItems();
      const item = cartItems.find(item => item.id === productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Error getting item quantity:', error);
      return 0;
    }
  }

  // Get cart statistics
  static getCartStats() {
    try {
      const items = this.getCartItems();
      const categories = [...new Set(items.map(item => item.category))];
      const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const avgItemPrice = items.length > 0 ? totalValue / items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      
      return {
        totalItems: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalValue,
        avgItemPrice,
        categories,
        oldestItem: items.length > 0 ? Math.min(...items.map(item => new Date(item.addedAt).getTime())) : null,
        newestItem: items.length > 0 ? Math.max(...items.map(item => new Date(item.addedAt).getTime())) : null
      };
    } catch (error) {
      console.error('Error getting cart stats:', error);
      return null;
    }
  }

  // Validate cart integrity
  static validateCart() {
    try {
      const items = this.getCartItems();
      const issues = [];
      
      items.forEach((item, index) => {
        if (!item.id) issues.push(`Item ${index}: Missing ID`);
        if (!item.name) issues.push(`Item ${index}: Missing name`);
        if (typeof item.price !== 'number' || item.price < 0) issues.push(`Item ${index}: Invalid price`);
        if (typeof item.quantity !== 'number' || item.quantity <= 0) issues.push(`Item ${index}: Invalid quantity`);
      });
      
      return {
        isValid: issues.length === 0,
        issues,
        itemCount: items.length
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        isValid: false,
        issues: ['Cart validation failed'],
        itemCount: 0
      };
    }
  }
}

export default CartService;
