import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, RefreshCw, Trash2, PlusCircle, MinusCircle, Filter, X, User, Package, Tag } from 'lucide-react';

// Utility for in-memory storage
const DEMO_FARMERS = [
  { id: 1, name: 'Jean Baptiste Uwimana', location: 'Kigali', phone: '+250781234567' },
  { id: 2, name: 'Marie Claire Mukamana', location: 'Musanze', phone: '+250782345678' },
  { id: 3, name: 'John Kwizera', location: 'Huye', phone: '+250783456789' },
  { id: 4, name: 'Agnes Uwimana', location: 'Rubavu', phone: '+250784567890' },
  { id: 5, name: 'Emmanuel Habimana', location: 'Nyagatare', phone: '+250785678901' },
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [farmers] = useState(DEMO_FARMERS);
  const [kitRequests, setKitRequests] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', stock: 0, description: '' });
  const [newRequest, setNewRequest] = useState({
    category: '',
    productId: '',
    farmerId: '',
    quantity: 1,
    urgency: 'normal',
    purpose: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [kitStatusFilter, setKitStatusFilter] = useState('all');
  const [currentRole, setCurrentRole] = useState('agent');

  const currentAgent = { id: 1, name: 'Jean Baptiste Uwimana', region: 'Northern Province' };

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const availableProducts = useMemo(() => {
    return newRequest.category && newRequest.category !== 'all'
      ? products.filter(p => p.category === newRequest.category && p.stock > 0)
      : products.filter(p => p.stock > 0);
  }, [products, newRequest.category]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(product => categoryFilter === 'all' ? true : product.category === categoryFilter)
      .filter(product => {
        if (stockStatusFilter === 'all') return true;
        if (stockStatusFilter === 'inStock') return product.stock > 0;
        if (stockStatusFilter === 'lowStock') return product.stock > 0 && product.stock < 10;
        if (stockStatusFilter === 'outOfStock') return product.stock === 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stock') return b.stock - a.stock;
        return 0;
      });
  }, [products, searchTerm, categoryFilter, stockStatusFilter, sortBy]);

  const filteredRequests = useMemo(() => {
    return kitRequests
      .filter(request => kitStatusFilter === 'all' || request.status === kitStatusFilter)
      .filter(request => currentRole === 'agent' ? request.agentId === currentAgent.id : true);
  }, [kitRequests, kitStatusFilter, currentRole, currentAgent.id]);

  useEffect(() => {
    const AVOCADO_KITS = [
      {
        id: 101,
        name: 'Professional Harvesting Pole',
        category: 'Harvesting',
        stock: 50,
        description: 'Used to pick avocados from tall trees without damaging the fruit.',
        image: 'https://images.pexels.com/photos/5412162/pexels-photo-5412162.jpeg',
      },
      {
        id: 102,
        name: 'Fruit Picking Bag',
        category: 'Harvesting',
        stock: 40,
        description: 'Collects avocados during harvesting, designed for easy carrying and durability.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      },
      {
        id: 103,
        name: 'Pruning Shears',
        category: 'Harvesting',
        stock: 60,
        description: 'Sharp shears for pruning branches to improve tree health and fruit quality.',
        image: 'https://images.pexels.com/photos/3265887/pexels-photo-3265887.jpeg',
      },
      {
        id: 104,
        name: 'Harvesting Basket',
        category: 'Harvesting',
        stock: 30,
        description: 'Durable basket for collecting and transporting avocados from the orchard.',
        image: 'https://images.unsplash.com/photo-1510629954389-c1e0b9043c95',
      },
      {
        id: 201,
        name: 'Drip Irrigation Kit',
        category: 'Irrigation',
        stock: 25,
        description: 'Efficient water delivery system for avocado trees, optimized for hilly terrains of Rwanda.',
        image: 'https://images.pexels.com/photos/128036/pexels-photo-128036.jpeg',
      },
      {
        id: 202,
        name: 'Sprinkler System',
        category: 'Irrigation',
        stock: 20,
        description: 'Provides uniform water distribution for avocado orchards.',
        image: 'https://images.unsplash.com/photo-1599134842279-fe807d02cf0b',
      },
      {
        id: 203,
        name: 'Water Pump',
        category: 'Irrigation',
        stock: 15,
        description: 'High-capacity pump for irrigation in large avocado farms.',
        image: 'https://images.pexels.com/photos/3804453/pexels-photo-3804453.jpeg',
      },
      {
        id: 301,
        name: 'Safety Boots',
        category: 'Safety and Protection',
        stock: 50,
        description: 'Protect feet from mud, sharp objects, and chemical spills while working in the orchard.',
        image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d',
      },
      {
        id: 302,
        name: 'Work Overalls',
        category: 'Safety and Protection',
        stock: 40,
        description: 'Provides full-body protection from dirt, scratches, and chemical exposure.',
        image: 'https://images.unsplash.com/photo-1591290384831-5c8e3b8e8b4d',
      },
      {
        id: 303,
        name: 'Protective Hat',
        category: 'Safety and Protection',
        stock: 60,
        description: 'Shields workers from sun exposure and heat during long working hours in Rwanda.',
        image: 'https://images.unsplash.com/photo-1567604136-5c3e2a0d8d5d',
      },
      {
        id: 304,
        name: 'Protective Gloves',
        category: 'Safety and Protection',
        stock: 80,
        description: 'Safeguards hands when handling pruning tools, chemicals, or fruits.',
        image: 'https://images.pexels.com/photos/3999537/pexels-photo-3999537.jpeg',
      },
      {
        id: 305,
        name: 'Protective Mask',
        category: 'Safety and Protection',
        stock: 30,
        description: 'Provides protection against chemical inhalation during spraying activities.',
        image: 'https://images.unsplash.com/photo-1588666592823-4ddd9a93f6d8',
      },
      {
        id: 306,
        name: 'General Protective Clothing',
        category: 'Safety and Protection',
        stock: 20,
        description: 'Required for Global GAP and SMETA certification to ensure safe and professional work.',
        image: 'https://images.pexels.com/photos/7679757/pexels-photo-7679757.jpeg',
      },
    ];
    setProducts(AVOCADO_KITS);
    setKitRequests([]);
  }, []);

  const addKitRequest = useCallback(
    ({ farmerId, farmerName, farmerLocation, farmerPhone, kitType, category, agentId, agentName, quantity, urgency, purpose, notes }) => {
      const product = products.find(p => p.name === kitType);
      if (!product || product.stock < quantity) {
        setError('Selected kit is out of stock or insufficient quantity available');
        return;
      }

      const newRequest = {
        id: Date.now(),
        farmerId,
        farmerName,
        farmerLocation,
        farmerPhone,
        kitType,
        category,
        agentId,
        agentName,
        quantity,
        urgency,
        purpose,
        notes,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      setKitRequests([newRequest, ...kitRequests]);
      setSuccess(`Toolkit request submitted successfully for ${farmerName}!`);
      setTimeout(() => setSuccess(null), 5000);
    },
    [kitRequests, products]
  );

  const updateKitRequestStatus = useCallback(
    (requestId, status) => {
      const request = kitRequests.find(r => r.id === requestId);
      if (!request) return;

      if (status === 'fulfilled') {
        const product = products.find(p => p.name === request.kitType);
        if (!product || product.stock < request.quantity) {
          setError('Not enough stock to fulfill this request');
          return;
        }
        setProducts(products.map(p => (p.name === request.kitType ? { ...p, stock: p.stock - request.quantity } : p)));
        setSuccess(`Request fulfilled successfully for ${request.farmerName}!`);
        setTimeout(() => setSuccess(null), 5000);
      }

      setKitRequests(kitRequests.map(r => (r.id === requestId ? { ...r, status, processedAt: new Date().toISOString() } : r)));
    },
    [kitRequests, products]
  );

  const handleAddProduct = useCallback(
    (e) => {
      e.preventDefault();
      if (!newProduct.name.trim() || !newProduct.category) {
        setError('Kit name and category are required');
        return;
      }

      setLoading(true);
      setError(null);

      setTimeout(() => {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        setProducts([...products, { ...newProduct, id: newId }]);
        setNewProduct({ name: '', category: '', stock: 0, description: '' });
        setShowAddForm(false);
        setLoading(false);
        setSuccess('New toolkit added successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }, 500);
    },
    [newProduct, products]
  );

  const handleUpdateStock = useCallback(
    (productId, newStock) => {
      if (newStock < 0) return;

      setLoading(true);
      setError(null);

      setTimeout(() => {
        setProducts(products.map(product => (product.id === productId ? { ...product, stock: newStock } : product)));
        setLoading(false);
        setSuccess('Stock updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }, 300);
    },
    [products]
  );

  const handleDeleteProduct = useCallback(
    (productId) => {
      if (!window.confirm('Are you sure you want to delete this kit?')) return;

      setLoading(true);
      setError(null);

      setTimeout(() => {
        setProducts(products.filter(product => product.id !== productId));
        setLoading(false);
        setSuccess('Toolkit deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }, 300);
    },
    [products]
  );

  const handleAddRequest = useCallback(
    (e) => {
      e.preventDefault();

      const errors = [];
      if (!newRequest.category || newRequest.category === '') errors.push('Category');
      if (!newRequest.productId) errors.push('Kit name');
      if (!newRequest.farmerId) errors.push('Farmer');
      if (!newRequest.purpose.trim()) errors.push('Purpose');
      if (newRequest.quantity < 1) errors.push('Valid quantity');

      if (errors.length > 0) {
        setError(`Please provide: ${errors.join(', ')}`);
        return;
      }

      const product = products.find(p => p.id === parseInt(newRequest.productId));
      const farmer = farmers.find(f => f.id === parseInt(newRequest.farmerId));

      if (!product || !farmer) {
        setError('Invalid kit or farmer selection');
        return;
      }

      if (product.stock < newRequest.quantity) {
        setError(`Insufficient stock. Only ${product.stock} units available.`);
        return;
      }

      setLoading(true);

      setTimeout(() => {
        addKitRequest({
          farmerId: newRequest.farmerId,
          farmerName: farmer.name,
          farmerLocation: farmer.location,
          farmerPhone: farmer.phone,
          kitType: product.name,
          category: newRequest.category,
          agentId: currentAgent.id,
          agentName: currentAgent.name,
          quantity: newRequest.quantity,
          urgency: newRequest.urgency,
          purpose: newRequest.purpose,
          notes: newRequest.notes,
        });

        setNewRequest({
          category: '',
          productId: '',
          farmerId: '',
          quantity: 1,
          urgency: 'normal',
          purpose: '',
          notes: '',
        });
        setShowRequestForm(false);
        setLoading(false);
      }, 500);
    },
    [newRequest, products, farmers, addKitRequest, currentAgent]
  );

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

  const getUrgencyColor = (urgency) => {
    if (urgency === 'urgent') return 'bg-red-100 text-red-800';
    if (urgency === 'high') return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Avocado Toolkit Management</h1>
            <p className="mt-2 text-sm text-gray-600">Empowering Rwandan avocado farmers with essential tools</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Total Kits: <span className="text-gray-900">{products.length}</span></span>
            {currentRole === 'manager' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Toolkit
              </button>
            )}
            {currentRole === 'agent' && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" /> Request Toolkit
              </button>
            )}
          </div>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
          <select
            id="role"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          >
            <option value="agent">Extension Agent</option>
            <option value="manager">Shop Manager/Admin</option>
          </select>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-800 flex-1">{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Request Toolkit Modal (Agent) */}
        {showRequestForm && currentRole === 'agent' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={() => setShowRequestForm(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full mx-4 p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-90 duration-300 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Request Toolkit for Farmer</h3>
                </div>
                <button onClick={() => setShowRequestForm(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-green-700 bg-green-100 rounded-lg px-3 py-2 mb-6">Complete all required fields to request a toolkit.</p>
              <form onSubmit={handleAddRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Selection */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Tag className="w-4 h-4 text-green-600" />
                        </div>
                        Toolkit Category *
                      </div>
                    </label>
                    <select
                      value={newRequest.category}
                      onChange={e => setNewRequest({ ...newRequest, category: e.target.value, productId: '' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                      required
                    >
                      <option value="">Select Category First</option>
                      <option value="Harvesting">🌾 Harvesting</option>
                      <option value="Irrigation">💧 Irrigation</option>
                      <option value="Safety and Protection">🛡️ Safety and Protection</option>
                    </select>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-200 transition-all duration-200 pointer-events-none"></div>
                  </div>

                  {/* Kit Selection */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        Toolkit Name *
                      </div>
                    </label>
                    <select
                      value={newRequest.productId}
                      onChange={e => setNewRequest({ ...newRequest, productId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white hover:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!newRequest.category}
                      required
                    >
                      <option value="">{newRequest.category ? 'Select Toolkit' : 'Select Category First'}</option>
                      {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </option>
                      ))}
                    </select>
                    {newRequest.category && availableProducts.length === 0 && (
                      <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded-lg">No toolkits available in this category</p>
                    )}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                {/* Farmer Selection */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      Farmer *
                    </div>
                  </label>
                  <select
                    value={newRequest.farmerId}
                    onChange={e => setNewRequest({ ...newRequest, farmerId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-sm bg-white hover:border-purple-400"
                    required
                  >
                    <option value="">Select Farmer</option>
                    {farmers.map(farmer => (
                      <option key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.location}
                      </option>
                    ))}
                  </select>
                  {newRequest.farmerId && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium">📞 {farmers.find(f => f.id === parseInt(newRequest.farmerId))?.phone}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-200 transition-all duration-200 pointer-events-none"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <span className="text-orange-600 font-bold text-sm">#</span>
                        </div>
                        Quantity *
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={availableProducts.find(p => p.id === parseInt(newRequest.productId))?.stock || 1}
                      value={newRequest.quantity}
                      onChange={e => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-sm bg-white hover:border-orange-400"
                      required
                    />
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-orange-200 transition-all duration-200 pointer-events-none"></div>
                  </div>

                  {/* Urgency */}
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                          </svg>
                        </div>
                        Urgency Level
                      </div>
                    </label>
                    <select
                      value={newRequest.urgency}
                      onChange={e => setNewRequest({ ...newRequest, urgency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-200 text-sm bg-white hover:border-red-400"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-red-200 transition-all duration-200 pointer-events-none"></div>
                  </div>
                </div>

                {/* Purpose */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-teal-100 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      Purpose of Request *
                    </div>
                  </label>
                  <select
                    value={newRequest.purpose}
                    onChange={e => setNewRequest({ ...newRequest, purpose: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all duration-200 text-sm bg-white hover:border-teal-400"
                    required
                  >
                    <option value="">Select Purpose</option>
                    <option value="New Farm Setup">New Farm Setup</option>
                    <option value="Equipment Replacement">Equipment Replacement</option>
                    <option value="Farm Expansion">Farm Expansion</option>
                    <option value="Seasonal Preparation">Seasonal Preparation</option>
                    <option value="Quality Improvement">Quality Improvement</option>
                    <option value="Safety Compliance">Safety Compliance</option>
                  </select>
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-teal-200 transition-all duration-200 pointer-events-none"></div>
                </div>

                {/* Notes */}
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      Additional Notes
                    </div>
                  </label>
                  <textarea
                    value={newRequest.notes}
                    onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 text-sm bg-white hover:border-gray-400"
                    rows="4"
                    placeholder="Any additional information about this request..."
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 transition-all duration-200 pointer-events-none"></div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Toolkit Modal (Manager) */}
        {showAddForm && currentRole === 'manager' && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"
            onClick={() => setShowAddForm(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full mx-4 p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-90 duration-300 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Add New Toolkit</h3>
                </div>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      Toolkit Name *
                    </div>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Protective Gloves"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-200 transition-all duration-200 pointer-events-none"></div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                      Category *
                    </div>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white hover:border-blue-400"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Harvesting">🌾 Harvesting</option>
                    <option value="Irrigation">💧 Irrigation</option>
                    <option value="Safety and Protection">🛡️ Safety and Protection</option>
                  </select>
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-200 pointer-events-none"></div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      Description
                    </div>
                  </label>
                  <textarea
                    placeholder="Describe the toolkit for Rwandan avocado farming"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 text-sm bg-white hover:border-gray-400"
                    rows="4"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 transition-all duration-200 pointer-events-none"></div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <span className="text-orange-600 font-bold text-sm">#</span>
                      </div>
                      Initial Stock
                    </div>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-sm bg-white hover:border-orange-400"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-orange-200 transition-all duration-200 pointer-events-none"></div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      'Add Toolkit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toolkit Requests Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-green-800">
              {currentRole === 'agent' ? 'My Toolkit Requests' : 'All Toolkit Requests'}
            </h2>
            <select
              value={kitStatusFilter}
              onChange={e => setKitStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-green-600"></div>
                <p className="mt-4 text-sm text-gray-600">Loading requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No toolkit requests found. {currentRole === 'agent' ? 'Start by requesting a toolkit for a farmer.' : ''}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toolkit Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {currentRole === 'manager' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map(request => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-semibold text-green-800">{request.farmerName}</div>
                              <div className="text-xs text-gray-500">{request.farmerLocation}</div>
                              <div className="text-xs text-gray-400">{request.farmerPhone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{request.kitType}</div>
                          <div className="text-xs text-gray-500">{request.category}</div>
                          <div className="text-xs text-blue-600">Qty: {request.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.purpose}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)} mt-1`}>
                            {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                          </span>
                          {request.notes && <div className="text-xs text-gray-500 mt-1 italic">{request.notes}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.agentName}</div>
                          <div className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getRequestStatus(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          {request.processedAt && (
                            <div className="text-xs text-gray-400 mt-1">{new Date(request.processedAt).toLocaleDateString()}</div>
                          )}
                        </td>
                        {currentRole === 'manager' && request.status === 'pending' && (
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => updateKitRequestStatus(request.id, 'fulfilled')}
                                className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                              >
                                Fulfill
                              </button>
                              <button
                                onClick={() => updateKitRequestStatus(request.id, 'rejected')}
                                className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                              >
                                Reject
                              </button>
                            </div>
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

        {/* Toolkit Inventory Section (Manager) */}
        {currentRole === 'manager' && (
          <>
            <div className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search toolkits..."
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={stockStatusFilter}
                      onChange={e => setStockStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                    >
                      <option value="all">All Stock Status</option>
                      <option value="inStock">In Stock</option>
                      <option value="lowStock">Low Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                    </select>
                  </div>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="stock">Sort by Stock</option>
                  </select>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <h2 className="px-6 py-4 text-lg font-semibold text-gray-900 border-b border-gray-200">Toolkit Inventory for Rwandan Avocado Farms</h2>
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-green-600"></div>
                  <p className="mt-4 text-sm text-gray-600">Loading inventory...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <div
                          key={product.id}
                          className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                        >
                          {product.image && (
                            <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                          )}
                          <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-xs text-gray-500">{product.category}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                          <p className="text-sm font-medium text-gray-900 mt-2">Stock: {product.stock} units</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color} mt-2`}>
                            {stockStatus.text}
                          </span>
                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStock(product.id, product.stock + 1)}
                              className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                            >
                              <PlusCircle className="w-3 h-3 inline mr-1" /> Add
                            </button>
                            <button
                              onClick={() => handleUpdateStock(product.id, product.stock - 1)}
                              disabled={product.stock === 0}
                              className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              <MinusCircle className="w-3 h-3 inline mr-1" /> Remove
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No toolkits found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No toolkits match your search.' : 'Get started by adding your first toolkit.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-6 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Toolkit
                    </button>
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