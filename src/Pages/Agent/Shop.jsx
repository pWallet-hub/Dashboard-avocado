import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, RefreshCw, Trash2, PlusCircle, MinusCircle, Filter } from 'lucide-react';
import { listProducts } from '../../services/productsService';

// Utility for localStorage
const DEMO_PRODUCTS = [
  { id: 1, name: 'Avocado Harvesting Tools', category: 'Harvesting', stock: 50, description: 'Essential tools for efficient avocado harvesting in Rwandan orchards, including pruning shears, picking poles, and collection baskets adapted to local terrain.' },
  { id: 2, name: 'Avocado Safety and Protection Tools', category: 'Safety and Protection', stock: 100, description: 'Protective gear for Rwandan avocado farmers, including gloves, safety goggles, and organic insecticides to safeguard against pests common in Rwanda.' },
  { id: 3, name: 'Avocado Irrigation Tools', category: 'Irrigation', stock: 30, description: 'Drip irrigation system with hoses and emitters optimized for avocado farms in Rwanda, promoting water efficiency in hilly landscapes.' },
];

const DEMO_FARMERS = [
  { id: 1, name: 'Jean Baptiste Uwimana' },
  { id: 2, name: 'Marie Claire' },
  { id: 3, name: 'John Kwizera' },
];

const lsSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to set ${key} in localStorage:`, e);
  }
};

const seedIfEmpty = (key, defaultValue) => {
  try {
    const existing = localStorage.getItem(key);
    if (!existing) {
      lsSet(key, defaultValue);
      return defaultValue;
    }
    return JSON.parse(existing);
  } catch {
    return defaultValue;
  }
};

const KIT_REQUESTS_KEY = 'demo:kitRequests';
const getKitRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(KIT_REQUESTS_KEY)) || [];
  } catch {
    return [];
  }
};

const saveKitRequests = (requests) => {
  lsSet(KIT_REQUESTS_KEY, requests);
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [farmers] = useState(DEMO_FARMERS); // Static for demo; replace with API call if needed
  const [kitRequests, setKitRequests] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', stock: 0, description: '' });
  const [newRequest, setNewRequest] = useState({ productId: '', farmerId: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [kitStatusFilter, setKitStatusFilter] = useState('all');
  const [currentRole, setCurrentRole] = useState('agent'); // 'agent' or 'manager'

  // Mock current agent (integrates with AgentProfile)
  const currentAgent = { id: 1, name: 'Jean Baptiste Uwimana' };

  // Unique categories for filter
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(product => categoryFilter === 'all' ? true : product.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return b.stock - a.stockleaning;
      return 0;
    });

  // Filter kit requests based on status and role
  const filteredRequests = kitRequests
    .filter(request => kitStatusFilter === 'all' || request.status === kitStatusFilter)
    .filter(request => currentRole === 'agent' ? request.agentId === currentAgent.id : true);

  // Load data from localStorage
  useEffect(() => {
    // Avocado farming tools for Rwanda
    const AVOCADO_KITS = [
      { id: 101, name: 'Avocado Harvesting Pole', stock: 12 },
      { id: 102, name: 'Fruit Picking Bag', stock: 20 },
      { id: 103, name: 'Pruning Shears', stock: 15 },
      { id: 104, name: 'Protective Gloves', stock: 30 },
      { id: 105, name: 'Harvesting Basket', stock: 18 },
      { id: 106, name: 'Ladder', stock: 8 },
      { id: 107, name: 'Sorting Tray', stock: 10 },
      { id: 109, name: 'Field Knife', stock: 25 }
    ];
    // Seed with avocado kits if not present
    let seededProducts = seedIfEmpty('demo:products', AVOCADO_KITS);
    // If DEMO_PRODUCTS already present, merge avocado kits
    if (Array.isArray(seededProducts) && seededProducts.length < AVOCADO_KITS.length) {
      const merged = [...AVOCADO_KITS, ...seededProducts.filter(p => !AVOCADO_KITS.some(k => k.name === p.name))];
      lsSet('demo:products', merged);
      seededProducts = merged;
    }
    setProducts(Array.isArray(seededProducts) ? seededProducts : []);
    setKitRequests(getKitRequests());
  }, []);

  // Fetch Airtable products (logs only)
  useEffect(() => {
    const fetchAirtableProducts = async () => {
      try {
        const page = await listProducts({ pageSize: 5, returnFieldsByFieldId: true });
        console.log('[Airtable] Products fetched (preview):', page?.records?.length ?? 0, 'records');
      } catch (e) {
        console.debug('[Airtable] Products fetch failed (non-blocking):', e?.message || e);
      }
    };
    fetchAirtableProducts();
  }, []);

  const saveProducts = useCallback((updatedProducts) => {
    lsSet('demo:products', updatedProducts);
  }, []);

  const addKitRequest = useCallback(({ farmerId, farmerName, kitType, agentId, agentName, quantity }) => {
    const product = products.find(p => p.name === kitType);
    if (!product || product.stock < quantity) {
      setError('Selected tool set is out of stock or insufficient quantity available');
      return;
    }
    const newRequest = {
      id: Date.now(),
      farmerId,
      farmerName,
      kitType,
      agentId,
      agentName,
      quantity,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    const updatedRequests = [newRequest, ...kitRequests];
    setKitRequests(updatedRequests);
    saveKitRequests(updatedRequests);
  }, [kitRequests, products]);

  const updateKitRequestStatus = useCallback((requestId, status) => {
    const request = kitRequests.find(r => r.id === requestId);
    if (!request) return;

    if (status === 'fulfilled') {
      const product = products.find(p => p.name === request.kitType);
      if (!product || product.stock < request.quantity) {
        setError('Not enough stock to fulfill this request');
        return;
      }
      const updatedProducts = products.map(p =>
        p.name === request.kitType ? { ...p, stock: p.stock - request.quantity } : p
      );
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
    }

    const updatedRequests = kitRequests.map(r =>
      r.id === requestId ? { ...r, status } : r
    );
    setKitRequests(updatedRequests);
    saveKitRequests(updatedRequests);
  }, [kitRequests, products, saveProducts]);

  const handleAddProduct = useCallback((e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.category) {
      setError('Tool set name and category are required');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      const productToAdd = { ...newProduct, id: newId };
      const updatedProducts = [...products, productToAdd];
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      setNewProduct({ name: '', category: '', stock: 0, description: '' });
      setShowAddForm(false);
      setLoading(false);
    }, 500);
  }, [newProduct, products, saveProducts]);

  const handleUpdateStock = useCallback((productId, newStock) => {
    if (newStock < 0) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const updatedProducts = products.map(product =>
        product.id === productId ? { ...product, stock: newStock } : product
      );
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      setLoading(false);
    }, 300);
  }, [products, saveProducts]);

  const handleDeleteProduct = useCallback((productId) => {
    if (!window.confirm('Are you sure you want to delete this tool set?')) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      saveProducts(updatedProducts);
      setLoading(false);
    }, 300);
  }, [products, saveProducts]);

  const handleAddRequest = useCallback((e) => {
    e.preventDefault();
    if (!newRequest.productId || !newRequest.farmerId || newRequest.quantity < 1) {
      setError('Please select tool set, farmer, and valid quantity');
      return;
    }

    const product = products.find(p => p.id === parseInt(newRequest.productId));
    const farmer = farmers.find(f => f.id === parseInt(newRequest.farmerId));
    if (!product || !farmer) {
      setError('Invalid tool set or farmer selection');
      return;
    }

    addKitRequest({
      farmerId: newRequest.farmerId,
      farmerName: farmer.name,
      kitType: product.name,
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      quantity: newRequest.quantity,
    });
    setNewRequest({ productId: '', farmerId: '', quantity: 1 });
    setShowRequestForm(false);
  }, [newRequest, products, farmers, addKitRequest, currentAgent]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getRequestStatus = (status) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'fulfilled') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Role Selector */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Current Role
          </label>
          <select
            id="role"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] sm:text-sm transition-colors duration-200"
            aria-label="Select user role"
          >
            <option value="agent">Extension Agent</option>
            <option value="manager">Shop Manager/Admin</option>
          </select>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Avocado Farming Tools Management</h1>
              <p className="mt-2 text-lg text-gray-600">Supporting avocado farming in Rwanda</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Total Tool Sets: <span className="font-semibold text-gray-900">{products.length}</span>
              </div>
              {currentRole === 'manager' && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1F310A] border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] transition-opacity duration-200"
                  aria-label="Add new tool set"
                >
                  <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                  Add Tool Set
                </button>
              )}
              {currentRole === 'agent' && (
                <button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1F310A] border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] transition-opacity duration-200"
                  aria-label="Request tool set for farmer"
                >
                  <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                  Request Tool Set
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg transition-all duration-300">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600 transition-colors duration-200"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Add Tool Set Form (Manager only) */}
        {currentRole === 'manager' && showAddForm && (
          <div className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Add New Avocado Tool Set</h2>
            <form onSubmit={handleAddProduct}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="kitName" className="block text-sm font-medium text-gray-700">
                      Tool Set Name
                    </label>
                    <input
                      id="kitName"
                      type="text"
                      placeholder="e.g., Avocado Harvesting Tools"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Tool set name"
                    />
                  </div>
                  <div>
                    <label htmlFor="kitCategory" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="kitCategory"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Select category"
                    >
                      <option value="">Select Category</option>
                      <option value="Harvesting">Harvesting</option>
                      <option value="Safety and Protection">Safety and Protection</option>
                      <option value="Irrigation">Irrigation</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="kitDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="kitDescription"
                    placeholder="Describe the tool set for Rwandan avocado farming"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                    rows="3"
                    aria-label="Tool set description"
                  />
                </div>
                <div>
                  <label htmlFor="kitStock" className="block text-sm font-medium text-gray-700">
                    Initial Stock
                  </label>
                  <input
                    id="kitStock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                    aria-label="Initial stock"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] transition-colors duration-200"
                    aria-label="Cancel adding tool set"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1F310A] border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] disabled:opacity-50 transition-opacity duration-200"
                    aria-label="Add tool set"
                  >
                    {loading ? 'Adding...' : 'Add Tool Set'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Request Tool Set Form (Agent only) */}
        {currentRole === 'agent' && showRequestForm && (
          <div className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-300">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Request Avocado Tool Set for Farmer</h2>
            <form onSubmit={handleAddRequest}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="requestProduct" className="block text-sm font-medium text-gray-700">
                      Avocado Tool Set
                    </label>
                    <select
                      id="requestProduct"
                      value={newRequest.productId}
                      onChange={(e) => setNewRequest({ ...newRequest, productId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Select avocado tool set"
                    >
                      <option value="">Select Tool Set</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.category}) - Stock: {product.stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="requestFarmer" className="block text-sm font-medium text-gray-700">
                      Farmer
                    </label>
                    <select
                      id="requestFarmer"
                      value={newRequest.farmerId}
                      onChange={(e) => setNewRequest({ ...newRequest, farmerId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Select farmer"
                    >
                      <option value="">Select Farmer</option>
                      {farmers.map(farmer => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="requestQuantity" className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      id="requestQuantity"
                      type="number"
                      min="1"
                      value={newRequest.quantity}
                      onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Request quantity"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] transition-colors duration-200"
                    aria-label="Cancel tool set request"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1F310A] border border-transparent rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] disabled:opacity-50 transition-opacity duration-200"
                    aria-label="Submit tool set request"
                  >
                    {loading ? 'Requesting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tool Set Requests Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1F310A]">
              {currentRole === 'agent' ? 'My Avocado Tool Set Requests' : 'All Avocado Tool Set Requests'}
            </h2>
            <select
              value={kitStatusFilter}
              onChange={e => setKitStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] transition-colors duration-200"
              style={{ borderColor: '#1F310A' }}
              aria-label="Filter requests by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
            {loading ? (
              <div className="p-12 text-center">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
                  style={{ borderColor: '#1F310A' }}
                  role="status"
                  aria-label="Loading requests"
                ></div>
                <p className="mt-4 text-sm text-gray-600">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                No tool set requests found. {currentRole === 'agent' ? 'Start by requesting a tool set for a farmer.' : ''}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farmer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tool Set Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested At
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {currentRole === 'manager' && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map(request => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#1F310A]">
                          {request.farmerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.kitType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.agentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getRequestStatus(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        {currentRole === 'manager' && request.status === 'pending' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => updateKitRequestStatus(request.id, 'fulfilled')}
                              className="px-3 py-1 mr-2 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                              aria-label={`Fulfill request for ${request.kitType}`}
                            >
                              Fulfill
                            </button>
                            <button
                              onClick={() => updateKitRequestStatus(request.id, 'rejected')}
                              className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                              aria-label={`Reject request for ${request.kitType}`}
                            >
                              Reject
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Avocado Tool Sets Section (Manager only) */}
        {currentRole === 'manager' && (
          <>
            <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg">
              <div className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    <input
                      type="text"
                      placeholder="Search avocado tool sets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Search avocado tool sets"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                        aria-label="Filter by category"
                      >
                        <option value="all">All Categories</option>
                        <option value="Harvesting">Harvesting</option>
                        <option value="Safety and Protection">Safety and Protection</option>
                        <option value="Irrigation">Irrigation</option>
                      </select>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F310A] focus:border-[#1F310A] sm:text-sm transition-colors duration-200"
                      aria-label="Sort tool sets"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="stock">Sort by Stock</option>
                    </select>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] transition-colors duration-200"
                      aria-label="Refresh tool sets"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg">
              <h2 className="px-6 py-4 text-lg font-semibold text-gray-900 border-b border-gray-200">Avocado Tool Set Inventory for Rwandan Farms</h2>
              {loading ? (
                <div className="p-12 text-center">
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
                    style={{ borderColor: '#1F310A' }}
                    role="status"
                    aria-label="Loading tool sets"
                  ></div>
                  <p className="mt-4 text-sm text-gray-600">Loading inventory...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tool Set Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock Level
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {product.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.stock} units
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateStock(product.id, product.stock + 1)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                                  aria-label={`Increase stock for ${product.name}`}
                                >
                                  <PlusCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                                  Add
                                </button>
                                <button
                                  onClick={() => handleUpdateStock(product.id, product.stock - 1)}
                                  disabled={product.stock === 0}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                  aria-label={`Decrease stock for ${product.name}`}
                                >
                                  <MinusCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                                  Remove
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                                  aria-label={`Delete ${product.name}`}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" aria-hidden="true" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No avocado tool sets found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No tool sets match your search.' : 'Get started by adding your first avocado tool set for Rwandan farmers.'}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1F310A] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F310A] transition-opacity duration-200"
                        aria-label="Add new tool set"
                      >
                        <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                        Add Tool Set
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}