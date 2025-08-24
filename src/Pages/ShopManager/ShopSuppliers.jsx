import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Truck, Package, Users, TrendingUp, 
  MapPin, Phone, Mail, Calendar, DollarSign, Star, Clock, 
  ShoppingCart, BarChart3, Eye, AlertTriangle, CheckCircle,
  Filter, Download, Upload, MessageCircle, FileText
} from 'lucide-react';
import MarketStorageService from '../../services/marketStorageService';

const ShopSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');

  useEffect(() => {
    MarketStorageService.initializeStorage();
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setLoading(true);
    try {
      // Sync farmer data first to ensure latest connections
      MarketStorageService.syncAllFarmerData();
      
      const storedSuppliers = MarketStorageService.getSuppliers() || [];
      const salesData = MarketStorageService.getSalesData() || [];
      const orders = MarketStorageService.getOrders() || [];
      const transactions = MarketStorageService.getMarketTransactions() || [];
      
      if (storedSuppliers.length === 0) {
        // Initialize with default suppliers if none exist
        const defaultSuppliers = getDefaultSuppliers();
        MarketStorageService.saveSuppliers(defaultSuppliers);
        setSuppliers(defaultSuppliers);
      } else {
        // Enhance suppliers with sales and order data
        const enhancedSuppliers = storedSuppliers.map(supplier => {
          const supplierOrders = orders.filter(order => order.supplierId === supplier.id);
          const supplierSales = salesData.filter(sale => sale.supplierId === supplier.id);
          const supplierTransactions = transactions.filter(t => t.farmerId === supplier.id);
          
          // For farmer suppliers, use transaction data for more accurate metrics
          if (supplier.sourceType === 'farmer') {
            const totalTransactionRevenue = supplierTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
            return {
              ...supplier,
              totalOrders: supplierTransactions.length,
              totalSales: totalTransactionRevenue,
              lastOrderDate: supplierTransactions.length > 0 ? 
                supplierTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))[0].transactionDate : null,
              performance: {
                ...supplier.performance,
                totalRevenue: totalTransactionRevenue,
                orderFrequency: supplierTransactions.length
              }
            };
          } else {
            return {
              ...supplier,
              totalOrders: supplierOrders.length,
              totalSales: supplierSales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
              lastOrderDate: supplierOrders.length > 0 ? 
                new Date(Math.max(...supplierOrders.map(o => new Date(o.date).getTime()))).toISOString().split('T')[0] : null,
              performance: calculateSupplierPerformance(supplier, supplierOrders, supplierSales)
            };
          }
        });
        
        setSuppliers(enhancedSuppliers);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSuppliers(getDefaultSuppliers());
    } finally {
      setLoading(false);
    }
  };

  const calculateSupplierPerformance = (supplier, orders, sales) => {
    const avgDeliveryTime = orders.length > 0 ? 
      orders.reduce((sum, order) => sum + (order.deliveryDays || 5), 0) / orders.length : 5;
    const onTimeDeliveries = orders.filter(order => order.onTime !== false).length;
    const onTimeRate = orders.length > 0 ? (onTimeDeliveries / orders.length) * 100 : 95;
    
    return {
      avgDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
      onTimeRate: Math.round(onTimeRate * 10) / 10,
      totalRevenue: sales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
      orderFrequency: orders.length
    };
  };

  const getDefaultSuppliers = () => [
    {
      id: 'SUP-001',
      name: "Green Valley Farm",
      contactPerson: "John Smith",
      email: "john@greenvalley.com",
      phone: "+1-555-0101",
      category: "Organic Produce",
      location: "California, USA",
      specialization: "Organic Vegetables, Fruits",
      status: "Active",
      joinDate: "2023-01-15",
      totalOrders: 45,
      lastOrderDate: "2024-08-20",
      rating: 4.8,
      deliveryTime: "2-3 days",
      paymentTerms: "Net 30",
      certifications: ["Organic", "Non-GMO"],
      totalSales: 125000,
      performance: {
        avgDeliveryTime: 2.5,
        onTimeRate: 95.2,
        totalRevenue: 125000,
        orderFrequency: 45
      }
    },
    {
      id: 'SUP-002',
      name: "Happy Hens Farm",
      contactPerson: "Sarah Wilson",
      email: "sarah@happyhens.com",
      phone: "+1-555-0202",
      category: "Dairy & Eggs",
      location: "Oregon, USA",
      specialization: "Free-range Eggs, Dairy Products",
      status: "Active",
      joinDate: "2022-08-20",
      totalOrders: 32,
      lastOrderDate: "2024-08-21",
      rating: 4.6,
      deliveryTime: "1-2 days",
      paymentTerms: "Net 15",
      certifications: ["Organic", "Humane Certified"],
      totalSales: 85000,
      performance: {
        avgDeliveryTime: 1.5,
        onTimeRate: 98.1,
        totalRevenue: 85000,
        orderFrequency: 32
      }
    },
    {
      id: 3,
      name: "AgriTech Equipment",
      contactPerson: "Mike Chen",
      email: "mike@agritech.com",
      phone: "+1-555-0789",
      category: "Farm Equipment",
      location: "Nebraska, USA",
      specialization: "Tractors, Harvesters, Irrigation Systems",
      status: "Active",
      joinDate: "2023-03-10",
      totalOrders: 8,
      lastOrderDate: "2024-07-22",
      rating: 4.9,
      deliveryTime: "2-3 weeks",
      paymentTerms: "Net 60",
      certifications: ["ISO 9001", "CE Certified"]
    },
    {
      id: 4,
      name: "PestGuard Solutions",
      contactPerson: "Lisa Rodriguez",
      email: "lisa@pestguard.com",
      phone: "+1-555-0321",
      category: "Pest Control",
      location: "California, USA",
      specialization: "Herbicides, Insecticides, Fungicides",
      status: "Active",
      joinDate: "2023-06-05",
      totalOrders: 28,
      lastOrderDate: "2024-08-18",
      rating: 4.5,
      deliveryTime: "4-6 days",
      paymentTerms: "Net 30",
      certifications: ["EPA Registered", "FIFRA Compliant"],
      totalSales: 65000,
      performance: {
        avgDeliveryTime: 5,
        onTimeRate: 92.5,
        totalRevenue: 65000,
        orderFrequency: 28
      }
    }
  ];

  // Filter suppliers based on search and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      supplier.specialization.toLowerCase().includes(supplierSearchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Organic Produce', 'Dairy & Eggs', 'Farm Equipment', 'Pest Control', 'Seeds & Seedlings'];

  const handleAddSupplier = (supplierData) => {
    const newSupplier = {
      ...supplierData,
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSales: 0,
      performance: {
        avgDeliveryTime: 0,
        onTimeRate: 0,
        totalRevenue: 0,
        orderFrequency: 0
      }
    };
    
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    MarketStorageService.saveSuppliers(updatedSuppliers);
    setShowModal(false);
  };

  const handleEditSupplier = (supplierData) => {
    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === selectedSupplier.id ? { ...supplier, ...supplierData } : supplier
    );
    setSuppliers(updatedSuppliers);
    MarketStorageService.saveSuppliers(updatedSuppliers);
    setShowModal(false);
    setSelectedSupplier(null);
  };

  const handleDeleteSupplier = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      const updatedSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
      setSuppliers(updatedSuppliers);
      MarketStorageService.saveSuppliers(updatedSuppliers);
    }
  };

  const SupplierListView = () => (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 lg:mb-0">
            <Truck className="h-7 w-7 mr-3 text-green-600" />
            Supplier Management
          </h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                setModalType('add');
                setSelectedSupplier(null);
                setShowModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={supplierSearchTerm}
              onChange={(e) => setSupplierSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
            <Filter className="h-4 w-4 mr-2" />
            Advanced
          </button>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      </div>
    </div>
  );

  const SupplierCard = ({ supplier }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{supplier.name}</h3>
          <p className="text-gray-600 flex items-center mt-1">
            <Users className="h-4 w-4 mr-1" />
            {supplier.contactPerson}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          supplier.status === 'Active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {supplier.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Package className="h-4 w-4 mr-2" />
          {supplier.category}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {supplier.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          {supplier.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          {supplier.phone}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Total Orders</p>
          <p className="font-semibold text-gray-800">{supplier.totalOrders}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Rating</p>
          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
            <p className="font-semibold text-gray-800">{supplier.rating}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">On-Time Rate</p>
          <p className="font-semibold text-green-600">{supplier.performance?.onTimeRate || 0}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Sales</p>
          <p className="font-semibold text-blue-600">${(supplier.totalSales || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedSupplier(supplier);
            setActiveView('detail');
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </button>
        <button
          onClick={() => {
            setSelectedSupplier(supplier);
            setModalType('edit');
            setShowModal(true);
          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </button>
        <button
          onClick={() => handleDeleteSupplier(supplier.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const SupplierDetailView = () => {
    if (!selectedSupplier) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => setActiveView('list')}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                ← Back to Suppliers
              </button>
              <h2 className="text-2xl font-bold text-gray-800">{selectedSupplier.name}</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setModalType('edit');
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Supplier
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-900">${(selectedSupplier.totalSales || 0).toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">On-Time Rate</div>
              <div className="text-2xl font-bold text-green-900">{selectedSupplier.performance?.onTimeRate || 0}%</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 text-sm font-medium">Avg Delivery</div>
              <div className="text-2xl font-bold text-yellow-900">{selectedSupplier.performance?.avgDeliveryTime || 0} days</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">Total Orders</div>
              <div className="text-2xl font-bold text-purple-900">{selectedSupplier.totalOrders}</div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Contact Person</label>
                <p className="text-gray-900">{selectedSupplier.contactPerson}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{selectedSupplier.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{selectedSupplier.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900">{selectedSupplier.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Business Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-gray-900">{selectedSupplier.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Specialization</label>
                <p className="text-gray-900">{selectedSupplier.specialization}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                <p className="text-gray-900">{selectedSupplier.paymentTerms}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Delivery Time</label>
                <p className="text-gray-900">{selectedSupplier.deliveryTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SupplierModal = () => {
    const [formData, setFormData] = useState({
      name: selectedSupplier?.name || '',
      contactPerson: selectedSupplier?.contactPerson || '',
      email: selectedSupplier?.email || '',
      phone: selectedSupplier?.phone || '',
      category: selectedSupplier?.category || '',
      location: selectedSupplier?.location || '',
      specialization: selectedSupplier?.specialization || '',
      status: selectedSupplier?.status || 'Active',
      deliveryTime: selectedSupplier?.deliveryTime || '',
      paymentTerms: selectedSupplier?.paymentTerms || '',
      rating: selectedSupplier?.rating || 5
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (modalType === 'add') {
        handleAddSupplier(formData);
      } else {
        handleEditSupplier(formData);
      }
    };

    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-green-600 text-white p-6 rounded-t-lg">
            <h2 className="text-xl font-bold">
              {modalType === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <textarea
                required
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {modalType === 'add' ? 'Add Supplier' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {activeView === 'list' && <SupplierListView />}
      {activeView === 'detail' && <SupplierDetailView />}
      {showModal && <SupplierModal />}
    </div>
  );
};

export default ShopSuppliers;
