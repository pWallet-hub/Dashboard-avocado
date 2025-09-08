
import React, { useState } from 'react';
import { ShoppingCart, X, CheckCircle, Loader2, Scissors, Settings, Zap, Shield, Heart, Minus, Plus, Trash2, Smartphone, Filter } from 'lucide-react';

// Mock CartService implementation
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

// CartSidebar Component
function CartSidebar({ isCartOpen, setIsCartOpen, cartItems, cartCount, updateCartQuantity, removeFromCart, handleCheckout }) {
  const cartSummary = CartService.getCartSummary();
  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isCartOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">{cartCount}</span>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {cartSummary.isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500">Add some harvesting kits to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-green-600">{item.price.toLocaleString()} RWF</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">{item.originalPrice.toLocaleString()} RWF</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.capacity}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!cartSummary.isEmpty && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="space-y-2">
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
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-green-600">{cartSummary.total.toLocaleString()} RWF</span>
                </div>
              </div>
              <button onClick={handleCheckout} className="w-full flex items-center justify-center space-x-2 rounded-lg py-3 px-4 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl" style={{ background: 'linear-gradient(to right, #1F310A, #0f5132)' }}>
                <ShoppingCart className="w-5 h-5" />
                <span>Checkout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModernHarvestingKits() {
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

  // Products array from Harvesting Kit category with stock images
  const products = [
    {
      id: '1',
      name: 'Balance Scale',
      price: 20000,
      originalPrice: 25000,
      image: 'https://images-na.ssl-images-amazon.com/images/I/61awknV7AhL._AC_SL1200_.jpg',
      capacity: 'Up to 50kg',
      inStock: true,
      features: [
        'Accurate weight measurement',
        'Portable design for farm use',
        'Durable for outdoor conditions',
        'Easy to read display'
      ],
      description: 'Necessary during sorting work and important for farmers to know prices as avocados are sold by sizes. Helps farmers track fruit quantity by size.'
    },
    {
      id: '2',
      name: 'Fruit Tree Harvesting Clippers',
      price: 12000,
      originalPrice: 15000,
      image: 'https://tse1.mm.bing.net/th/id/OIP.3JxdezlL20PgzIscoCRTsgAAAA?pid=Api&P=0&h=220',
      capacity: '200 cuts/hour',
      inStock: true,
      features: [
        'Sharp stainless steel blades',
        'Ergonomic grip for comfort',
        'Lightweight for easy use',
        'Rust-resistant for Rwandan climate'
      ],
      description: 'Used for harvesting avocados directly from trees while keeping them intact. Prevents damage to fruits.'
    },
    {
      id: '3',
      name: 'Clippers for Cutting Fruit Stems',
      price: 10000,
      originalPrice: 13000,
      image: 'https://tse3.mm.bing.net/th/id/OIP.SGxpcKz1BXRRDUc5PrlrzAHaFj?pid=Api&P=0&h=220',
      capacity: '300 cuts/hour',
      inStock: true,
      features: [
        'Precision cutting blades',
        'Comfortable handle design',
        'Durable for repeated use',
        'Safe for fruit handling'
      ],
      description: 'Used for cutting avocado fruit stems during sorting on the farm.'
    },
    {
      id: '4',
      name: 'Pruning Saw / Secateur',
      price: 15000,
      originalPrice: 18000,
      image: 'https://tse4.mm.bing.net/th/id/OIP.U8N4LUYoy1kjpkGR39E_6gHaDb?pid=Api&P=0&h=220',
      capacity: '500 cuts/hour',
      inStock: true,
      features: [
        'Sharp, durable blade',
        'Ergonomic, non-slip handle',
        'Suitable for thick branches',
        'Rust-resistant for long-term use'
      ],
      description: 'Helps farmers care for trees during pruning, reduces damage, and improves efficiency.'
    },
    {
      id: '5',
      name: 'Harvesting Bag',
      price: 10000,
      originalPrice: 13000,
      image: 'https://vigopresses.co.uk/images/detailed/4/Harvesting-Bag-with-apples-not-included_800x670.jpg',
      capacity: '20kg',
      inStock: true,
      features: [
        'Breathable, strong fabric',
        'Adjustable straps for comfort',
        'Large capacity for avocados',
        'Durable for repeated use'
      ],
      description: 'Keeps avocados clean and off the ground. Supports HACCP certification and allows easy transfer into crates.'
    },
    {
      id: '6',
      name: 'Plastic Crates',
      price: 8000,
      originalPrice: 10000,
      image: 'https://i5.walmartimages.com/asr/04dd16f6-8363-4e17-8cb3-843d16e90d1a.5d253f4c62679f625282f7ca5f10d725.jpeg',
      capacity: '25kg',
      inStock: true,
      features: [
        'Stackable design',
        'Durable plastic material',
        'Ventilated for fruit freshness',
        'Easy to clean'
      ],
      description: 'Safeguards fruit quality during and after harvest until packing and storage. Mandatory for Global GAP certification.'
    },
    {
      id: '7',
      name: 'Complete Harvesting Kit',
      price: 60000,
      originalPrice: 75000,
      image: 'https://tse2.mm.bing.net/th/id/OIP.BBJCIGYA9PYVi43CREhOUgHaEK?pid=Api&P=0&h=220',
      capacity: 'Full kit',
      inStock: true,
      features: [
        'Includes balance scale, clippers, pruning saw, bag, and crates',
        'Durable carry case',
        'Perfect for Rwandan farmers',
        'Saves money and time'
      ],
      description: 'A full set for Rwandan avocado farmers: balance scale, clippers, pruning saw, harvesting bag, and plastic crates. Everything needed for a successful harvest.'
    }
  ];

  const filteredProducts = filterType === 'all' 
    ? products 
    : products.filter((product) => product.name.toLowerCase().includes(filterType.toLowerCase()));

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
      {/* Top Bar */}
      <div className="bg-green-900 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c" alt="Avocado Society of Rwanda" className="h-10 w-10 rounded-full bg-white p-1" />
          <span className="text-2xl font-bold tracking-tight">Harvesting Kits Shop</span>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative flex items-center space-x-2 rounded-lg bg-green-700 px-4 py-2 text-white font-semibold shadow hover:bg-green-800 transition-all">
          <ShoppingCart className="w-5 h-5" />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-green-700 rounded-full px-2 py-0.5 text-xs font-bold shadow">{cartCount}</span>
          )}
        </button>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Scissors className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">7+</h3>
            <p className="text-gray-600">Harvesting Tools</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Easy</h3>
            <p className="text-gray-600">Setup for Rwandan Farms</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Efficient</h3>
            <p className="text-gray-600">Harvesting for Avocados</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2 Year</h3>
            <p className="text-gray-600">Warranty for Rwanda</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Available Harvesting Kits</h2>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="balance scale">Balance Scales</option>
                <option value="clippers">Clippers</option>
                <option value="pruning saw">Pruning Saws</option>
                <option value="harvesting bag">Harvesting Bags</option>
                <option value="plastic crates">Plastic Crates</option>
                <option value="complete">Complete Kits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
          <div className="p-8">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500 rounded-t-2xl border-b-2 border-green-200"
                        style={{ background: '#e5fbe5' }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between p-3 bg-gradient-to-br from-white to-green-50 min-h-[120px]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-green-800">{product.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-700 text-white' : 'bg-black text-white'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-base font-bold text-black">{product.price.toLocaleString()} RWF</span>
                          {product.originalPrice && (
                            <span className="text-xs text-black/40 line-through">{product.originalPrice.toLocaleString()} RWF</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-700" />
                          <span className="text-black text-xs">{product.features[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => toggleLike(product.id)}
                          className={`p-2 rounded-full border-2 transition-all duration-300 transform hover:scale-110 ${
                            likedProducts.has(product.id)
                              ? 'bg-green-700 text-white border-green-700 scale-110'
                              : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                          }`}
                          title={likedProducts.has(product.id) ? 'Unlike' : 'Like'}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-base ${
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
                              <div className="w-4 h-4 inline mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : justAdded === product.id ? (
                            <>
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Added!
                            </>
                          ) : product.inStock ? (
                            <>
                              <ShoppingCart className="w-4 h-4 inline mr-1" />
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
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Scissors className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No harvesting kits found</h3>
                <p className="text-gray-600">Try adjusting your filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cartItems={cartItems}
        cartCount={cartCount}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        handleCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-green-700">
            <div className="bg-gradient-to-r from-green-700 to-black text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-extrabold tracking-tight">Complete Payment</h2>
              <button
                onClick={closePaymentModal}
                className="text-white hover:text-green-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-900 mb-2 text-lg">Order Summary</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="font-semibold text-black">Order:</span>
                  <span className="text-green-800">{pendingOrder?.id}</span>
                  <span className="font-semibold text-black ml-4">Items:</span>
                  <span className="text-green-800">{pendingOrder?.items?.length || 0}</span>
                  <span className="font-semibold text-black ml-4">Total:</span>
                  <span className="font-bold text-green-700">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span>
                </div>
              </div>
              {/* Mobile Money Payment Steps */}
              {paymentStep === 'provider' && (
                <div>
                  <h3 className="font-bold text-green-900 mb-4 text-lg">Choose Mobile Money Provider</h3>
                  <div className="flex gap-4">
                    <div
                      onClick={() => handleProviderSelect('MTN')}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${mobileProvider === 'MTN' ? 'border-green-700 bg-green-100' : 'border-green-200 bg-white hover:bg-green-50'}`}
                    >
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-2">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-black">MTN MoMo</span>
                    </div>
                    <div
                      onClick={() => handleProviderSelect('Airtel')}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${mobileProvider === 'Airtel' ? 'border-green-700 bg-green-100' : 'border-green-200 bg-white hover:bg-green-50'}`}
                    >
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-black">Airtel Money</span>
                    </div>
                  </div>
                </div>
              )}
              {paymentStep === 'phone' && (
                <div>
                  <h3 className="font-bold text-green-900 mb-4 text-lg">Enter Mobile Number</h3>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mobileProvider === 'MTN' ? 'bg-yellow-400' : mobileProvider === 'Airtel' ? 'bg-red-500' : 'bg-blue-600'}`}>
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-black">{mobileProvider} Mobile Money</div>
                      <div className="text-xs text-green-700">Selected</div>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="07xxxxxxxx"
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 text-lg mb-2"
                    maxLength="10"
                  />
                  {paymentError && <p className="text-red-600 mb-2">{paymentError}</p>}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setPaymentStep('provider')}
                      className="flex-1 py-2 px-4 border-2 border-green-200 rounded-lg text-green-900 bg-white hover:bg-green-50 font-bold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePhoneSubmit}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-green-700 to-black text-white rounded-lg font-bold hover:from-black hover:to-green-700"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
              {paymentStep === 'confirm' && (
                <div>
                  <h3 className="font-bold text-green-900 mb-4 text-lg">Confirm Payment</h3>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-semibold text-black">Provider:</span>
                      <span className="text-green-800">{mobileProvider} Mobile Money</span>
                    </div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-semibold text-black">Phone:</span>
                      <span className="text-green-800">{paymentPhone}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-black">Amount:</span>
                      <span className="text-green-700">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span>
                    </div>
                  </div>
                  <div className="bg-white border-l-4 border-green-700 p-3 rounded-xl mb-4">
                    <div className="flex items-center gap-2 text-green-900 text-sm">
                      <Smartphone className="w-5 h-5" />
                      <span>You'll receive a payment prompt on your phone. Enter your PIN to confirm.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep('phone')}
                      className="flex-1 py-2 px-4 border-2 border-green-200 rounded-lg text-green-900 bg-white hover:bg-green-50 font-bold"
                      disabled={paymentProcessing}
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      disabled={paymentProcessing}
                      className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-300 ${
                        paymentProcessing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-700 to-black text-white hover:from-black hover:to-green-700'
                      }`}
                    >
                      {paymentProcessing ? (
                        <>
                          <div className="w-4 h-4 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4 inline mr-2" />
                          Pay Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              {paymentSuccess && (
                <div className="flex flex-col items-center justify-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
                  <p className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</p>
                  <p className="text-gray-600 mb-4">Thank you for your purchase. Your order will be processed soon.</p>
                  <button
                    onClick={closePaymentModal}
                    className="rounded-lg bg-green-700 text-white px-4 py-2 font-semibold hover:bg-green-800"
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
