import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, Eye, Filter, Leaf } from 'lucide-react';
import { initializeStorage, getShopInventory, addToShopInventory, updateShopInventory, deleteInventoryItem, calculateExpiryDate, getSuppliers } from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

// The UI collects an avocado-variety label, but the backend's Product.category is a
// fixed enum — map each label to a real category + free-text variety.
const CATEGORY_MAP = {
  'Hass Avocados': { category: 'produce', variety: 'Hass Avocados' },
  'Fuerte Avocados': { category: 'produce', variety: 'Fuerte Avocados' },
  'Bacon Avocados': { category: 'produce', variety: 'Bacon Avocados' },
  'Zutano Avocados': { category: 'produce', variety: 'Zutano Avocados' },
  'Avocado Seedlings': { category: 'seeds', variety: 'Avocado Seedlings' },
  'Fertilizers': { category: 'fertilizers', variety: null },
  'Pesticides': { category: 'pest-management', variety: null },
};

const CATEGORY_LABEL_BY_BACKEND = Object.entries(CATEGORY_MAP).reduce((acc, [label, { category, variety }]) => {
  acc[`${category}:${variety || ''}`] = label;
  return acc;
}, {});

const UNIT_OPTIONS = ['kg', 'g', 'lb', 'oz', 'ton', 'liter', 'ml', 'gallon', 'piece', 'dozen', 'box', 'bag', 'bottle', 'can', 'packet', 'pack'];

const ShopInventory = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeStorage();
    loadSuppliers();
    loadInventory();
  }, []);

  const loadSuppliers = async () => {
    try {
      const supplierData = await getSuppliers();
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSuppliers([]);
    }
  };

  const mapProductToInventoryItem = (product) => {
    const categoryLabel = CATEGORY_LABEL_BY_BACKEND[`${product.category}:${product.variety || ''}`]
      || CATEGORY_LABEL_BY_BACKEND[`${product.category}:`]
      || product.category;
    const supplier = suppliers.find(s => s.id === product.supplier_id);

    return {
      id: product.id,
      name: product.name,
      category: categoryLabel,
      quantity: product.quantity,
      unit: product.unit,
      price: product.price,
      minStock: product.min_stock,
      supplier_id: product.supplier_id,
      supplier: supplier?.name || product.supplier_id,
      harvestDate: product.harvest_date ? product.harvest_date.split('T')[0] : '',
      expiryDate: product.expiry_date ? product.expiry_date.split('T')[0] : '',
      cost: product.cost,
      status: product.status === 'out_of_stock' ? 'out-of-stock' : (product.quantity <= (product.min_stock || 0) ? 'low-stock' : 'in-stock'),
      sourceType: product.source_type,
    };
  };

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const inventoryData = await getShopInventory();
      const validInventory = Array.isArray(inventoryData) ? inventoryData.map(mapProductToInventoryItem) : [];
      setInventory(validInventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError(error.message || 'Failed to load inventory');
      setInventory([]);
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
    supplier_id: '',
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
    if (!newItem.name || !newItem.quantity || !newItem.price || !newItem.unit || !newItem.supplier_id) {
      toast.error('Please fill in all required fields (Name, Quantity, Price, Unit, Supplier)');
      return;
    }

    try {
      const { category, variety } = CATEGORY_MAP[newItem.category] || { category: 'produce', variety: newItem.category };

      const item = {
        name: newItem.name,
        category,
        variety,
        quantity: parseInt(newItem.quantity) || 0,
        unit: newItem.unit,
        price: parseFloat(newItem.price) || 0,
        cost: (parseFloat(newItem.price) || 0) * 0.8, // Assume 20% markup
        min_stock: parseInt(newItem.minStock) || 0,
        supplier_id: newItem.supplier_id,
        source_type: 'manual',
        harvest_date: newItem.harvestDate || undefined,
        expiry_date: newItem.expiryDate || calculateExpiryDate(newItem.harvestDate, newItem.category) || undefined,
      };

      if (editingItem) {
        await updateShopInventory(editingItem.id, item);
      } else {
        await addToShopInventory(item);
      }
      await loadInventory();
      resetForm();
      setShowAddModal(false);
      toast.success(`Item ${editingItem ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error saving item: ' + error.message);
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
      supplier_id: '',
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
      supplier_id: item.supplier_id || '',
      harvestDate: item.harvestDate || '',
      expiryDate: item.expiryDate || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = async (id) => {
    if (!id || !(await confirm('Are you sure you want to delete this item?'))) return;

    try {
      await deleteInventoryItem(id);
      await loadInventory();
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item: ' + error.message);
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
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Leaf className="h-7 w-7 mr-3 text-green-600 animate-pulse" />
              Avocado Inventory Management
            </h2>
            <p className="text-green-600 mt-1">Manage your Rwandan avocado farm produce and stock levels</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                ⚠️ {error}
              </div>
            )}
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search items or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              aria-label="Search items or suppliers"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Total Items: <span className="font-semibold">{filteredInventory.length}</span>
            </span>
            <button
              onClick={loadInventory}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600">
              {error ? 'Unable to load inventory. Please check your connection.' : 'No items found. Add some avocado products!'}
            </p>
            {error && (
              <button
                onClick={loadInventory}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Price (RWF)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id || Math.random()} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-900">{item.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600">{item.category || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-900">
                          {item.quantity || 0} {item.unit || 'units'}
                          {(item.quantity || 0) <= (item.minStock || 0) && (
                            <AlertTriangle className="inline h-4 w-4 ml-1 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-green-500">Min: {item.minStock || 0} {item.unit || 'units'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-900">{(item.price || 0).toLocaleString()} RWF</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(status)}`}>
                          {status === 'low-stock' ? 'Low Stock' : 
                           status === 'out-of-stock' ? 'Out of Stock' : 
                           status === 'in-stock' ? 'In Stock' : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600">{item.supplier || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600">{item.expiryDate || 'N/A'}</div>
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
                            className="text-green-600 hover:text-green-800 transform hover:scale-110 transition"
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
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Enter quantity"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Unit *</label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  required
                >
                  <option value="">Select unit</option>
                  {UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Price (RWF) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Enter price in RWF"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Minimum Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  placeholder="Minimum stock level"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Supplier *</label>
                <select
                  value={newItem.supplier_id}
                  onChange={(e) => setNewItem({...newItem, supplier_id: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Harvest Date</label>
                <input
                  type="date"
                  value={newItem.harvestDate}
                  onChange={(e) => setNewItem({...newItem, harvestDate: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                />
                <p className="text-xs text-green-600 mt-1">
                  If left empty, expiry date will be calculated based on harvest date and category
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={!newItem.name || !newItem.quantity || !newItem.price || !newItem.unit || !newItem.supplier_id}
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