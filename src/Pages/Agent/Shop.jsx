import { useEffect, useState, useCallback, useMemo } from 'react';
import { ShoppingCart, X, CheckCircle, Loader2, Minus, Plus, Trash2, Filter, Search, User, Users, Heart, Package } from 'lucide-react';
import { getAllProducts } from '../../services/productsService';
import { listFarmers } from '../../services/usersService';
import { getAgentInformation } from '../../services/agent-information';
import AgentShopHeader from '../../components/AgentShop/AgentShopHeader';
import AgentShopProductGrid from '../../components/AgentShop/AgentShopProductGrid';
import AgentShopModeSelection from '../../components/AgentShop/AgentShopModeSelection';
import AgentShopFarmerSelection from '../../components/AgentShop/AgentShopFarmerSelection';

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
          const response = await listFarmers({ limit: 100 });
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
    return <AgentShopModeSelection onSelectMode={handleModeSelection} />;
  }

  // STEP 2: Farmer Selection (only if behalf mode)
  if (currentStep === 2 && purchaseMode === 'behalf') {
    return (
      <AgentShopFarmerSelection
        farmers={filteredFarmers}
        loading={loading}
        searchTerm={searchFarmerTerm}
        onSearchChange={setSearchFarmerTerm}
        districts={getUniqueDistricts()}
        selectedDistrict={selectedDistrict}
        onDistrictChange={(district) => {
          setSelectedDistrict(district);
          setSelectedSector('');
          setSelectedCell('');
        }}
        sectors={getUniqueSectors()}
        selectedSector={selectedSector}
        onSectorChange={(sector) => {
          setSelectedSector(sector);
          setSelectedCell('');
        }}
        cells={getUniqueCells()}
        selectedCell={selectedCell}
        onCellChange={setSelectedCell}
        onClearFilters={() => {
          setSelectedDistrict('');
          setSelectedSector('');
          setSelectedCell('');
          setSearchFarmerTerm('');
        }}
        onSelectFarmer={handleFarmerSelection}
        onBack={handleBackToMode}
      />
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
      <div className="h-screen flex flex-col overflow-hidden">
        <AgentShopHeader
          purchaseMode={purchaseMode}
          selectedFarmer={selectedFarmer}
          currentStep={currentStep}
          cartCount={cartCount}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          categories={categories}
          onBackToFarmers={handleBackToFarmers}
          onBackToMode={handleBackToMode}
          onCartOpen={() => setIsCartOpen(true)}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
        />

        <AgentShopProductGrid
          loading={loading}
          filteredProducts={filteredProducts}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          addingToCart={addingToCart}
          justAdded={justAdded}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  );
}