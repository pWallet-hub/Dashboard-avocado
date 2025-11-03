import React, { useState, useEffect } from 'react';
import { 
  Package2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Leaf,
  X,
  Save,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductById 
} from '../../services/productsService';

const ShopProducts = () => {
  const [activeView, setActiveView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-created_at');
  const [formData, setFormData] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 20, 
    total: 0, 
    pages: 0 
  });

  // Get user role
  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === 'admin';

  const categories = ['irrigation', 'harvesting', 'containers', 'pest-management'];
  const units = ['kg', 'g', 'lb', 'oz', 'ton', 'liter', 'ml', 'gallon', 'piece', 'dozen', 'box', 'bag', 'bottle', 'can', 'packet'];
  const statuses = ['available', 'out_of_stock', 'discontinued'];

  useEffect(() => {
    loadProducts();
  }, [pagination.page, categoryFilter, statusFilter, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const options = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy
      };

      if (categoryFilter !== 'all') {
        options.category = categoryFilter;
      }

      if (statusFilter !== 'all') {
        options.status = statusFilter;
      }

      if (searchTerm) {
        options.search = searchTerm;
      }

      const result = await getAllProducts(options);
      
      setProducts(result.data || []);
      
      if (result.pagination) {
        setPagination(prev => ({
          ...prev,
          ...result.pagination
        }));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalType === 'edit' && selectedProduct) {
      console.log('📝 Loading product for edit:', selectedProduct);
      console.log('💰 Product price:', selectedProduct.price);
      
      setFormData({
        name: selectedProduct.name || '',
        category: selectedProduct.category || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price || '',
        quantity: selectedProduct.quantity || '',
        unit: selectedProduct.unit || 'kg',
        supplier_id: selectedProduct.supplier_id || '',
        status: selectedProduct.status || 'available',
        sku: selectedProduct.sku || '',
        brand: selectedProduct.brand || '',
        harvest_date: selectedProduct.harvest_date ? selectedProduct.harvest_date.split('T')[0] : '',
        expiry_date: selectedProduct.expiry_date ? selectedProduct.expiry_date.split('T')[0] : '',
        images: selectedProduct.images || [],
        specifications: selectedProduct.specifications || {}
      });
    } else if (modalType === 'add') {
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        quantity: '',
        unit: 'kg',
        supplier_id: '',
        status: 'available',
        sku: '',
        brand: '',
        harvest_date: '',
        expiry_date: '',
        images: [],
        specifications: {}
      });
    }
  }, [modalType, selectedProduct, showModal]);

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.sku?.toLowerCase().includes(search) ||
      product.brand?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  });

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
    return `${parseFloat(amount).toLocaleString('en-RW')} RWF`;
  };

  const clearMessages = () => {
    setTimeout(() => {
      setError(null);
      setSuccessMessage('');
    }, 5000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const submitData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        supplier_id: formData.supplier_id.trim(),
        status: formData.status
      };

      if (formData.description?.trim()) {
        submitData.description = formData.description.trim();
      }

      if (formData.sku?.trim()) {
        submitData.sku = formData.sku.trim();
      }

      if (formData.brand?.trim()) {
        submitData.brand = formData.brand.trim();
      }

      if (formData.harvest_date) {
        submitData.harvest_date = new Date(formData.harvest_date).toISOString();
      }

      if (formData.expiry_date) {
        submitData.expiry_date = new Date(formData.expiry_date).toISOString();
      }

      if (formData.images?.length > 0) {
        submitData.images = formData.images;
      }

      if (formData.specifications && Object.keys(formData.specifications).length > 0) {
        submitData.specifications = formData.specifications;
      }

      if (modalType === 'add') {
        const newProduct = await createProduct(submitData);
        setProducts([newProduct, ...products]);
        setSuccessMessage('Product created successfully!');
      } else if (modalType === 'edit' && selectedProduct) {
        const updatedProduct = await updateProduct(selectedProduct.id, submitData);
        setProducts(products.map(p => 
          p.id === selectedProduct.id ? updatedProduct : p
        ));
        setSelectedProduct(updatedProduct);
        setSuccessMessage('Product updated successfully!');
      }

      setShowModal(false);
      clearMessages();
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || `Failed to ${modalType === 'add' ? 'create' : 'update'} product`);
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!productId) {
      setError('Product ID is missing. Cannot delete product.');
      return;
    }

    // Check user role - DELETE requires Admin role
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      setError('❌ Delete Failed: Only Admin users can delete products. Your current role is: ' + (userRole || 'unknown'));
      clearMessages();
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      console.log('🗑️ Attempting to delete product with ID:', productId);
      
      const result = await deleteProduct(productId);
      console.log('✅ Delete result:', result);
      
      // Update local state - remove the deleted product
      setProducts(prevProducts => prevProducts.filter(p => {
        const pid = p.id || p._id;
        return pid !== productId;
      }));
      
      if (selectedProduct && (selectedProduct.id === productId || selectedProduct._id === productId)) {
        setActiveView('list');
        setSelectedProduct(null);
      }
      
      setSuccessMessage('Product deleted successfully!');
      clearMessages();
      
      // Reload products to ensure sync with backend
      await loadProducts();
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to delete product. ';
      
      if (error.response?.status === 403 || error.message?.includes('Access denied')) {
        errorMessage = '❌ Permission Denied: Only Admin users can delete products. Please contact an administrator.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Product not found.';
      } else if (error.response?.status === 401) {
        errorMessage += 'Please log in again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ProductModal = () => {
    const isViewMode = modalType === 'view';
    
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8">
        <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {modalType === 'add' ? 'Add New Product' : modalType === 'view' ? 'View Product Details' : 'Edit Product'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required={!isViewMode}
                  minLength={2}
                  maxLength={200}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${isViewMode ? 'bg-gray-50' : ''}`}
                  placeholder="e.g., Drip Irrigation System"
                  disabled={loading || isViewMode}
                  readOnly={isViewMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (RWF) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required={!isViewMode}
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent ${isViewMode ? 'bg-gray-50' : ''}`}
                  placeholder="Enter price in RWF"
                  disabled={loading || isViewMode}
                  readOnly={isViewMode}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Auto-generated if empty"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Detailed product description..."
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description?.length || 0}/1000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., AgroFlow"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Inventory & Details</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.unit || 'kg'}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier_id || ''}
                  onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., SUP123456"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status || 'available'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                <input
                  type="date"
                  value={formData.harvest_date || ''}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date || ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              disabled={loading}
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : (modalType === 'add' ? 'Add Product' : 'Save Changes')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
    );
  };

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    totalRevenue: products.reduce((sum, product) => sum + (parseFloat(product.price) || 0), 0),
    availableProducts: products.filter(p => p.status === 'available').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showModal && <ProductModal />}
      
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Value Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-5 h-5 text-blue-700 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-blue-600 mb-1">Total Value</p>
            <p className="text-3xl font-bold text-blue-700">
              {stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} RWF
            </p>
            <p className="text-xs text-blue-500 mt-2">Current inventory worth</p>
          </div>

          {/* Total Products Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package2 className="w-6 h-6 text-white" />
              </div>
              <ShoppingCart className="w-5 h-5 text-blue-700 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-700 bg-clip-text text-transparent">
              {stats.totalProducts}
            </p>
            <p className="text-xs text-gray-500 mt-2">All products in inventory</p>
          </div>

          {/* Available Products Card */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6 border border-teal-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <Leaf className="w-5 h-5 text-teal-700 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Available</p>
            <p className="text-3xl font-bold bg-gradient-to-br from-teal-600 to-green-700 bg-clip-text text-transparent">
              {stats.availableProducts}
            </p>
            <p className="text-xs text-gray-500 mt-2">Ready to sell</p>
          </div>

          {/* Out of Stock Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <Clock className="w-5 h-5 text-amber-700 opacity-50" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Out of Stock</p>
            <p className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
              {stats.outOfStock}
            </p>
            <p className="text-xs text-gray-500 mt-2">Needs restocking</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 lg:mb-0">
              <Package2 className="h-7 w-7 mr-3 text-green-600" />
              Product Management
            </h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  setModalType('add');
                  setShowModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition disabled:opacity-50"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
              <button 
                onClick={loadProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition disabled:opacity-50"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Error:</strong> {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="-name">Sort by Name (Z-A)</option>
              <option value="price">Sort by Price (Low-High)</option>
              <option value="-price">Sort by Price (High-Low)</option>
              <option value="-created_at">Sort by Date (Newest)</option>
              <option value="created_at">Sort by Date (Oldest)</option>
            </select>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{pagination.total || products.length}</strong> products
            </div>
          </div>

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
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
                      <p>Loading products...</p>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <Package2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or add a new product</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
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
                          {product.quantity} {product.unit}
                        </div>
                        <div className="text-xs text-gray-500">{product.stockStatus || 'In Stock'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatRwf(product.price)}
                        </div>
                        {product.totalValue && (
                          <div className="text-xs text-gray-500">
                            Total: {formatRwf(product.totalValue)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          <span className="ml-1 capitalize">
                            {product.status?.split('_').join(' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setModalType('view');
                              setShowModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 transition"
                            title="View Product Details"
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setModalType('edit');
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition"
                            title="Edit Product"
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleDelete(product.id || product._id)}
                              className="text-red-600 hover:text-red-900 transition" 
                              title="Delete Product (Admin Only)"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                          {!isAdmin && (
                            <button 
                              className="text-gray-400 cursor-not-allowed" 
                              title="Delete requires Admin role"
                              disabled
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page === pagination.pages || loading}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Last
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-700 text-sm font-medium">Total Products</div>
                <Package2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900">{pagination.total || products.length}</div>
              <div className="text-xs text-green-700 mt-1">Active inventory items</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-700 text-sm font-medium">Total Value</div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {formatRwf(products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0))}
              </div>
              <div className="text-xs text-blue-700 mt-1">Current inventory worth</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-yellow-700 text-sm font-medium">Out of Stock</div>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-900">
                {products.filter(p => p.status === 'out_of_stock').length}
              </div>
              <div className="text-xs text-yellow-700 mt-1">Items need restocking</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-purple-700 text-sm font-medium">Categories</div>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-900">
                {new Set(products.map(p => p.category)).size}
              </div>
              <div className="text-xs text-purple-700 mt-1">Product categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopProducts;