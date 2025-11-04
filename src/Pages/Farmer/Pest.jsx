import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle, Shield, Bug, Zap, Eye, Heart, Filter, Package, Timer, AlertTriangle, Leaf, Droplets, Home, User, Phone, Mail, MapPin, Loader2, X, Minus, Plus, Trash2, Smartphone } from 'lucide-react';
// Import the real API service
import { getPestManagementProducts } from '../../services/productsService';

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
    const subtotal = CartService.cart.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
      return sum + price * item.quantity;
    }, 0);
    const totalDiscount = CartService.cart.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
      const originalPrice = item.originalPrice || 0;
      return sum + (originalPrice ? (originalPrice - price) * item.quantity : 0);
    }, 0);
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
                <p className="text-sm text-gray-500">Add some pest management products!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : item.price;
                  return (
                    <div key={item.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-14 w-14 rounded-lg object-cover" 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Pest+Management+Product';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-base font-bold text-green-600">{itemPrice.toLocaleString()} RWF</span>
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
                  );
                })}
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

export default function PestManagement() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
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
  const [justAdded, setJustAdded] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  // API integration states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Fetch pest management products from real API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching pest management products from API...');
        
        const response = await getPestManagementProducts({
          page: currentPage,
          limit: 20,
          status: 'available'
        });
        
        console.log('📥 API Response:', response);
        
        // Transform API data to match component structure
        const transformedProducts = response.data.map(product => ({
          _id: product.id?.toString() || product._id?.toString(),
          id: product.id || product._id,
          name: product.name,
          description: product.description,
          price: typeof product.price === 'number' ? product.price.toLocaleString() : product.price,
          originalPrice: product.originalPrice || null,
          image: product.image_url || product.image || 'https://via.placeholder.com/400x300?text=Pest+Management+Product',
          rating: 4.7,
          reviews: 120,
          features: generateFeatures(product.name),
          category: determineCategory(product.name),
          inStock: product.status === 'available' && (product.quantity || 0) > 0,
          discount: 15,
          capacity: `${product.quantity || 0} ${product.unit || 'piece'}`,
          effectiveness: '95% effectiveness',
          unit: product.unit || 'piece',
          quantity: Number(product.quantity) || 0,
          supplier_id: product.supplier_id || product.supplierId || 'unknown'
        }));
        
        console.log('🔄 Transformed products:', transformedProducts);
        
        setProducts(transformedProducts);
        setPagination(response.pagination || {});
        
        if (transformedProducts.length === 0) {
          setError('No pest management products found. This might be because the API doesn\'t have any products with category "pest-management" yet.');
        }
        
      } catch (err) {
        console.error('❌ Error fetching pest management products:', err);
        setError(`Failed to load products: ${err.message}`);
        
        // Fallback to mock data in case of API failure for development
        console.log('🔄 Loading fallback mock data...');
        const mockProducts = [
          {
            _id: 'mock-1',
            id: 'mock-1',
            name: 'Bio-Organic Insect Spray',
            description: 'Eco-friendly organic insect spray that effectively controls pests while being safe for crops and environment.',
            price: '12,500',
            originalPrice: null,
            image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400&h=300&fit=crop',
            rating: 4.7,
            reviews: 120,
            features: ['100% Organic', 'Non-toxic formula', 'Long-lasting protection', 'Safe for crops'],
            category: 'organic',
            inStock: true,
            discount: 15,
            capacity: '50 bottle',
            effectiveness: '95% effectiveness',
            unit: 'bottle',
            quantity: 50,
            supplier_id: 'mock-supplier'
          },
          {
            _id: 'mock-2',
            id: 'mock-2',
            name: 'Professional Rodent Control Kit',
            description: 'Complete rodent control solution with professional-grade traps and monitoring system.',
            price: '25,000',
            originalPrice: null,
            image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
            rating: 4.6,
            reviews: 85,
            features: ['Humane traps', 'Bait stations', 'Monitoring system', 'Reusable design'],
            category: 'rodent',
            inStock: true,
            discount: 15,
            capacity: '20 kit',
            effectiveness: '95% effectiveness',
            unit: 'kit',
            quantity: 20,
            supplier_id: 'mock-supplier'
          }
        ];
        
        setProducts(mockProducts);
        setError(null);
        
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const generateFeatures = (name) => {
    if (!name) return ['Effective control', 'Easy to use', 'Safe formula', 'Long-lasting'];
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('organic') || lowerName.includes('bio')) {
      return ['100% Organic', 'Non-toxic formula', 'Long-lasting protection', 'Safe for crops'];
    } else if (lowerName.includes('rodent')) {
      return ['Humane traps', 'Bait stations', 'Monitoring system', 'Reusable design'];
    } else if (lowerName.includes('spray')) {
      return ['Targeted formula', 'Quick action', 'Leaf-safe', 'Residue-free'];
    } else if (lowerName.includes('termite')) {
      return ['Underground barriers', 'Monitoring stations', 'Long-term protection', 'Professional grade'];
    } else if (lowerName.includes('mosquito')) {
      return ['Water-soluble', 'Prevents breeding', 'Safe for fish', '30-day protection'];
    } else if (lowerName.includes('ant')) {
      return ['Gel baits', 'Bait stations', 'Colony targeting', 'Weather resistant'];
    } else if (lowerName.includes('fungal')) {
      return ['Broad spectrum', 'Preventive action', 'Crop safe', 'Systemic protection'];
    } else if (lowerName.includes('smart') || lowerName.includes('monitoring')) {
      return ['IoT sensors', 'Mobile alerts', 'Real-time monitoring', 'Data analytics'];
    }
    return ['Effective control', 'Easy to use', 'Safe formula', 'Long-lasting'];
  };

  const determineCategory = (name) => {
    if (!name) return 'organic';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('organic') || lowerName.includes('bio')) return 'organic';
    if (lowerName.includes('rodent')) return 'rodent';
    if (lowerName.includes('spray') || lowerName.includes('aphid') || lowerName.includes('mite')) return 'spray';
    if (lowerName.includes('termite')) return 'termite';
    if (lowerName.includes('mosquito')) return 'mosquito';
    if (lowerName.includes('ant')) return 'ant';
    if (lowerName.includes('fungal') || lowerName.includes('disease')) return 'fungal';
    if (lowerName.includes('smart') || lowerName.includes('monitoring') || lowerName.includes('iot')) return 'technology';
    return 'organic';
  };

  const filteredProducts = filterType === 'all' 
    ? products 
    : products.filter(product => product.category === filterType);

  const toggleLike = (productId) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedProducts(newLiked);
  };

  const addToCart = (product) => {
    setAddingToCart(product._id);
    setTimeout(() => {
      CartService.addToCart({ ...product, id: product._id });
      setCartItems(CartService.getCartItems());
      setCartCount(CartService.getCartCount());
      setJustAdded(product._id);
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
    setPaymentStep('provider');
    setPaymentSuccess(false);
    setPaymentError('');
  };

  const showingMockData = products.some(p => {
    return p && p.id && typeof p.id === 'string' && p.id.startsWith('mock-');
  });

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative group">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Pest+Management+Product';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 transition-all duration-200 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400 animate-pulse' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
              </div>
              {product.discount && (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full animate-bounce">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-green-600">{product.price} RWF</span>
              </div>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>Size: {product.capacity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{product.effectiveness}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                  product.inStock 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    Add to Cart
                  </>
                ) : (
                  'Out of Stock'
                )}
              </button>
              <button 
                onClick={() => toggleLike(product._id)}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  likedProducts.has(product._id) 
                    ? 'bg-green-100 text-green-600 scale-110' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <Heart className={`w-6 h-6 ${likedProducts.has(product._id) ? 'fill-current animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Market</span>
            </button>
            
            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center space-x-2 rounded-lg bg-green-600 px-3 py-1.5 text-white font-semibold shadow hover:bg-green-700 transition-all">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-white text-green-700 rounded-full px-1.5 py-0.5 text-xs font-bold shadow">{cartCount}</span>
              )}
            </button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-emerald-600 mb-2 animate-fadeIn">
              Pest Management Solutions
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto animate-slideUp">
              Protect your crops with our comprehensive pest management solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                <span className="ml-3 text-sm text-gray-600">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">API Connection Issue</h3>
                <p className="text-sm text-gray-600 mb-3">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mb-3 text-xs text-gray-600">
                  Showing {filteredProducts.length} products
                  {showingMockData && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Fallback data
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200 transform hover:-translate-y-1 animate-slideInUp"
                      style={{
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Pest+Management+Product';
                          }}
                        />
                        
                        {product.discount && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                            {product.discount}% OFF
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 space-y-1">
                          <button
                            onClick={() => toggleLike(product._id)}
                            className={`p-1.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                              likedProducts.has(product._id)
                                ? 'bg-green-100 text-green-600 scale-110'
                                : 'bg-white/80 text-gray-600 hover:bg-white'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${likedProducts.has(product._id) ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="p-1.5 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-all duration-300 transform hover:scale-110"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gradient-to-br from-gray-50 to-white">
                        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-base font-bold text-green-600">{product.price} RWF</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out'}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                        </div>
                        
                        <div className="space-y-1 mb-2">
                          {product.features.slice(0, 2).map((feature, i) => (
                            <div key={i} className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span className="text-xs text-gray-700 line-clamp-1">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock || addingToCart === product._id}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                            product.inStock
                              ? justAdded === product._id
                                ? 'bg-green-700 text-white'
                                : addingToCart === product._id
                                ? 'bg-green-500 text-white'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105 shadow-md'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {addingToCart === product._id ? (
                            <>
                              <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                              Adding...
                            </>
                          ) : justAdded === product._id ? (
                            <>
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Added!
                            </>
                          ) : product.inStock ? (
                            <>
                              <ShoppingCart className="w-3 h-3 inline mr-1" />
                              Add to Cart
                            </>
                          ) : (
                            'Out of Stock'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 animate-fadeIn">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bug className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pest control products found</h3>
                <p className="text-gray-600">Try adjusting your filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

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

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}