import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, CheckCircle, Loader2, Heart, Minus, Plus, Trash2, Smartphone, Filter } from 'lucide-react';
import { getIrrigationProducts } from '../../services/productsService';

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
                <p className="text-sm text-gray-500">Add some irrigation kits!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3">
                    <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
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

export default function IrrigationKits() {
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getIrrigationProducts({
          page: currentPage,
          limit: 20,
          status: 'available'
        });
        
        const transformedProducts = response.data.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: null,
          image: product.image_url || 'https://via.placeholder.com/150',
          capacity: `${product.quantity} ${product.unit}`,
          inStock: product.status === 'available' && product.quantity > 0,
          features: product.features || [
            product.description || 'High-quality irrigation equipment',
            'Suitable for avocado farms',
            'Durable and efficient',
            'Easy to install'
          ],
          unit: product.unit,
          quantity: product.quantity,
          supplier_id: product.supplier_id
        }));
        
        setProducts(transformedProducts);
        setPagination(response.pagination || {});
        
      } catch (err) {
        console.error('Error fetching irrigation products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const filteredProducts = filterType === 'all' ? products : products.filter((product) => 
    product.name.toLowerCase().includes(filterType.toLowerCase())
  );

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
          <img src="https://tse4.mm.bing.net/th/id/OIP.8vQaasiWymVqRsYoaQ25WwAAAA?pid=Api&P=0&h=220" alt="Avocado Society of Rwanda" className="h-8 w-8 rounded-full bg-white p-0.5" />
          <span className="text-xl font-bold tracking-tight">Irrigation Kits Shop</span>
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
              <h2 className="text-lg font-semibold text-gray-900">Available Irrigation Kits</h2>
            </div>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="sprayer">Powered Sprayers</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-green-200 overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                <span className="ml-3 text-base text-gray-600">Loading irrigation kits...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Error Loading Products</h3>
                <p className="text-sm text-gray-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-3 px-5 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-xl border-b-2 border-green-200"
                        style={{ background: '#e5fbe5' }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between p-2.5 bg-gradient-to-br from-white to-green-50 min-h-[110px]">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold text-green-800 truncate">{product.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-700 text-white' : 'bg-black text-white'}`}>
                            {product.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <span className="text-sm font-bold text-black">{product.price.toLocaleString()} RWF</span>
                        </div>
                        <div className="flex items-center space-x-1.5 mb-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-green-700" />
                          <span className="text-black text-xs truncate">{Array.isArray(product.features) ? product.features[0] : product.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={() => toggleLike(product.id)}
                          className={`p-1.5 rounded-full border-2 transition-all duration-300 transform hover:scale-110 ${
                            likedProducts.has(product.id)
                              ? 'bg-green-700 text-white border-green-700 scale-110'
                              : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-sm ${
                            justAdded === product.id
                              ? 'bg-green-700 text-white'
                              : addingToCart === product.id
                              ? 'bg-black text-white'
                              : product.inStock
                              ? 'bg-gradient-to-r from-green-700 to-black text-white hover:from-black hover:to-green-700 hover:scale-105'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!product.inStock || addingToCart === product.id}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <div className="w-3.5 h-3.5 inline mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : justAdded === product.id ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                              Added!
                            </>
                          ) : product.inStock ? (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5 inline mr-1" />
                              Add
                            </>
                          ) : (
                            'Out of Stock'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No irrigation kits found</h3>
                <p className="text-sm text-gray-600">Try adjusting your filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-green-700">
            <div className="bg-gradient-to-r from-green-700 to-black text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-lg font-extrabold tracking-tight">Complete Payment</h2>
              <button onClick={closePaymentModal} className="text-white hover:text-green-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-1.5 text-base">Order Summary</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="font-semibold text-black">Order:</span>
                  <span className="text-green-800">{pendingOrder?.id}</span>
                  <span className="font-semibold text-black ml-3">Items:</span>
                  <span className="text-green-800">{pendingOrder?.items?.length || 0}</span>
                  <span className="font-semibold text-black ml-3">Total:</span>
                  <span className="font-bold text-green-700">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span>
                </div>
              </div>
              {paymentStep === 'provider' && (
                <div>
                  <h3 className="font-bold text-green-900 mb-3 text-base">Choose Mobile Money Provider</h3>
                  <div className="flex gap-3">
                    <div
                      onClick={() => handleProviderSelect('MTN')}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${mobileProvider === 'MTN' ? 'border-green-700 bg-green-100' : 'border-green-200 bg-white hover:bg-green-50'}`}
                    >
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-1.5">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-sm text-black">MTN MoMo</span>
                    </div>
                    <div
                      onClick={() => handleProviderSelect('Airtel')}
                      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${mobileProvider === 'Airtel' ? 'border-green-700 bg-green-100' : 'border-green-200 bg-white hover:bg-green-50'}`}
                    >
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-1.5">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-sm text-black">Airtel Money</span>
                    </div>
                  </div>
                </div>
              )}
              {paymentStep === 'phone' && (
                <div>
                  <h3 className="font-bold text-green-900 mb-3 text-base">Enter Mobile Number</h3>
                  <div className="flex items-center space-x-2 p-2.5 bg-green-50 rounded-lg border border-green-200 mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mobileProvider === 'MTN' ? 'bg-yellow-400' : 'bg-red-500'}`}>
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-black">{mobileProvider} Mobile Money</div>
                      <div className="text-xs text-green-700">Selected</div>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07xxxxxxxx"
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 text-base mb-1.5"
                    maxLength="10"
                  />
                  {paymentError && <p className="text-red-600 text-sm mb-1.5">{paymentError}</p>}
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={() => setPaymentStep('provider')}
                      className="flex-1 py-2 px-3 border-2 border-green-200 rounded-lg text-sm text-green-900 bg-white hover:bg-green-50 font-bold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePhoneSubmit}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-green-700 to-black text-white text-sm rounded-lg font-bold hover:from-black hover:to-green-700"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
              {paymentStep === 'confirm' && (
                <div>
                  <h3 className="font-bold text-green-900 mb-3 text-base">Confirm Payment</h3>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
                    <div className="flex justify-between mb-0.5 text-sm">
                      <span className="font-semibold text-black">Provider:</span>
                      <span className="text-green-800">{mobileProvider} Mobile Money</span>
                    </div>
                    <div className="flex justify-between mb-0.5 text-sm">
                      <span className="font-semibold text-black">Phone:</span>
                      <span className="text-green-800">{paymentPhone}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-black">Amount:</span>
                      <span className="text-green-700">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span>
                    </div>
                  </div>
                  <div className="bg-white border-l-4 border-green-700 p-2.5 rounded-lg mb-3">
                    <div className="flex items-center gap-2 text-green-900 text-xs">
                      <Smartphone className="w-4 h-4" />
                      <span>You'll receive a payment prompt on your phone. Enter your PIN to confirm.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentStep('phone')}
                      className="flex-1 py-2 px-3 border-2 border-green-200 rounded-lg text-sm text-green-900 bg-white hover:bg-green-50 font-bold"
                      disabled={paymentProcessing}
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      disabled={paymentProcessing}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                        paymentProcessing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-700 to-black text-white hover:from-black hover:to-green-700'
                      }`}
                    >
                      {paymentProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 inline mr-1.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5 inline mr-1.5" />
                          Pay Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {paymentSuccess && (
                <div className="flex flex-col items-center justify-center">
                  <CheckCircle className="h-14 w-14 text-green-600 mb-3" />
                  <p className="text-base font-semibold text-green-800 mb-1.5">Payment Successful!</p>
                  <p className="text-sm text-gray-600 mb-3">Thank you for your purchase. Your order will be processed soon.</p>
                  <button
                    onClick={closePaymentModal}
                    className="rounded-lg bg-green-700 text-white px-4 py-2 text-sm font-semibold hover:bg-green-800"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}