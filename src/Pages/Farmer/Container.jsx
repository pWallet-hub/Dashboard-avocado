import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, CheckCircle, Loader2, Package, Heart, Minus, Plus, Trash2, Smartphone, Filter, Eye } from 'lucide-react';

// Import the real API service
import { getContainerProducts } from '../../services/productsService';

const CartService = {
  cart: [],
  addToCart: (product) => {
    const existingItem = CartService.cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      CartService.cart.push({ ...product, quantity: 1 });
    }
  },
  getCartItems: () => CartService.cart,
  getCartCount: () => CartService.cart.reduce((count, item) => count + item.quantity, 0),
  updateCartQuantity: (productId, quantity) => {
    const item = CartService.cart.find((item) => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        CartService.cart = CartService.cart.filter((item) => item.id !== productId);
      } else {
        item.quantity = quantity;
      }
    }
  },
  removeFromCart: (productId) => {
    CartService.cart = CartService.cart.filter((item) => item.id !== productId);
  },
  getCartSummary: () => {
    const subtotal = CartService.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiscount = CartService.cart.reduce(
      (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
      0
    );
    return {
      isEmpty: CartService.cart.length === 0,
      subtotal,
      totalDiscount,
      total: subtotal - totalDiscount,
    };
  },
  clearCart: () => {
    CartService.cart = [];
  },
};

