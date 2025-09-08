import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, Eye, Filter, Leaf } from 'lucide-react';
import MarketStorageService from '../../services/marketStorageService';

const ShopInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    MarketStorageService.initializeStorage();
    loadInventory();
  }, []);

  const loadInventory = () => {
    setLoading(true);
    try {
      const inventoryData = MarketStorageService.getShopInventory();
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory:', error);
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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) return;
    
    try {
      const item = {
        ...newItem,
        quantity: parseInt(newItem.quantity),
        price: parseFloat(newItem.price),
        cost: parseFloat(newItem.price) * 0.8, // Assume 20% markup
        minStock: parseInt(newItem.minStock),
        status: parseInt(newItem.quantity) <= parseInt(newItem.minStock) ? 'low-stock' : 'in-stock',
        sourceType: 'manual',
        expiryDate: newItem.expiryDate || MarketStorageService.calculateExpiryDate(newItem.harvestDate, newItem.category)
      };
      
      if (editingItem) {
        // Assume update method
        MarketStorageService.updateShopInventory(editingItem.id, item);
      } else {
        MarketStorageService.addToShopInventory(item);
      }
      loadInventory();
      resetForm();
      setShowAddModal(false);
    } catch (error) {
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
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      minStock: item.minStock.toString(),
      supplier: item.supplier,
      harvestDate: item.harvestDate,
      expiryDate: item.expiryDate
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        MarketStorageService.deleteInventoryItem(id); // Assume this method exists
        loadInventory();
      } catch (error) {
        alert('Error deleting item: ' + error.message);
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minStock) return 'low-stock';
    return 'in-stock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low-stock': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
      case 'out-of-stock': return 'bg-red-200 text-red-800 ring-red-500';
      default: return 'bg-green-200 text-green-800 ring-green-500';
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center">
              <Leaf className="h-7 w-7 mr-3 text-emerald-600 animate-pulse" />
              Avocado Inventory Management
            </h2>
            <p className="text-emerald-600 mt-1">Manage your Rwandan avocado farm produce and stock levels</p>
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
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all"
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
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-emerald-100">
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-emerald-600">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-emerald-600">
                    No items found. Add some avocado products!
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-emerald-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-600">{item.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-900">
                          {item.quantity} {item.unit}
                          {item.quantity <= item.minStock && (
                            <AlertTriangle className="inline h-4 w-4 ml-1 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-emerald-500">Min: {item.minStock} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-900">{item.price.toFixed(0)} RWF</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(status)}`}>
                          {status === 'low-stock' ? 'Low Stock' : 
                           status === 'out-of-stock' ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-600">{item.supplier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-600">{item.expiryDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button className="text-emerald-600 hover:text-emerald-800 transform hover:scale-110 transition">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 transform hover:scale-110 transition"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-800">{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter quantity"
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
                <label className="block text-sm font-medium text-emerald-700 mb-2">Price (RWF)</label>
                <input
                  type="number"
                  step="1"
                  value={newItem.price}
                  onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter price in RWF"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Minimum Stock</label>
                <input
                  type="number"
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
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
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