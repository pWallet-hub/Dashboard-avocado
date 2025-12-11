import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, Eye, Filter, Leaf } from 'lucide-react';
import { getInventory, getLowStockItems, getOutOfStockItems, adjustStock } from '../../services/inventoryService';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productsService';

const ShopInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get products first (which acts as inventory)
      const productsResponse = await getAllProducts();
      const products = productsResponse.data || productsResponse || [];
      
      // Transform products to inventory format
      const inventoryData = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity || 0,
        unit: product.unit || 'pieces',
        price: product.price || 0,
        minStock: product.min_stock || 10,
        supplier: product.supplier_name || 'Unknown',
        harvestDate: product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : '',
        expiryDate: product.expiry_date || '',
        cost: product.cost || product.price * 0.8,
        status: product.status || 'available',
        sourceType: 'product'
      }));
      
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError(error.message || 'Failed to load inventory');
      // Set empty array as fallback
      setInventory([]);
      
      // No fallback data - show empty state when API fails
    } finally {
      setLoading(false);
    }
  };

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
    minStock: '',
    supplier: '',
    harvestDate: '',
    expiryDate: ''
  });

  const categories = ['Hass Avocados', 'Fuerte Avocados', 'Bacon Avocados', 'Zutano Avocados', 'Avocado Seedlings', 'Fertilizers', 'Pesticides'];

  // Ensure inventory is always an array before filtering
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  
  const filteredInventory = safeInventory.filter(item => {
    if (!item) return false;
    
    const matchesSearch = (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.supplier?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      alert('Please fill in all required fields (Name, Quantity, Price)');
      return;
    }
    
    try {
      const item = {
        ...newItem,
        quantity: parseInt(newItem.quantity) || 0,
        price: parseFloat(newItem.price) || 0,
        cost: (parseFloat(newItem.price) || 0) * 0.8, // Assume 20% markup
        minStock: parseInt(newItem.minStock) || 0,
        status: (parseInt(newItem.quantity) || 0) <= (parseInt(newItem.minStock) || 0) ? 'low-stock' : 'in-stock',
        sourceType: 'manual',
        expiryDate: newItem.expiryDate || calculateExpiryDate(newItem.harvestDate, newItem.category)
      };
      
      // Transform inventory item to product format
      const productData = {
        name: item.name,
        description: `${item.category} product`,
        price: item.price,
        category: item.category.toLowerCase().replace(/\s+/g, '-'),
        quantity: item.quantity,
        unit: item.unit,
        supplier_id: '1', // Default supplier
        status: item.status === 'in-stock' ? 'available' : 'unavailable',
        min_stock: item.minStock
      };

      if (editingItem) {
        await updateProduct(editingItem.id, productData);
      } else {
        await createProduct(productData);
      }
      await loadInventory();
      resetForm();
      setShowAddModal(false);
      alert(`Item ${editingItem ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + error.message);
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      price: '',
      minStock: '',
      supplier: '',
      harvestDate: '',
      expiryDate: ''
    });
    setEditingItem(null);
  };

  const handleEditItem = (item) => {
    if (!item) return;
    setEditingItem(item);
    setNewItem({
      name: item.name || '',
      category: item.category || '',
      quantity: (item.quantity || 0).toString(),
      unit: item.unit || '',
      price: (item.price || 0).toString(),
      minStock: (item.minStock || 0).toString(),
      supplier: item.supplier || '',
      harvestDate: item.harvestDate || '',
      expiryDate: item.expiryDate || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (!id || !window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await deleteProduct(id);
      await loadInventory();
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item: ' + error.message);
    }
  };

  const getStockStatus = (item) => {
    if (!item) return 'unknown';
    if ((item.quantity || 0) === 0) return 'out-of-stock';
    if ((item.quantity || 0) <= (item.minStock || 0)) return 'low-stock';
    return 'in-stock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low-stock': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
      case 'out-of-stock': return 'bg-red-200 text-red-800 ring-red-500';
      case 'in-stock': return 'bg-green-200 text-green-800 ring-green-500';
      default: return 'bg-gray-200 text-gray-800 ring-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center">
              <Leaf className="h-7 w-7 mr-3 text-emerald-600 animate-pulse" />
              Avocado Inventory Management
            </h2>
            <p className="text-emerald-600 mt-1">Manage your Rwandan avocado farm produce and stock levels</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                ⚠️ {error}
              </div>
            )}
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search items or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              aria-label="Search items or suppliers"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-emerald-600">
              Total Items: <span className="font-semibold">{filteredInventory.length}</span>
            </span>
            <button
              onClick={loadInventory}
              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-emerald-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-emerald-600">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-600">
              {error ? 'Unable to load inventory. Please check your connection.' : 'No items found. Add some avocado products!'}
            </p>
            {error && (
              <button
                onClick={loadInventory}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-100">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Price (RWF)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-100">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id || Math.random()} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-emerald-900">{item.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-600">{item.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-900">
                          {item.quantity || 0} {item.unit || 'units'}
                          {(item.quantity || 0) <= (item.minStock || 0) && (
                            <AlertTriangle className="inline h-4 w-4 ml-1 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-emerald-500">Min: {item.minStock || 0} {item.unit || 'units'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-900">{(item.price || 0).toLocaleString()} RWF</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(status)}`}>
                          {status === 'low-stock' ? 'Low Stock' : 
                           status === 'out-of-stock' ? 'Out of Stock' : 
                           status === 'in-stock' ? 'In Stock' : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-600">{item.supplier || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-600">{item.expiryDate || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleEditItem(item)} 
                            className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                            title="Edit Item"
                            aria-label="Edit Item"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-emerald-600 hover:text-emerald-800 transform hover:scale-110 transition"
                            title="View Details"
                            aria-label="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 transform hover:scale-110 transition"
                            title="Delete Item"
                            aria-label="Delete Item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-800">{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-emerald-400 hover:text-emerald-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Unit</label>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="kg, pieces, liters, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Price (RWF) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter price in RWF"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Minimum Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Minimum stock level"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Supplier</label>
                <input
                  type="text"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Supplier name (e.g., Local Kigali Farm)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Harvest Date</label>
                <input
                  type="date"
                  value={newItem.harvestDate}
                  onChange={(e) => setNewItem({...newItem, harvestDate: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-emerald-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <p className="text-xs text-emerald-600 mt-1">
                  If left empty, expiry date will be calculated based on harvest date and category
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-6 py-3 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
                disabled={!newItem.name || !newItem.quantity || !newItem.price}
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopInventory;