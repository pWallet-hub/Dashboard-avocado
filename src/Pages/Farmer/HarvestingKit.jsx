import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle, Scissors, Settings, Zap, Shield, Eye, Heart, Filter, Package, Timer, X, Plus, Minus, Trash2, Smartphone } from 'lucide-react';
import CartService from '../../services/cartService';
import MarketStorageService from '../../services/marketStorageService';

export default function ModernHarvestingKits() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [justAdded, setJustAdded] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Only Mobile Money is allowed in Rwanda
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Mobile Money');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [mobileProvider, setMobileProvider] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStep, setPaymentStep] = useState('provider'); // provider, phone, confirm

  // Load cart data and set up listeners
  useEffect(() => {
    // Initialize cart service
    CartService.init();
    
    // Set up cart update listener
    const handleCartUpdate = (summary) => {
      setCartItems(summary.items);
      setCartCount(summary.totalItems);
    };

    CartService.addListener(handleCartUpdate);
    
    // Load initial cart data
    const summary = CartService.getCartSummary();
    setCartItems(summary.items);
    setCartCount(summary.totalItems);

    // Cleanup listener on unmount
    return () => {
      CartService.removeListener(handleCartUpdate);
    };
  }, []);

  // Add to cart function with error handling and visual feedback
  const addToCart = async (product, quantity = 1) => {
    try {
      setAddingToCart(product._id);
      await CartService.addToCart(product, quantity);
      
      // Show success feedback
      setJustAdded(product._id);
      setAddingToCart(null);
      
      // Clear success feedback after 2 seconds
      setTimeout(() => {
        setJustAdded(null);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setAddingToCart(null);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  // Update cart quantity with error handling
  const updateCartQuantity = async (productId, quantity) => {
    try {
      await CartService.updateQuantity(productId, quantity);
      // State will be updated automatically via listener
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  // Remove from cart with error handling
  const removeFromCart = async (productId) => {
    try {
      await CartService.removeFromCart(productId);
      // State will be updated automatically via listener
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  // Handle checkout process - now shows payment modal
  const handleCheckout = async () => {
    try {
      const cartSummary = CartService.getCartSummary();
      
      if (cartSummary.isEmpty) {
        alert('Your cart is empty!');
        return;
      }

      // Initialize storage services
      MarketStorageService.initializeStorage();

      // Generate unique order ID
      const orderId = `AK${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      // All order details are Rwandan
      const order = {
        id: orderId,
        orderNumber: orderId,
        customerId: 'avocado_customer',
        customerName: 'Umuhinzi w’Avoka',
        customerEmail: 'umuhinzi@avoka.rw',
        customerPhone: '+2507xxxxxxx',
        deliveryAddress: 'Kigali, Rwanda',
        items: cartSummary.items.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          category: item.category || 'Ibikoresho by’Avoka',
          image: item.image
        })),
        subtotal: cartSummary.subtotal,
        discount: cartSummary.totalDiscount,
        totalAmount: cartSummary.total,
        status: 'pending_payment',
        paymentStatus: 'pending',
        orderDate: currentDate,
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: '',
        orderType: 'avocado_kit',
        sourceType: 'avocado_kit',
        source: 'Iduka ry’Ibikoresho by’Avoka',
        notes: `Kugura ibikoresho byo gusarura avoka - ${cartSummary.items.length} ibikoresho`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store pending order and show payment modal
      setPendingOrder(order);
      setIsCartOpen(false);
      setShowPaymentModal(true);
      setPaymentStep('provider');
      setMobileProvider('');
      setPhoneNumber('');
      
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  // Handle mobile money provider selection
  const handleProviderSelect = (provider) => {
    setMobileProvider(provider);
    setPaymentStep('phone');
  };

  // Handle phone number validation and proceed
  const handlePhoneSubmit = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    setPaymentStep('confirm');
  };

  // Handle payment completion
  const handlePaymentComplete = async () => {
    if (!pendingOrder || !mobileProvider || !phoneNumber) {
      alert('Please complete all payment details');
      return;
    }

    try {
      setPaymentProcessing(true);

      // Simulate mobile money payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update order with payment information
      const completedOrder = {
        ...pendingOrder,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: `${mobileProvider} Mobile Money`,
        paymentPhone: phoneNumber,
        paymentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create customer record if it doesn't exist
      const existingCustomers = MarketStorageService.getShopCustomers();
      const customerExists = existingCustomers.find(c => c.id === 'avocado_customer');
      
      if (!customerExists) {
        const customer = {
          id: 'avocado_customer',
          name: 'Avocado Farmer',
          email: 'farmer@avocadokits.rw',
          phone: '+250788123456',
          address: 'Kigali, Rwanda',
          totalOrders: 0,
          totalSpent: 0,
          joinDate: pendingOrder.orderDate,
          status: 'active'
        };
        MarketStorageService.addShopCustomer(customer);
      }

      // Save completed order
      MarketStorageService.addShopOrder(completedOrder);

      // Create transaction record
      const transaction = {
        id: `txn_${Date.now()}`,
        orderId: completedOrder.id,
        amount: completedOrder.totalAmount,
        type: 'sale',
        category: 'avocado_equipment',
        date: completedOrder.orderDate,
        description: 'Avocado Kit Purchase',
        items: completedOrder.items.length,
        customer: 'Avocado Farmer'
      };

      const existingTransactions = MarketStorageService.getMarketTransactions();
      existingTransactions.push(transaction);
      localStorage.setItem('market_transactions', JSON.stringify(existingTransactions));

      // Update inventory
      completedOrder.items.forEach(cartItem => {
        const inventory = MarketStorageService.getShopInventory();
        const inventoryItem = inventory.find(item => 
          item.name.toLowerCase().includes(cartItem.productName.toLowerCase()) ||
          item.id === cartItem.productId
        );
        
        if (inventoryItem && inventoryItem.quantity >= cartItem.quantity) {
          inventoryItem.quantity -= cartItem.quantity;
          inventoryItem.lastSold = completedOrder.orderDate;
          MarketStorageService.saveShopInventory(inventory);
        }
      });

      // Clear cart after successful payment
      CartService.clearCart();
      
      // Reset states
      setPaymentProcessing(false);
      setShowPaymentModal(false);
      setPendingOrder(null);
      setSelectedPaymentMethod('Mobile Money');
      setMobileProvider('');
      setPhoneNumber('');
      setPaymentStep('provider');
      
  alert(`Kwishyura byagenze neza!\n\nNomero y’itegeko: ${completedOrder.id}\nIgiteranyo: ${completedOrder.totalAmount.toLocaleString()} RWF\nUburyo bwo kwishyura: ${completedOrder.paymentMethod}\nTelefoni: ${phoneNumber}\n\nItegeko ryawe rizagaragara muri sisitemu y’Iduka.`);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  // Avocado tools for Rwanda - English, Rwandan context, new images
  const products = [
    {
      _id: '1',
      name: 'Picking Pole',
      price: '22,000',
      originalPrice: '28,000',
      image: '/src/assets/image/avoca.webp',
      rating: 4.9,
      reviews: 210,
      features: [
        'Extendable aluminum or bamboo pole',
        'Soft basket for gentle picking',
        'Lightweight for hilly terrain',
        'Non-slip handle for safety'
      ],
      description: 'Used by Rwandan farmers to pick avocados from tall trees, especially on hillsides. Prevents fruit bruising and increases harvest efficiency.',
      category: 'picking',
      inStock: true,
      discount: 21,
      capacity: '100 avocados/hour'
    },
    {
      _id: '2',
      name: 'Pruning Shears',
      price: '15,000',
      originalPrice: '18,000',
      image: '/src/assets/image/product.jpg',
      rating: 4.8,
      reviews: 175,
      features: [
        'Stainless steel blades',
        'Ergonomic, comfortable grip',
        'Rust-resistant for Rwandan climate',
        'Safety lock for transport'
      ],
      description: 'Essential for cutting branches and maintaining healthy avocado trees in Rwanda. Used before and after harvest to improve yield.',
      category: 'pruning',
      inStock: true,
      discount: 17,
      capacity: '500 cuts/hour'
    },
    {
      _id: '3',
      name: 'Collection Bag',
      price: '10,000',
      originalPrice: '13,000',
      image: '/src/assets/image/nopic.jpg',
      rating: 4.7,
      reviews: 132,
      features: [
        'Breathable, strong fabric',
        'Adjustable straps for comfort',
        'Large capacity for many avocados',
        'Durable for repeated use'
      ],
      description: 'Worn by Rwandan harvesters to collect avocados as they pick. Keeps fruit fresh and undamaged, even during long harvest days.',
      category: 'collection',
      inStock: true,
      discount: 23,
      capacity: '20kg'
    },
    {
      _id: '4',
      name: 'Sorting Tray',
      price: '8,000',
      originalPrice: '10,000',
      image: '/src/assets/image/slide1.jpg',
      rating: 4.6,
      reviews: 98,
      features: [
        'Non-slip surface',
        'Multiple compartments',
        'Portable and easy to clean',
        'Plastic or wood construction'
      ],
      description: 'Used after harvest in Rwanda to sort avocados by size and quality, especially for export or local markets.',
      category: 'sorting',
      inStock: false,
      discount: 20,
      capacity: '50 avocados'
    },
    {
      _id: '5',
      name: 'Harvesting Gloves',
      price: '5,000',
      originalPrice: '7,000',
      image: '/src/assets/image/muhinyuza.jpg',
      rating: 4.7,
      reviews: 80,
      features: [
        'Protects hands from scratches',
        'Improves grip on tools and fruit',
        'Durable and washable',
        'Comfortable for long use'
      ],
      description: 'Commonly used by Rwandan farmers to protect hands and improve efficiency during avocado harvest.',
      category: 'gloves',
      inStock: true,
      discount: 10,
      capacity: 'One pair'
    },
    {
      _id: '6',
      name: 'Ladder',
      price: '25,000',
      originalPrice: '30,000',
      image: '/src/assets/image/slide2.jpg',
      rating: 4.5,
      reviews: 60,
      features: [
        'Wooden or aluminum',
        'Stable for uneven ground',
        'Lightweight for moving on hills',
        'Essential for tall trees'
      ],
      description: 'Used by Rwandan farmers to reach higher branches, especially in hilly areas where trees grow tall.',
      category: 'ladder',
      inStock: true,
      discount: 17,
      capacity: '1 ladder'
    },
    {
      _id: '7',
      name: 'Electric Pruner',
      price: '30,000',
      originalPrice: '36,000',
      image: '/src/assets/image/slide3.jpg',
      rating: 4.8,
      reviews: 160,
      features: [
        'Rechargeable battery',
        'Sharp cutting blades',
        'Lightweight design',
        'LED indicator'
      ],
      description: 'Used by larger Rwandan farms and cooperatives for fast, efficient pruning. Saves time and effort, especially for big orchards.',
      category: 'pruning',
      inStock: true,
      discount: 17,
      capacity: '6 hours runtime'
    },
    {
      _id: '8',
      name: 'Complete Harvesting Kit',
      price: '60,000',
      originalPrice: '75,000',
      image: '/src/assets/image/pwallet-logo-new.png',
      rating: 4.9,
      reviews: 115,
      features: [
        'All essential tools included',
        'Durable carry case',
        'Perfect for Rwandan farmers',
        'Saves money and time'
      ],
      description: 'A full set for Rwandan avocado farmers: picking pole, shears, gloves, bag, and more. Everything needed for a successful harvest.',
      category: 'complete',
      inStock: true,
      discount: 20,
      capacity: 'Full kit'
    }
  ];

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

  // Cart Sidebar Component
  const CartSidebar = () => {
    const cartSummary = CartService.getCartSummary();
    
    return (
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isCartOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`} onClick={() => setIsCartOpen(false)}></div>
        
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {cartCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartSummary.isEmpty ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some avocado harvesting tools to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 rounded-lg border border-gray-200 p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-green-600">
                            {item.price.toLocaleString()} RWF
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {item.originalPrice.toLocaleString()} RWF
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.capacity}</p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
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
                      <span className="font-medium text-green-600">
                        -{cartSummary.totalDiscount.toLocaleString()} RWF
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-green-600">{cartSummary.total.toLocaleString()} RWF</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg py-3 px-4 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{background: 'linear-gradient(to right, #ea580c, #1F310A)'}}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative group">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex space-x-2">
              {[1,2,3,4].map(i => (
                <img 
                  key={i}
                  src={product.image} 
                  alt={`${product.name} view ${i}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-orange-500 cursor-pointer transition-all duration-200 hover:scale-110"
                />
              ))}
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
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full animate-bounce">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold" style={{color: '#1F310A'}}>{product.price} RWF</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">{product.originalPrice} RWF</span>
                )}
              </div>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Timer className="w-4 h-4" />
                <span>Capacity: {product.capacity}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
                    <CheckCircle className="w-5 h-5" style={{color: '#1F310A'}} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button 
                disabled={!product.inStock}
                onClick={() => {
                  if (product.inStock) {
                    addToCart(product);
                    onClose();
                  }
                }}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                  product.inStock 
                    ? 'text-white transform hover:scale-105 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={product.inStock ? {
                  background: 'linear-gradient(to right, #ea580c, #1F310A)',
                } : {}}
                onMouseEnter={(e) => {
                  if (product.inStock) {
                    e.target.style.background = 'linear-gradient(to right, #dc2626, #1F310A)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.inStock) {
                    e.target.style.background = 'linear-gradient(to right, #ea580c, #1F310A)';
                  }
                }}
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
                    ? 'bg-red-100 text-red-600 scale-110' 
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
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center space-x-2 text-green-900 hover:text-black transition-all duration-200 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Market</span>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2 bg-green-700 hover:bg-black text-white px-5 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl font-semibold"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-black to-green-400 mb-4 animate-fadeIn drop-shadow-lg">
              Avocado Harvesting Kits
            </h1>
            <p className="text-xl text-green-900 max-w-3xl mx-auto leading-relaxed animate-slideUp">
              Discover the best avocado harvesting tools for Rwandan farmers. From picking poles to pruning shears, all designed for the needs of Rwanda’s growers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInLeft">
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center group-hover:animate-spin">
              <Scissors className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">50+</h3>
            <p className="text-gray-600">Avocado Tools</p>
          </div>
          
    <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6" style={{color: '#1F310A'}} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Easy</h3>
            <p className="text-gray-600">Setup for Farms</p>
          </div>
          
    <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Fast</h3>
            <p className="text-gray-600">Harvesting</p>
          </div>
          
    <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-green-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2 Year</h3>
            <p className="text-gray-600">Warranty</p>
          </div>
        </div>

        {/* Filter Section */}
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Available Avocado Harvesting Kits</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Tools</option>
                <option value="picking">Picking Poles</option>
                <option value="pruning">Pruning Shears</option>
                <option value="collection">Collection Bags</option>
                <option value="sorting">Sorting Trays</option>
                <option value="complete">Complete Kits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
  <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden animate-fadeIn">
          <div className="p-8">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="group bg-gradient-to-br from-white via-green-50 to-green-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-green-200 hover:border-black transform hover:-translate-y-2 animate-slideInUp"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-3xl border-b-4 border-green-200"
                        style={{background: '#e5fbe5'}}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {product.discount && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-green-700 to-black text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse shadow-lg">
                          {product.discount}% OFF
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 space-y-2">
                        <button
                          onClick={() => toggleLike(product._id)}
                          className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                            likedProducts.has(product._id)
                              ? 'bg-red-100 text-red-600 scale-110'
                              : 'bg-white/80 text-gray-600 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedProducts.has(product._id) ? 'fill-current animate-pulse' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-all duration-300 transform hover:scale-110"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-white/90 text-sm ml-1">({product.reviews})</span>
                          </div>
                          <div className="flex items-center space-x-1 text-white/80 text-sm">
                            <Package className="w-4 h-4" />
                            <span>{product.capacity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between p-3 bg-gradient-to-br from-white to-green-50 min-h-[120px]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-green-800">{product.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-700 text-white' : 'bg-black text-white'}`}>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-base font-bold text-black">{product.price} RWF</span>
                          {product.originalPrice && (
                            <span className="text-xs text-black/40 line-through">{product.originalPrice} RWF</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-700" />
                          <span className="text-black text-xs">{product.features[0]}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => toggleLike(product._id)}
                          className={`p-2 rounded-full border-2 transition-all duration-300 transform hover:scale-110 ${
                            likedProducts.has(product._id)
                              ? 'bg-green-700 text-white border-green-700 scale-110'
                              : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                          }`}
                          title={likedProducts.has(product._id) ? 'Unlike' : 'Like'}
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-base ${
                            justAdded === product._id
                              ? 'bg-green-700 text-white'
                              : addingToCart === product._id
                              ? 'bg-black text-white'
                              : product.inStock
                              ? 'bg-gradient-to-r from-green-700 to-black text-white hover:from-black hover:to-green-700 hover:scale-105'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!product.inStock || addingToCart === product._id}
                        >
                          {addingToCart === product._id ? (
                            <>
                              <div className="w-4 h-4 inline mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : justAdded === product._id ? (
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
              <div className="text-center py-16 animate-fadeIn">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Scissors className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No avocado harvesting kits found</h3>
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
      <CartSidebar />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-green-800 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Complete Payment</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPendingOrder(null);
                    setSelectedPaymentMethod('Mobile Money');
                    setMobileProvider('');
                    setPhoneNumber('');
                    setPaymentStep('provider');
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{pendingOrder?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{pendingOrder?.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{pendingOrder?.subtotal?.toLocaleString()} RWF</span>
                  </div>
                  {pendingOrder?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{pendingOrder.discount.toLocaleString()} RWF</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="font-bold text-lg text-green-600">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>

              {/* Mobile Money Payment Steps */}
              {paymentStep === 'provider' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Select Mobile Money Provider</h3>
                  <div className="space-y-3">
                    {/* MTN Mobile Money */}
                    <div
                      onClick={() => handleProviderSelect('MTN')}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-yellow-400 hover:bg-yellow-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">MTN Mobile Money</div>
                          <div className="text-sm text-gray-500">Pay with MTN MoMo</div>
                        </div>
                      </div>
                    </div>

                    {/* Airtel Money */}
                    <div
                      onClick={() => handleProviderSelect('Airtel')}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-red-400 hover:bg-red-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Airtel Money</div>
                          <div className="text-sm text-gray-500">Pay with Airtel Money</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentStep === 'phone' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Enter Phone Number</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mobileProvider === 'MTN' ? 'bg-yellow-400' :
                        mobileProvider === 'Airtel' ? 'bg-red-500' : 'bg-blue-600'
                      }`}>
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{mobileProvider} Mobile Money</div>
                        <div className="text-sm text-gray-500">Selected provider</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="07xxxxxxxx"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        maxLength="10"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Enter your {mobileProvider} mobile money number
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setPaymentStep('provider')}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePhoneSubmit}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-green-800 text-white rounded-lg hover:from-orange-600 hover:to-green-900"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentStep === 'confirm' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Confirm Payment</h3>
                  <div className="space-y-4">
                    {/* Payment Details */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-medium">{mobileProvider} Mobile Money</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone Number:</span>
                        <span className="font-medium">{phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-green-600">{pendingOrder?.totalAmount?.toLocaleString()} RWF</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Payment Instructions:</p>
                          <p>1. You will receive a payment prompt on {phoneNumber}</p>
                          <p>2. Enter your {mobileProvider} PIN to confirm</p>
                          <p>3. Wait for payment confirmation</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setPaymentStep('phone')}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        disabled={paymentProcessing}
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePaymentComplete}
                        disabled={paymentProcessing}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                          paymentProcessing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-green-800 text-white hover:from-orange-600 hover:to-green-900'
                        }`}
                      >
                        {paymentProcessing ? (
                          <>
                            <div className="w-5 h-5 inline mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5 inline mr-2" />
                            Pay Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style>{`
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