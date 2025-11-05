import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import './Market.css';

import DashboardHeader from "../../components/Header/DashboardHeader";
import { Link } from 'react-router-dom';
import product from '../../assets/image/product.jpg';
import { ShoppingCart, X, CheckCircle, Loader2, Package, Minus, Plus, Trash2, Smartphone } from 'lucide-react';

import { getAllProducts } from '../../services/productsService';

// Cart Service Singleton
const CartService = {
  getCartItems: () => {
    const items = localStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
  },
  
  saveCartItems: (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
  },
  
  addToCart: (product) => {
    const items = CartService.getCartItems();
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }
    
    CartService.saveCartItems(items);
  },
  
  updateCartQuantity: (productId, quantity) => {
    const items = CartService.getCartItems();
    const item = items.find(item => item.id === productId);
    
    if (item) {
      item.quantity = quantity;
      CartService.saveCartItems(items);
    }
  },
  
  removeFromCart: (productId) => {
    const items = CartService.getCartItems().filter(item => item.id !== productId);
    CartService.saveCartItems(items);
  },
  
  getCartCount: () => {
    return CartService.getCartItems().reduce((sum, item) => sum + item.quantity, 0);
  },
  
  getCartSummary: () => {
    const items = CartService.getCartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return { subtotal, tax, total, itemCount: items.length };
  },
  
  clearCart: () => {
    localStorage.removeItem('cartItems');
  }
};

