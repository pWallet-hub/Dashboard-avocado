import { useEffect, useState, useCallback, useMemo } from 'react';
import { ShoppingCart, X, CheckCircle, Loader2, Minus, Plus, Trash2, Filter, Search, User, Users, Heart, Package } from 'lucide-react';
import { getProducts } from '../../services/productsService';
import { getFarmers } from '../../services/usersService';
import { getAgentInformation } from '../../services/agent-information';

// Cart Service (same as HarvestingKit)
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

// Cart Sidebar Component
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
                <p className="text-sm text-gray-500">Add some products!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3">
                    <div className="h-14 w-14 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-700" />
                    </div>
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

export default function Shop() {
  // Purchase mode state
  const [purchaseMode, setPurchaseMode] = useState('self'); // 'self' or 'behalf'
  
  // Farmer selection state (for 'behalf' mode)
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Mode, 2: Select Farmer (if behalf), 3: Shop
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchFarmerTerm, setSearchFarmerTerm] = useState('');
  const [agentInfo, setAgentInfo] = useState(null);
  const [agentTerritories, setAgentTerritories] = useState([]);
  
  // Location filters for farmers
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  
  // Product and cart state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(CartService.getCartItems());
  const [cartCount, setCartCount] = useState(CartService.getCartCount());
  const [justAdded, setJustAdded] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPhone, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState('');
  const [paymentStep, setPaymentStep] = useState('provider');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [pendingOrder, setPendingOrder] = useState(null);

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(product => categoryFilter === 'all' ? true : product.category === categoryFilter)
      .filter(product => product.status === 'available' && (product.quantity || 0) > 0);
  }, [products, searchTerm, categoryFilter]);

  // Filter farmers by agent's territory
  const filterFarmersByTerritory = (farmersList, territories) => {
    if (!territories || territories.length === 0) {
      return farmersList;
    }

    return farmersList.filter(farmer => {
      const farmerDistrict = farmer.profile?.district;
      const farmerSector = farmer.profile?.sector;

      if (!farmerDistrict || !farmerSector) return false;

      return territories.some(territory => {
        const districtMatch = territory.district?.toLowerCase() === farmerDistrict.toLowerCase();
        const sectorMatch = territory.sector?.toLowerCase() === farmerSector.toLowerCase();
        return districtMatch && sectorMatch;
      });
    });
  };

  // Fetch agent information
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const data = await getAgentInformation();
        setAgentInfo(data);
        
        if (data?.agent_profile?.territory && Array.isArray(data.agent_profile.territory)) {
          setAgentTerritories(data.agent_profile.territory);
        } else {
          setAgentTerritories([]);
        }
      } catch (error) {
        console.error('Error fetching agent info:', error);
        setAgentTerritories([]);
      }
    };
    fetchAgentInfo();
  }, []);

  // Fetch farmers when in behalf mode
  useEffect(() => {
    if (purchaseMode === 'behalf' && currentStep === 2) {
      const fetchFarmers = async () => {
        setLoading(true);
        try {
          const response = await getFarmers({ limit: 100 });
          const farmersList = response.data || [];
          const territoryFilteredFarmers = filterFarmersByTerritory(farmersList, agentTerritories);
          setFarmers(territoryFilteredFarmers);
          setFilteredFarmers(territoryFilteredFarmers);
        } catch (error) {
          console.error('Error fetching farmers:', error);
          setFarmers([]);
          setFilteredFarmers([]);
        } finally {
          setLoading(false);
        }
      };
      
      if (agentInfo !== null) {
        fetchFarmers();
      }
    }
  }, [purchaseMode, currentStep, agentInfo, agentTerritories]);

  // Filter farmers based on search and location
  useEffect(() => {
    let filtered = farmers;

    if (selectedDistrict) {
      filtered = filtered.filter(farmer => 
        (farmer.profile?.district || farmer.district)?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    if (selectedSector) {
      filtered = filtered.filter(farmer => 
        (farmer.profile?.sector || farmer.sector)?.toLowerCase() === selectedSector.toLowerCase()
      );
    }

    if (selectedCell) {
      filtered = filtered.filter(farmer => 
        (farmer.profile?.cell || farmer.cell)?.toLowerCase() === selectedCell.toLowerCase()
      );
    }

    if (searchFarmerTerm.trim() !== '') {
      filtered = filtered.filter(farmer => 
        farmer.full_name?.toLowerCase().includes(searchFarmerTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchFarmerTerm.toLowerCase()) ||
        farmer.phone?.includes(searchFarmerTerm)
      );
    }

    setFilteredFarmers(filtered);
  }, [searchFarmerTerm, selectedDistrict, selectedSector, selectedCell, farmers]);

  // Get unique districts, sectors, cells
  const getUniqueDistricts = () => {
    const districts = farmers
      .map(f => f.profile?.district || f.district)
      .filter(d => d && d.trim() !== '');
    return [...new Set(districts)].sort();
  };

  const getUniqueSectors = () => {
    let sectors = farmers;
    if (selectedDistrict) {
      sectors = farmers.filter(f => 
        (f.profile?.district || f.district)?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    const sectorList = sectors
      .map(f => f.profile?.sector || f.sector)
      .filter(s => s && s.trim() !== '');
    return [...new Set(sectorList)].sort();
  };

  const getUniqueCells = () => {
    let cells = farmers;
    if (selectedDistrict) {
      cells = cells.filter(f => 
        (f.profile?.district || f.district)?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    if (selectedSector) {
      cells = cells.filter(f => 
        (f.profile?.sector || f.sector)?.toLowerCase() === selectedSector.toLowerCase()
      );
    }
    const cellList = cells
      .map(f => f.profile?.cell || f.cell)
      .filter(c => c && c.trim() !== '');
    return [...new Set(cellList)].sort();
  };

  // Fetch products
  useEffect(() => {
    if (currentStep === 3 || (currentStep === 1 && purchaseMode === 'self')) {
      fetchProducts();
    }
  }, [currentStep, purchaseMode]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllProducts({ limit: 100, sort: '-created_at' });
      const productsData = response.data || response || [];
      
      const transformedProducts = productsData.map(product => ({
        id: String(product.id || product._id),
        name: product.name || 'Unknown Product',
        description: product.description || 'No description available',
        price: Number(product.price) || 0,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        image: (product.images && product.images.length > 0) 
          ? product.images[0] 
          : product.image_url,
        capacity: `${product.quantity || 0} ${product.unit || 'piece'}`,
        inStock: product.status === 'available' && (product.quantity || 0) > 0,
        unit: product.unit || 'piece',
        quantity: Number(product.quantity) || 0,
        category: product.category || 'general',
        status: product.status || 'available'
      }));
      
      setProducts(transformedProducts.filter(p => p.inStock));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Cart functions
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

  // Checkout and payment
  const handleCheckout = () => {
    const cartSummary = CartService.getCartSummary();
    setPendingOrder({
      id: `ORDER-${Date.now()}`,
      items: cartItems,
      totalAmount: cartSummary.total,
      buyer: purchaseMode === 'self' ? 'agent' : selectedFarmer,
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
    setPaymentStep('provider');
    setMobileProvider('');
    setPhoneNumber('');
    setPaymentError('');
    setPaymentSuccess(false);
    setPaymentProcessing(false);
    setPendingOrder(null);
  };

  const handleModeSelection = (mode) => {
    setPurchaseMode(mode);
    if (mode === 'self') {
      setCurrentStep(3); // Go directly to shop
      setSelectedFarmer(null);
    } else {
      setCurrentStep(2); // Go to farmer selection
    }
  };

  const handleFarmerSelection = (farmer) => {
    setSelectedFarmer(farmer);
    setCurrentStep(3); // Go to shop
  };

  const handleBackToMode = () => {
    setCurrentStep(1);
    setSelectedFarmer(null);
    setPurchaseMode('self');
  };

  const handleBackToFarmers = () => {
    setCurrentStep(2);
    setSelectedFarmer(null);
  };

  // STEP 1: Purchase Mode Selection
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Agent Shop</h1>
            <p className="text-gray-600">Purchase products for yourself or on behalf of farmers</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buy for Self */}
            <div 
              onClick={() => handleModeSelection('self')}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-green-500 cursor-pointer transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Buy for Myself</h3>
                <p className="text-gray-600 mb-4">Purchase products for your own use as an agent</p>
                <button className="mt-auto px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Continue
                </button>
              </div>
            </div>

            {/* Buy on Behalf of Farmer */}
            <div 
              onClick={() => handleModeSelection('behalf')}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-green-500 cursor-pointer transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Buy for a Farmer</h3>
                <p className="text-gray-600 mb-4">Purchase products on behalf of a farmer in your territory</p>
                <button className="mt-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Select Farmer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Farmer Selection (only if behalf mode)
  if (currentStep === 2 && purchaseMode === 'behalf') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button 
              onClick={handleBackToMode}
              className="mb-4 px-4 py-2 text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              ← Back to Mode Selection
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Select Farmer</h1>
            <p className="text-gray-600 mt-1">Choose a farmer from your territory to buy products on their behalf</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={searchFarmerTerm}
                    onChange={(e) => setSearchFarmerTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <select
                value={selectedDistrict}
                onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedSector(''); setSelectedCell(''); }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Districts</option>
                {getUniqueDistricts().map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>

              <select
                value={selectedSector}
                onChange={(e) => { setSelectedSector(e.target.value); setSelectedCell(''); }}
                disabled={!selectedDistrict}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">All Sectors</option>
                {getUniqueSectors().map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <select
                value={selectedCell}
                onChange={(e) => setSelectedCell(e.target.value)}
                disabled={!selectedSector}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              >
                <option value="">All Cells</option>
                {getUniqueCells().map(cell => (
                  <option key={cell} value={cell}>{cell}</option>
                ))}
              </select>

              <button
                onClick={() => { setSelectedDistrict(''); setSelectedSector(''); setSelectedCell(''); setSearchFarmerTerm(''); }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Farmers List */}
          {loading ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto text-green-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading farmers...</p>
            </div>
          ) : filteredFarmers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFarmers.map((farmer) => (
                <div
                  key={farmer.id || farmer._id}
                  onClick={() => handleFarmerSelection(farmer)}
                  className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-lg hover:border-green-500 border-2 border-transparent transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{farmer.full_name || 'Unknown Farmer'}</h3>
                      <p className="text-sm text-gray-600 truncate">{farmer.email || 'No email'}</p>
                      <p className="text-sm text-gray-600">{farmer.phone || 'No phone'}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>{farmer.profile?.district || farmer.district || 'N/A'}, {farmer.profile?.sector || farmer.sector || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Farmers Found</h3>
              <p className="text-gray-600">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STEP 3: Shop Products
  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Payment Modal (same as HarvestingKit) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
            {paymentSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">Your order has been placed successfully</p>
                <button
                  onClick={closePaymentModal}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : paymentStep === 'provider' ? (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Provider</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleProviderSelect('mtn')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left"
                  >
                    <div className="font-semibold text-gray-900">MTN Mobile Money</div>
                    <div className="text-sm text-gray-600">Pay with MTN MoMo</div>
                  </button>
                  <button
                    onClick={() => handleProviderSelect('airtel')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
                  >
                    <div className="font-semibold text-gray-900">Airtel Money</div>
                    <div className="text-sm text-gray-600">Pay with Airtel Money</div>
                  </button>
                </div>
                <button
                  onClick={closePaymentModal}
                  className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            ) : paymentStep === 'phone' ? (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Phone Number</h3>
                <input
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="078XXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-2"
                />
                {paymentError && (
                  <p className="text-sm text-red-600 mb-3">{paymentError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentStep('provider')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePhoneSubmit}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-semibold">{mobileProvider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{paymentPhone}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Buying for:</span>
                    <span className="font-semibold">{purchaseMode === 'self' ? 'Myself (Agent)' : selectedFarmer?.full_name}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-bold">Total Amount:</span>
                    <span className="text-green-600 font-bold">{pendingOrder?.totalAmount.toLocaleString()} RWF</span>
                  </div>
                </div>
                {paymentProcessing ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Processing payment...</p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep('phone')}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              {(purchaseMode === 'behalf' && currentStep === 3) && (
                <button
                  onClick={handleBackToFarmers}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  ← Change Farmer
                </button>
              )}
              {currentStep === 3 && (
                <button
                  onClick={handleBackToMode}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  ← Change Purchase Mode
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Shop</h1>
            {purchaseMode === 'behalf' && selectedFarmer && (
              <p className="text-gray-600 mt-1">
                Shopping for: <span className="font-semibold text-green-600">{selectedFarmer.full_name}</span>
              </p>
            )}
            {purchaseMode === 'self' && (
              <p className="text-gray-600 mt-1">Shopping for yourself</p>
            )}
          </div>
          
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-green-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="hidden w-full h-full items-center justify-center">
                    <Package className="w-16 h-16 text-green-600" />
                  </div>
                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      {product.price.toLocaleString()} RWF
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {product.originalPrice.toLocaleString()} RWF
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{product.capacity}</span>
                    <span className="text-xs text-green-600 font-semibold">In Stock</span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={addingToCart === product.id || justAdded === product.id}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      justAdded === product.id
                        ? 'bg-green-100 text-green-700'
                        : addingToCart === product.id
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : justAdded === product.id ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No products available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}