function ProductDetailsModal({ product, onClose, addToCart, addingToCart, justAdded, toggleLike, likedProducts }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative h-80 overflow-hidden bg-gradient-to-br from-green-50 to-lime-50">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={() => toggleLike(product.id)}
              className={`absolute top-4 left-4 p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                likedProducts.has(product.id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
            </button>
            {!product.inStock && (
              <div className="absolute bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">
                Out of Stock
              </div>
            )}
            {product.originalPrice && (
              <div className="absolute bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                SALE
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>
          
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-green-700">
                {product.price.toLocaleString()} RWF
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} RWF
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700">
              <Package className="w-5 h-5 text-green-600" />
              <span className="font-medium">Capacity: {product.capacity}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features:</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock || addingToCart === product.id || justAdded === product.id}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              !product.inStock 
                ? 'bg-gray-300 cursor-not-allowed' 
                : justAdded === product.id
                ? 'bg-green-600 shadow-green-200'
                : addingToCart === product.id
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-green-300 hover:shadow-xl hover:scale-105'
            }`}
          >
            {addingToCart === product.id ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Adding...</span>
              </>
            ) : justAdded === product.id ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartSidebar({ isCartOpen, setIsCartOpen, cartItems, cartCount, updateCartQuantity, removeFromCart, handleCheckout }) {
  const cartSummary = CartService.getCartSummary();
  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isCartOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900">Shopping Cart</h2>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{cartCount}</span>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {cartSummary.isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-base font-medium text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500">Add some containers!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-14 w-14 rounded-lg object-cover" 
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0NUw5MCA2MEw3NSA3NUw2MCA2MEw3NSA0NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-base font-bold text-green-600">{item.price.toLocaleString()} RWF</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.capacity || `${item.quantity} ${item.unit}`}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!cartSummary.isEmpty && (
            <div className="border-t border-gray-200 p-3 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{cartSummary.subtotal.toLocaleString()} RWF</span>
                </div>
                {cartSummary.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-{cartSummary.totalDiscount.toLocaleString()} RWF</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-1.5">
                  <span>Total</span>
                  <span className="text-green-600">{cartSummary.total.toLocaleString()} RWF</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="w-full flex items-center justify-center space-x-2 rounded-lg py-2.5 px-4 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl" style={{ background: 'linear-gradient(to right, #1F310A, #0f5132)' }}>
                <ShoppingCart className="w-4 h-4" />
                <span>Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContainerProducts() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(CartService.getCartItems());
  const [cartCount, setCartCount] = useState(CartService.getCartCount());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [paymentStep, setPaymentStep] = useState('provider');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [justAdded, setJustAdded] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getContainerProducts({
          page: currentPage,
          limit: 20,
          status: 'available'
        });
        
        let productsData = [];
        
        if (response.data && Array.isArray(response.data)) {
          productsData = response.data;
        } else if (Array.isArray(response)) {
          productsData = response;
        }
        
        const transformedProducts = productsData.map(product => ({
          id: String(product.id),
          name: product.name || 'Unknown Product',
          description: product.description || 'No description available',
          price: Number(product.price) || 0,
          originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
          image: (product.images && product.images.length > 0) 
            ? product.images[0] 
            : product.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA0NUw5MCA2MEw3NSA3NUw2MCA2MEw3NSA0NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+',
          capacity: `${product.quantity || 0} ${product.unit || 'piece'}`,
          inStock: product.status === 'available' && (product.quantity || 0) > 0,
          features: [
            product.description || 'High-quality storage container',
            'Suitable for avocado farms',
            'Durable and efficient',
            'Easy to use'
          ],
          unit: product.unit || 'piece',
          quantity: Number(product.quantity) || 0,
          supplier_id: product.supplier_id || product.supplierId || 'unknown',
          category: product.category || 'containers'
        }));
        
        setProducts(transformedProducts);
        setPagination(response.pagination || {});
        
        if (transformedProducts.length === 0) {
          setError('No container products found.');
        }
        
      } catch (err) {
        console.error('Error fetching container products:', err);
        setError(`Failed to load products: ${err.message}`);
        
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const filteredProducts = filterType === 'all' 
    ? products 
    : products.filter((product) => product.category && product.category.toLowerCase().includes(filterType.toLowerCase()));

  const addToCart = (product) => {
    setAddingToCart(product.id);
    setTimeout(() => {
      CartService.addToCart(product);
      setCartItems(CartService.getCartItems());
      setCartCount(CartService.getCartCount());
      setJustAdded(product.id);
      setAddingToCart(null);
      setTimeout(() => setJustAdded(null), 2000);
    }, 500);
  };

  const updateCartQuantity = (productId, quantity) => {
    CartService.updateCartQuantity(productId, quantity);
    setCartItems(CartService.getCartItems());
    setCartCount(CartService.getCartCount());
  };

  const removeFromCart = (productId) => {
    CartService.removeFromCart(productId);
    setCartItems(CartService.getCartItems());
    setCartCount(CartService.getCartCount());
  };

  const toggleLike = (productId) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleCheckout = () => {
    const cartSummary = CartService.getCartSummary();
    setPendingOrder({
      id: `ORDER-${Date.now()}`,
      items: cartItems,
      totalAmount: cartSummary.total,
    });
    setIsCartOpen(false);
    setShowPaymentModal(true);
  };

  const handleProviderSelect = (provider) => {
    setMobileProvider(provider);
    setPaymentStep('phone');
  };

  const handlePhoneSubmit = () => {
    if (/^07[0-9]{8}$/.test(paymentPhone)) {
      setPaymentStep('confirm');
      setPaymentError('');
    } else {
      setPaymentError('Please enter a valid Rwandan phone number (e.g., 078xxxxxxxx)');
    }
  };

  const handlePaymentComplete = async () => {
    setPaymentProcessing(true);
    setPaymentError('');
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      CartService.clearCart();
      setCartItems([]);
      setCartCount(0);
    }, 2000);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPendingOrder(null);
    setMobileProvider('');
    setPhoneNumber('');
    setPaymentStep('provider');
    setPaymentSuccess(false);
    setPaymentError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-100">
      <div className="bg-green-900 text-white py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" alt="Avocado Society of Rwanda" className="h-8 w-8 rounded-full bg-white p-0.5" />
          <span className="text-xl font-bold tracking-tight">Containers Shop</span>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative flex items-center space-x-2 rounded-lg bg-green-700 px-3 py-1.5 text-white font-semibold shadow hover:bg-green-800 transition-all">
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-green-700 rounded-full px-1.5 py-0.5 text-xs font-bold shadow">{cartCount}</span>
          )}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Available Containers</h2>
            </div>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="plastic">Plastic Containers</option>
              <option value="wooden">Wooden Crates</option>
              <option value="storage">Storage Boxes</option>
              <option value="transport">Transport Containers</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-green-200 overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-green-600" />
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-600">
                <p>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No container products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-green-50 to-lime-50">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                      />
                      <button 
                        onClick={() => toggleLike(product.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
                          likedProducts.has(product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/90 text-gray-600 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      {!product.inStock && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow">
                          Out
                        </div>
                      )}
                      {product.originalPrice && (
                        <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                          SALE
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">{product.name}</h3>
                      
                      <div className="mb-2 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-green-700">
                          {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-600">RWF</span>
                      </div>

                      <div className="mb-2 flex items-center gap-1 text-xs text-gray-600">
                        <Package className="w-3 h-3 text-green-600" />
                        <span className="truncate">{product.capacity}</span>
                      </div>

                      <div className="mt-auto space-y-1.5">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="w-full py-2 rounded-lg font-medium text-green-700 text-xs border border-green-600 hover:bg-green-50 transition-all duration-300 flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock || addingToCart === product.id || justAdded === product.id}
                          className={`w-full py-2 rounded-lg font-medium text-white text-xs shadow transition-all duration-300 flex items-center justify-center gap-1.5 ${
                            !product.inStock 
                              ? 'bg-gray-300 cursor-not-allowed' 
                              : justAdded === product.id
                              ? 'bg-green-600'
                              : addingToCart === product.id
                              ? 'bg-green-500'
                              : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 hover:scale-105'
                          }`}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Adding...</span>
                            </>
                          ) : justAdded === product.id ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>{product.inStock ? 'Add' : 'Out'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
          addingToCart={addingToCart}
          justAdded={justAdded}
          toggleLike={toggleLike}
          likedProducts={likedProducts}
        />
      )}

      <CartSidebar
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        cartCount={cartCount}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        handleCheckout={handleCheckout}
      />

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white relative">
              <button 
                onClick={closePaymentModal}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-2">Payment</h2>
              <p className="text-green-100 text-sm">Complete your order</p>
            </div>

            <div className="p-6">
              {paymentSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                  <button 
                    onClick={closePaymentModal}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {pendingOrder && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">Order Total</p>
                      <p className="text-3xl font-bold text-gray-900">{pendingOrder.totalAmount.toLocaleString()} RWF</p>
                    </div>
                  )}

                  {paymentStep === 'provider' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
                      <button
                        onClick={() => handleProviderSelect('MTN')}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-lg">
                          M
                        </div>
                        <div className="text-left flex-grow">
                          <p className="font-bold text-gray-900">MTN Mobile Money</p>
                          <p className="text-sm text-gray-600">Pay with MTN MoMo</p>
                        </div>
                        <div className="text-green-600 opacity-0 group-hover:opacity-100 transition">→</div>
                      </button>

                      <button
                        onClick={() => handleProviderSelect('Airtel')}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center font-bold text-white text-lg">
                          A
                        </div>
                        <div className="text-left flex-grow">
                          <p className="font-bold text-gray-900">Airtel Money</p>
                          <p className="text-sm text-gray-600">Pay with Airtel Money</p>
                        </div>
                        <div className="text-green-600 opacity-0 group-hover:opacity-100 transition">→</div>
                      </button>
                    </div>
                  )}

                  {paymentStep === 'phone' && (
                    <div className="space-y-4">
                      <button 
                        onClick={() => setPaymentStep('provider')}
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 mb-4"
                      >
                        ← Back
                      </button>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Enter Phone Number</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {mobileProvider} Phone Number
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={paymentPhone}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="078XXXXXXXX"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-lg"
                          />
                        </div>
                        {paymentError && (
                          <p className="text-red-600 text-sm mt-2">{paymentError}</p>
                        )}
                      </div>
                      <button
                        onClick={handlePhoneSubmit}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition"
                      >
                        Continue
                      </button>
                    </div>
                  )}

                  {paymentStep === 'confirm' && (
                    <div className="space-y-4">
                      <button 
                        onClick={() => setPaymentStep('phone')}
                        className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 mb-4"
                      >
                        ← Back
                      </button>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Payment</h3>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="font-semibold text-gray-900">{mobileProvider} Mobile Money</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone Number</span>
                          <span className="font-semibold text-gray-900">{paymentPhone}</span>
                        </div>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-2xl font-bold text-green-600">{pendingOrder?.totalAmount.toLocaleString()} RWF</span>
                        </div>
                      </div>

                      <button
                        onClick={handlePaymentComplete}
                        disabled={paymentProcessing}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {paymentProcessing ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <span>Confirm Payment</span>
                        )}
                      </button>

                      <p className="text-xs text-center text-gray-500 mt-4">
                        You will receive a prompt on your phone to complete the payment.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}