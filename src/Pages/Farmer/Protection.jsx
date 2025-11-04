import React, { useState } from 'react';
import { ShoppingCart, Star, CheckCircle, Shield, Heart, Filter, X, Smartphone } from 'lucide-react';

// Cart Service
const CartService = {
  cart: [],
  addToCart: (product) => {
    const existingItem = CartService.cart.find((item) => item.id === product._id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      CartService.cart.push({ ...product, id: product._id, quantity: 1 });
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

// Cart Sidebar
function CartSidebar({ isCartOpen, setIsCartOpen, cartItems, cartCount, updateCartQuantity, removeFromCart, handleCheckout }) {
  const { isEmpty, subtotal, totalDiscount, total } = CartService.getCartSummary();

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transform transition-transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <h2 className="font-semibold">Cart</h2>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">{cartCount}</span>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-lg border p-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.capacity}</p>
                      <p className="font-bold text-green-600">{item.price.toLocaleString()} RWF</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-1 rounded hover:bg-gray-100">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1 rounded hover:bg-gray-100">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isEmpty && (
            <div className="border-t p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} RWF</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{totalDiscount.toLocaleString()} RWF</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-green-600">{total.toLocaleString()} RWF</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-3 rounded-lg bg-gradient-to-r from-green-700 to-black py-2.5 text-white font-semibold hover:from-black hover:to-green-700 transition-all"
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Payment Modal
function PaymentModal({ isOpen, onClose, pendingOrder, handlePaymentComplete, paymentProcessing, paymentSuccess, paymentError, mobileProvider, setMobileProvider, phoneNumber, setPhoneNumber, paymentStep, setPaymentStep }) {
  const handleProviderSelect = (provider) => {
    setMobileProvider(provider);
    setPaymentStep('phone');
  };

  const handlePhoneSubmit = () => {
    if (/^07[0-9]{8}$/.test(phoneNumber)) {
      setPaymentStep('confirm');
    } else {
      setPaymentError('Invalid phone number (e.g., 078xxxxxxxx)');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl border border-green-700">
        <div className="bg-gradient-to-r from-green-700 to-black text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
            <div className="font-bold text-green-900 mb-1">Order Summary</div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span>ID: <span className="font-medium text-green-800">{pendingOrder?.id}</span></span>
              <span>Items: <span className="font-medium text-green-800">{pendingOrder?.items?.length}</span></span>
              <span>Total: <span className="font-bold text-green-700">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span></span>
            </div>
          </div>

          {paymentStep === 'provider' && (
            <div className="flex gap-3">
              {['MTN', 'Airtel'].map((p) => (
                <button
                  key={p}
                  onClick={() => handleProviderSelect(p)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${mobileProvider === p ? 'border-green-700 bg-green-100' : 'border-green-200 hover:bg-green-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${p === 'MTN' ? 'bg-yellow-400' : 'bg-red-500'}`}>
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-sm">{p} MoMo</div>
                </button>
              ))}
            </div>
          )}

          {paymentStep === 'phone' && (
            <div>
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mb-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${mobileProvider === 'MTN' ? 'bg-yellow-400' : 'bg-red-500'}`}>
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm font-bold">{mobileProvider} Selected</div>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07xxxxxxxx"
                className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 text-base"
                maxLength="10"
              />
              {paymentError && <p className="text-red-600 text-xs mt-1">{paymentError}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPaymentStep('provider')} className="flex-1 py-2 border border-green-200 rounded-lg font-medium hover:bg-green-50">Back</button>
                <button onClick={handlePhoneSubmit} className="flex-1 py-2 bg-gradient-to-r from-green-700 to-black text-white rounded-lg font-bold">Continue</button>
              </div>
            </div>
          )}

          {paymentStep === 'confirm' && (
            <div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 space-y-1 text-sm">
                <div className="flex justify-between"><span className="font-medium">Provider:</span> <span>{mobileProvider}</span></div>
                <div className="flex justify-between"><span className="font-medium">Phone:</span> <span>{phoneNumber}</span></div>
                <div className="flex justify-between font-bold"><span>Amount:</span> <span className="text-green-700">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span></div>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-2 text-xs text-blue-800 mb-3">
                <Smartphone className="w-4 h-4 inline mr-1" />
                You'll receive a prompt. Enter PIN to confirm.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPaymentStep('phone')} disabled={paymentProcessing} className="flex-1 py-2 border border-green-200 rounded-lg font-medium hover:bg-green-50 disabled:opacity-50">Back</button>
                <button
                  onClick={handlePaymentComplete}
                  disabled={paymentProcessing}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${paymentProcessing ? 'bg-gray-300' : 'bg-gradient-to-r from-green-700 to-black text-white'}`}
                >
                  {paymentProcessing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          )}

          {paymentSuccess && (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="font-bold text-green-800">Payment Successful!</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function SafetyProtectionEquipment() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [paymentStep, setPaymentStep] = useState('provider');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);
  const [justAdded, setJustAdded] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  const products = [
    { _id: '1', name: 'Boots', price: 25000, originalPrice: 30000, image: 'https://www.workmasterboots.com/application/files/thumbnails/image_and_text3/8715/9612/1959/Farmlite_Agriculture_Boots_Lower.jpg', rating: 4.8, reviews: 150, features: ['Mud & sharp object protection', 'Chemical resistant', 'Durable'], description: 'Protect feet from hazards in orchards.', category: 'feet', inStock: true, discount: 17, capacity: 'Heavy-duty' },
    { _id: '2', name: 'Cape / Overalls', price: 22000, originalPrice: 26000, image: 'https://tse2.mm.bing.net/th/id/OIP.WizHn3kiW7BjO0LS9JWyzQHaHa?pid=Api&P=0&h=220', rating: 4.7, reviews: 120, features: ['Full-body coverage', 'Scratch resistant', 'Durable'], description: 'Full-body protection from dirt and chemicals.', category: 'clothing', inStock: true, discount: 15, capacity: 'Full coverage' },
    { _id: '3', name: 'Protective Hat', price: 10000, originalPrice: 12000, image: 'https://tse1.mm.bing.net/th/id/OIP._ag1eDJVKljH8wwoIKxSAQHaHa?pid=Api&P=0&h=220', rating: 4.6, reviews: 100, features: ['UV protection', 'Lightweight', 'Comfortable'], description: 'Shields from sun and heat.', category: 'head', inStock: true, discount: 17, capacity: 'UV protection' },
    { _id: '4', name: 'Protective Gloves', price: 8500, originalPrice: 10000, image: 'https://tse3.mm.bing.net/th/id/OIP.c0nQsPidHUbAcBb5UK7FjAHaHa?pid=Api&P=0&h=220', rating: 4.8, reviews: 140, features: ['Chemical resistant', 'Flexible grip', 'Injury prevention'], description: 'Safeguards hands during tool use.', category: 'hands', inStock: true, discount: 15, capacity: 'Chemical resistant' },
    { _id: '5', name: 'Protective Mask', price: 12000, originalPrice: 15000, image: 'https://www.thisisitoriginal.com/cdn/shop/products/front_6_3f4ea60c-426e-4a40-bdec-9484cc4608cc_compact.jpg?v=1590276666', rating: 4.7, reviews: 130, features: ['Chemical inhalation protection', 'Reusable', 'Comfort fit'], description: 'Protects during spraying.', category: 'respiratory', inStock: true, discount: 20, capacity: 'Inhalation protection' },
    { _id: '6', name: 'General Protective Clothing', price: 25000, originalPrice: 30000, image: 'https://tse4.mm.bing.net/th/id/OIP.AD_g0rD-5ntOwbrMkcV3UQHaHa?pid=Api&P=0&h=220', rating: 4.9, reviews: 160, features: ['Global GAP compliant', 'Full coverage', 'Professional'], description: 'Required for certifications.', category: 'clothing', inStock: true, discount: 17, capacity: 'Certification compliant' },
  ];

  const filteredProducts = filterType === 'all' ? products : products.filter(p => p.category === filterType);

  const toggleLike = (id) => {
    const newLiked = new Set(likedProducts);
    newLiked.has(id) ? newLiked.delete(id) : newLiked.add(id);
    setLikedProducts(newLiked);
  };

  const addToCart = (product) => {
    setAddingToCart(product._id);
    setTimeout(() => {
      CartService.addToCart(product);
      setCartItems(CartService.getCartItems());
      setCartCount(CartService.getCartCount());
      setJustAdded(product._id);
      setAddingToCart(null);
      setTimeout(() => setJustAdded(null), 1500);
    }, 400);
  };

  const updateCartQuantity = (id, qty) => {
    CartService.updateCartQuantity(id, qty);
    setCartItems(CartService.getCartItems());
    setCartCount(CartService.getCartCount());
  };

  const removeFromCart = (id) => {
    CartService.removeFromCart(id);
    setCartItems(CartService.getCartItems());
    setCartCount(CartService.getCartCount());
  };

  const handleCheckout = () => {
    const { total } = CartService.getCartSummary();
    setPendingOrder({ id: `ORD-${Date.now()}`, items: cartItems, totalAmount: total });
    setIsCartOpen(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setPaymentProcessing(true);
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

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-green-900">{product.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
              <span className="text-sm text-gray-600">({product.reviews})</span>
              {product.discount && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{product.discount}% OFF</span>}
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{product.price.toLocaleString()} RWF</p>
              {product.originalPrice && <p className="text-sm text-gray-400 line-through">{product.originalPrice.toLocaleString()} RWF</p>}
            </div>
            <p className="text-gray-600 text-sm">{product.description}</p>
            <ul className="space-y-1">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-600" /> {f}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${justAdded === product._id ? 'bg-green-700 text-white' : addingToCart === product._id ? 'bg-black text-white' : product.inStock ? 'bg-gradient-to-r from-green-700 to-black text-white hover:from-black hover:to-green-700' : 'bg-gray-300 text-gray-500'}`}
              >
                {addingToCart === product._id ? 'Adding...' : justAdded === product._id ? 'Added!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button onClick={() => toggleLike(product._id)} className={`p-2.5 rounded-lg ${likedProducts.has(product._id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Heart className={`w-5 h-5 ${likedProducts.has(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-green-900 text-white py-3 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full p-1"><img src="https://i.ytimg.com/vi/WOUTalhYKvg/maxresdefault.jpg" alt="Logo" className="w-full h-full rounded-full object-cover" /></div>
            <span className="font-bold text-lg">Safety Kit Shop</span>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-1 bg-green-700 px-3 py-1.5 rounded-lg font-medium hover:bg-green-800">
            <ShoppingCart className="w-4 h-4" /> Cart
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-green-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">Filter by Category</span>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="feet">Feet</option>
              <option value="clothing">Body</option>
              <option value="head">Head</option>
              <option value="hands">Hands</option>
              <option value="respiratory">Respiratory</option>
            </select>
          </div>
        </div>

        {/* Product Grid - 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-green-200 group">
              <div className="relative overflow-hidden h-48">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-green-700 to-black text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.discount}% OFF
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleLike(product._id)} className={`p-1.5 rounded-full bg-white/90 ${likedProducts.has(product._id) ? 'text-green-600' : 'text-gray-600'}`}>
                    <Heart className={`w-4 h-4 ${likedProducts.has(product._id) ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => setSelectedProduct(product)} className="p-1.5 rounded-full bg-white/90 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-lg font-bold text-green-700">{product.price.toLocaleString()} RWF</span>
                    {product.originalPrice && <span className="text-xs text-gray-400 line-through ml-1">{product.originalPrice.toLocaleString()}</span>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  className={`w-full mt-3 py-2 rounded-lg font-medium transition-all text-sm ${justAdded === product._id ? 'bg-green-700 text-white' : addingToCart === product._id ? 'bg-black text-white' : product.inStock ? 'bg-gradient-to-r from-green-700 to-black text-white hover:from-black hover:to-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {addingToCart === product._id ? 'Adding...' : justAdded === product._id ? 'Added!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cartItems={cartItems} cartCount={cartCount} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} handleCheckout={handleCheckout} />
      <PaymentModal isOpen={showPaymentModal} onClose={closePaymentModal} pendingOrder={pendingOrder} handlePaymentComplete={handlePaymentComplete} paymentProcessing={paymentProcessing} paymentSuccess={paymentSuccess} paymentError={paymentError} mobileProvider={mobileProvider} setMobileProvider={setMobileProvider} phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} paymentStep={paymentStep} setPaymentStep={setPaymentStep} />
    </div>
  );
}