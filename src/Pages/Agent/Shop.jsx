import { useEffect, useState, useCallback, useMemo } from 'react';
import { Plus, Search, RefreshCw, Trash2, PlusCircle, MinusCircle, Filter, X, User, Package, Tag, Edit2, Eye, CheckCircle, Clock, Package2 } from 'lucide-react';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../services/productsService';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: 'irrigation', 
    description: '',
    price: 0,
    quantity: 0,
    unit: 'piece',
    supplier_id: '',
    status: 'available',
    sku: '',
    brand: '',
    images: []
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentRole, setCurrentRole] = useState('agent');

  const currentAgent = { id: 1, name: 'Jean Baptiste Uwimana', region: 'Northern Province' };

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(product => categoryFilter === 'all' ? true : product.category === categoryFilter)
      .filter(product => {
        const stock = product.quantity || product.stock || 0;
        if (stockStatusFilter === 'all') return true;
        if (stockStatusFilter === 'inStock') return stock > 0;
        if (stockStatusFilter === 'lowStock') return stock > 0 && stock < 10;
        if (stockStatusFilter === 'outOfStock') return stock === 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stock') {
          const stockA = a.quantity || a.stock || 0;
          const stockB = b.quantity || b.stock || 0;
          return stockB - stockA;
        }
        return 0;
      });
  }, [products, searchTerm, categoryFilter, stockStatusFilter, sortBy]);

  // Debug: Log products state changes
  useEffect(() => {
    console.log('🔍 Products state updated:', products.length, 'products');
    console.log('📋 Current products:', products);
  }, [products]);

  // Debug: Log filtered products
  useEffect(() => {
    console.log('🔎 Filtered products:', filteredProducts.length, 'products');
    console.log('🎯 Filters - category:', categoryFilter, 'stock:', stockStatusFilter, 'search:', searchTerm);
  }, [filteredProducts, categoryFilter, stockStatusFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products from API
  const fetchProducts = async () => {
    console.log('🔄 Fetching products from API...');
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllProducts({ limit: 100, sort: '-created_at' });
      console.log('📦 API Response:', response);
      const productsData = response.data || response || [];
      console.log('✅ Products loaded:', productsData.length, 'products');
      console.log('📊 Products data:', productsData);
      setProducts(productsData);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = useCallback(
    async (e) => {
      e.preventDefault();
      
      // Validation
      if (!newProduct.name.trim()) {
        setError('Product name is required');
        return;
      }
      
      if (!newProduct.category) {
        setError('Product category is required');
        return;
      }
      
      if (newProduct.price < 0) {
        setError('Price must be non-negative');
        return;
      }
      
      if (newProduct.quantity < 0) {
        setError('Quantity must be non-negative');
        return;
      }

      setIsAdding(true);
      setError(null);

      try {
        // Prepare product data for API
        const productData = {
          name: newProduct.name.trim(),
          category: newProduct.category,
          description: newProduct.description.trim() || '',
          price: parseFloat(newProduct.price) || 0,
          quantity: parseInt(newProduct.quantity) || 0,
          unit: newProduct.unit || 'piece',
          supplier_id: newProduct.supplier_id || 'AGENT_DEFAULT',
          status: newProduct.status || 'available',
          sku: newProduct.sku || undefined,
          brand: newProduct.brand || undefined,
          images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : undefined
        };

        const createdProduct = await createProduct(productData);
        
        // Add to local state
        setProducts([createdProduct, ...products]);
        
        // Reset form
        setNewProduct({ 
          name: '', 
          category: 'irrigation', 
          description: '',
          price: 0,
          quantity: 0,
          unit: 'piece',
          supplier_id: '',
          status: 'available',
          sku: '',
          brand: '',
          images: []
        });
        
        setShowAddForm(false);
        setSuccess('Product added successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error adding product:', err);
        setError(err.message || 'Failed to add product');
      } finally {
        setIsAdding(false);
      }
    },
    [newProduct, products]
  );

  const handleUpdateStock = useCallback(
    async (productId, newQuantity) => {
      if (newQuantity < 0) return;

      setIsUpdating(true);
      setError(null);

      try {
        const updatedProduct = await updateProduct(productId, { quantity: parseInt(newQuantity) });
        
        // Update local state
        setProducts(products.map(product => 
          (product.id === productId || product._id === productId) 
            ? { ...product, quantity: newQuantity, stock: newQuantity } 
            : product
        ));
        
        setSuccess('Stock updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error updating stock:', err);
        setError(err.message || 'Failed to update stock');
      } finally {
        setIsUpdating(false);
      }
    },
    [products]
  );

  const handleDeleteProduct = useCallback(
    async (productId) => {
      if (!window.confirm('Are you sure you want to delete this product?')) return;

      setIsUpdating(true);
      setError(null);

      try {
        await deleteProduct(productId);
        
        // Remove from local state
        setProducts(products.filter(product => 
          product.id !== productId && product._id !== productId
        ));
        
        setSuccess('Product deleted successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(err.message || 'Failed to delete product');
      } finally {
        setIsUpdating(false);
      }
    },
    [products]
  );

  const handleEditProduct = useCallback(
    (product) => {
      setEditingProduct({
        ...product,
        id: product.id || product._id,
        quantity: product.quantity || product.stock || 0,
        images: product.images || []
      });
    },
    []
  );

  const handleSaveEdit = useCallback(
    async (e) => {
      e.preventDefault();
      
      if (!editingProduct) return;
      
      setIsUpdating(true);
      setError(null);

      try {
        const productId = editingProduct.id || editingProduct._id;
        const updateData = {
          name: editingProduct.name,
          category: editingProduct.category,
          description: editingProduct.description || '',
          price: parseFloat(editingProduct.price) || 0,
          quantity: parseInt(editingProduct.quantity) || 0,
          unit: editingProduct.unit || 'piece',
          status: editingProduct.status || 'available',
          brand: editingProduct.brand || '',
          sku: editingProduct.sku || ''
        };

        const updatedProduct = await updateProduct(productId, updateData);
        
        // Update local state
        setProducts(products.map(product => 
          (product.id === productId || product._id === productId) 
            ? { ...product, ...updatedProduct } 
            : product
        ));
        
        setEditingProduct(null);
        setSuccess('Product updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Error updating product:', err);
        setError(err.message || 'Failed to update product');
      } finally {
        setIsUpdating(false);
      }
    },
    [editingProduct, products]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'discontinued': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'out_of_stock': return <X className="h-4 w-4" />;
      case 'discontinued': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatRwf = (amount) => {
    return `${parseFloat(amount || 0).toLocaleString('en-RW')} RWF`;
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
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Product
            </button>
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

        {/* Add Product Modal */}
        {showAddForm && (
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
                    <option value="irrigation">💧 Irrigation</option>
                    <option value="harvesting">🌾 Harvesting</option>
                    <option value="containers">📦 Containers</option>
                    <option value="pest-management">🐛 Pest Management</option>
                  </select>
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-200 pointer-events-none"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <span className="text-green-600 font-bold text-sm">$</span>
                        </div>
                        Price * (RWF)
                      </div>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white hover:border-green-400"
                      required
                    />
                  </div>
                  
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
                      min="0"
                      placeholder="0"
                      value={newProduct.quantity}
                      onChange={e => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-sm bg-white hover:border-orange-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <span className="text-purple-600 font-bold text-sm">📏</span>
                        </div>
                        Unit *
                      </div>
                    </label>
                    <select
                      value={newProduct.unit}
                      onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-sm bg-white hover:border-purple-400"
                      required
                    >
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="liter">Liter</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="box">Box</option>
                      <option value="bag">Bag</option>
                      <option value="dozen">Dozen</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                  
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                          <span className="text-yellow-600 font-bold text-sm">🏭</span>
                        </div>
                        Brand
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., AgroFlow"
                      value={newProduct.brand}
                      onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-200 text-sm bg-white hover:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                          <span className="text-indigo-600 font-bold text-sm">🔖</span>
                        </div>
                        SKU
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={newProduct.sku}
                      onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm bg-white hover:border-indigo-400"
                    />
                  </div>
                  
                  <div className="relative group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-pink-100 rounded-lg mr-3">
                          <span className="text-pink-600 font-bold text-sm">🚦</span>
                        </div>
                        Status
                      </div>
                    </label>
                    <select
                      value={newProduct.status}
                      onChange={e => setNewProduct({ ...newProduct, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-200 text-sm bg-white hover:border-pink-400"
                    >
                      <option value="available">Available</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
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
                    placeholder="Describe the product for Rwandan avocado farming"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-200 text-sm bg-white hover:border-gray-400"
                    rows="4"
                  />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 transition-all duration-200 pointer-events-none"></div>
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
                    disabled={isAdding}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isAdding ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-800 flex items-center gap-3">
                  <Edit2 className="w-7 h-7" />
                  Edit Product
                </h2>
                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      required
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select category</option>
                      <option value="irrigation">Irrigation</option>
                      <option value="harvesting">Harvesting</option>
                      <option value="containers">Containers</option>
                      <option value="pest-management">Pest Management</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (RWF) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter price"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingProduct.quantity}
                      onChange={e => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter quantity"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                    <select
                      required
                      value={editingProduct.unit}
                      onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="">Select unit</option>
                      <option value="piece">Piece</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="liter">Liter</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="box">Box</option>
                      <option value="bag">Bag</option>
                      <option value="dozen">Dozen</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      value={editingProduct.brand || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      placeholder="Enter brand name"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                    <select
                      required
                      value={editingProduct.status || 'available'}
                      onChange={e => setEditingProduct({ ...editingProduct, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="available">Available</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 resize-none"
                    placeholder="Enter product description"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toolkit Inventory Section */}
        <div className="mb-6">
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Toolkit Inventory for Rwandan Avocado Farms</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing <strong>{filteredProducts.length}</strong> product{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto border-green-600"></div>
                  <p className="mt-4 text-sm text-gray-600">Loading inventory...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map(product => {
                        const stock = product.quantity || product.stock || 0;
                        const stockStatus = getStockStatus(stock);
                        const productId = product.id || product._id;
                        
                        return (
                          <tr key={productId} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mr-4">
                                  <Package2 className="h-6 w-6 text-green-700" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                  <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                                  {product.brand && (
                                    <div className="text-xs text-gray-400 mt-0.5">{product.brand}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 capitalize">
                                {product.category?.split('-').join(' ')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {stock} {product.unit || 'units'}
                              </div>
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${stockStatus.color} mt-1`}>
                                {stockStatus.text}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatRwf(product.price)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(product.status)}`}>
                                {getStatusIcon(product.status)}
                                <span className="ml-1 capitalize">
                                  {product.status?.split('_').join(' ') || 'Available'}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                {/* Manager: Full CRUD access */}
                                {currentRole === 'manager' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStock(productId, stock + 1)}
                                      className="text-green-600 hover:text-green-900 transition p-1 hover:bg-green-50 rounded"
                                      title="Add Stock"
                                      disabled={isUpdating}
                                    >
                                      <PlusCircle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStock(productId, stock - 1)}
                                      disabled={stock === 0 || isUpdating}
                                      className="text-orange-600 hover:text-orange-900 transition p-1 hover:bg-orange-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Remove Stock"
                                    >
                                      <MinusCircle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleEditProduct(product)}
                                      className="text-blue-600 hover:text-blue-900 transition p-1 hover:bg-blue-50 rounded"
                                      title="Edit Product"
                                      disabled={isUpdating}
                                    >
                                      <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(productId)}
                                      className="text-red-600 hover:text-red-900 transition p-1 hover:bg-red-50 rounded"
                                      title="Delete Product (Manager Only)"
                                      disabled={isUpdating}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
                                {/* Agent: CRU access (no Delete) */}
                                {currentRole === 'agent' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateStock(productId, stock + 1)}
                                      className="text-green-600 hover:text-green-900 transition p-1 hover:bg-green-50 rounded"
                                      title="Add Stock"
                                      disabled={isUpdating}
                                    >
                                      <PlusCircle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStock(productId, stock - 1)}
                                      disabled={stock === 0 || isUpdating}
                                      className="text-orange-600 hover:text-orange-900 transition p-1 hover:bg-orange-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Remove Stock"
                                    >
                                      <MinusCircle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleEditProduct(product)}
                                      className="text-blue-600 hover:text-blue-900 transition p-1 hover:bg-blue-50 rounded"
                                      title="Edit Product"
                                      disabled={isUpdating}
                                    >
                                      <Edit2 className="h-5 w-5" />
                                    </button>
                                  </>
                                )}
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
                    {searchTerm ? 'No products match your search.' : 'Get started by adding your first product.'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-6 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <Plus className="w-5 h-5 mr-2" /> Add Product
                    </button>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}