// Cart Sidebar Component
function CartSidebar({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {
  const summary = CartService.getCartSummary();

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <h2 className="text-xl font-bold">Shopping Cart</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-green-100 text-sm mt-2">{summary.itemCount} items in cart</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-green-600 font-bold text-sm">{item.price.toLocaleString()} RWF</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => onRemoveItem(item.id)} className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{summary.subtotal.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18%)</span>
                <span className="font-medium">{summary.tax.toLocaleString()} RWF</span>
              </div>
              <div className="h-px bg-gray-300 my-2"></div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-green-600 text-lg">{summary.total.toLocaleString()} RWF</span>
              </div>
            </div>
            <button onClick={onCheckout} className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition shadow-lg">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Market() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(CartService.getCartItems());
  const [cartCount, setCartCount] = useState(CartService.getCartCount());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [paymentStep, setPaymentStep] = useState('details'); // Start with details step
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [justAdded, setJustAdded] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        
        // Get all products
        const allProductsResponse = await getAllProducts();
        
        console.log('All products response:', allProductsResponse);
        
        // Handle all products
        if (Array.isArray(allProductsResponse)) {
          setAllProducts(allProductsResponse);
        } else if (allProductsResponse.data && Array.isArray(allProductsResponse.data)) {
          setAllProducts(allProductsResponse.data);
        } else {
          setAllProducts([]);
        }
      } catch (error) {
        console.error('Error fetching all products:', error);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

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
    setPaymentStep('details'); // Reset to details step
    setPaymentSuccess(false);
    setPaymentError('');
  };

  const handleBackButton = () => {
    if (paymentStep === 'provider') {
      setPaymentStep('details');
    } else if (paymentStep === 'phone') {
      setPaymentStep('provider');
    } else if (paymentStep === 'confirm') {
      setPaymentStep('phone');
    } else {
      closePaymentModal();
    }
  };

  const handleBackToCart = () => {
    setShowPaymentModal(false);
    setIsCartOpen(true);
    setPaymentStep('details');
  };

  const handleCancelOrder = () => {
    // Clear the cart
    CartService.clearCart();
    setCartItems([]);
    setCartCount(0);
    // Close the modal
    closePaymentModal();
  };

  return (
    <>
      <DashboardHeader />
      <div className="market-container">
        <div className="market-wrapper">
           <div className="market-tabs">
            <button>All Categories</button>
            <div className="market-tabs-grid">
              <Link to="/dashboard/farmer/IrrigationKits">
                <button>Irrigation Kits</button>
              </Link>
              <Link to="/dashboard/farmer/HarvestingKit">
                <button>Harvesting Kits</button>
              </Link>
              <Link to="/dashboard/farmer/Protection">
                <button>Safety & Protection</button>
              </Link>
              <Link to="/dashboard/farmer/Container">
                <button>Container</button>
              </Link>
              <Link to="/dashboard/farmer/Pest">
                <button>Pest Management</button>
              </Link>
            </div>
          </div>
          
          {/* All Products Section */}
          <div className="all-products-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-titles mb-0">All Products</h2>
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            {loading ? (
              <div className="loader-container">
                <ClipLoader color="#4CAF50" size={50} />
              </div>
            ) : allProducts.length === 0 ? (
              <div className="no-products">
                <p>No products available at the moment.</p>
              </div>
            ) : (
              <div className="all-products-grid">
                {allProducts.map((productItem) => (
                  <div key={productItem.id || productItem._id} className="product-card">
                    <div className="product-image">
                      <img 
                        src={productItem.images?.[0] || productItem.image || product} 
                        alt={productItem.name}
                        onError={(e) => { e.target.src = product; }}
                      />
                    </div>
                    <div className="product-info">
                      <span className="product-category">
                        {productItem.category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Uncategorized'}
                      </span>
                      <h3 className="product-name">{productItem.name}</h3>
                      <p className="product-description">
                        {productItem.description || 'Quality product for your farming needs'}
                      </p>
                      <div className="product-footer">
                        <p className="product-price">
                          {productItem.price ? `RWF ${parseFloat(productItem.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Price unavailable'}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart({
                          id: String(productItem.id || productItem._id),
                          name: productItem.name,
                          price: parseFloat(productItem.price),
                          image: productItem.images?.[0] || productItem.image || product,
                          category: productItem.category
                        })}
                        disabled={addingToCart === (productItem.id || productItem._id) || justAdded === (productItem.id || productItem._id)}
                        className={`add-to-cart-btn ${
                          justAdded === (productItem.id || productItem._id) ? 'bg-green-600' :
                          addingToCart === (productItem.id || productItem._id) ? 'bg-green-500' :
                          'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {addingToCart === (productItem.id || productItem._id) ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Adding...
                          </span>
                        ) : justAdded === (productItem.id || productItem._id) ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Added!
                          </span>
                        ) : (
                          'Add to Cart'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 text-white relative flex-shrink-0">
              {/* Back Button - Show on all steps except details and success */}
              {!paymentSuccess && paymentStep !== 'details' && (
                <button 
                  onClick={handleBackButton}
                  className="absolute top-3 left-3 p-1.5 hover:bg-white/20 rounded-full transition flex items-center gap-1"
                >
                  <span className="text-lg">←</span>
                </button>
              )}
              
              {/* Close Button */}
              <button 
                onClick={closePaymentModal}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold mb-1">
                {paymentStep === 'details' ? 'Checkout' : 
                 paymentStep === 'provider' ? 'Payment Method' :
                 paymentStep === 'phone' ? 'Phone Number' :
                 paymentStep === 'confirm' ? 'Confirm Payment' : 'Payment'}
              </h2>
              <p className="text-green-100 text-xs">
                {paymentStep === 'details' ? 'Review your order' :
                 paymentSuccess ? 'Transaction completed' : 'Complete your order'}
              </p>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
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
                  {/* Checkout Details Step */}
                  {paymentStep === 'details' && pendingOrder && (
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-gray-900 mb-2">Order Summary</h3>
                      
                      {/* Cart Items List */}
                      <div className="max-h-[35vh] overflow-y-auto space-y-2 mb-3 pr-1">
                        {pendingOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-grow min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate">{item.name}</p>
                              <p className="text-xs text-gray-600">
                                {item.price.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                              {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 space-y-1.5 border border-green-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-900">
                            {CartService.getCartSummary().subtotal.toLocaleString()} RWF
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Tax (18%)</span>
                          <span className="font-semibold text-gray-900">
                            {CartService.getCartSummary().tax.toLocaleString()} RWF
                          </span>
                        </div>
                        <div className="h-px bg-green-200 my-1"></div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-700 font-medium text-sm">Total</span>
                          <span className="text-xl font-bold text-green-600">
                            {pendingOrder.totalAmount.toLocaleString()} RWF
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setPaymentStep('provider')}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-800 transition text-sm shadow-md"
                      >
                        Proceed to Payment
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleBackToCart}
                          className="border-2 border-green-600 text-green-600 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition flex items-center justify-center gap-1.5 text-sm"
                        >
                          <span>←</span>
                          <span>Edit Cart</span>
                        </button>

                        <button
                          onClick={handleCancelOrder}
                          className="border-2 border-red-500 text-red-600 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition text-sm"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'provider' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
                      
                      {pendingOrder && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">Total to Pay</p>
                          <p className="text-2xl font-bold text-gray-900">{pendingOrder.totalAmount.toLocaleString()} RWF</p>
                        </div>
                      )}
                      
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
    </>
  );
}