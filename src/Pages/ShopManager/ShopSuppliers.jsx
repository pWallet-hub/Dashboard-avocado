import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Truck, Package, Users, TrendingUp, 
  MapPin, Phone, Mail, Calendar, DollarSign, Star, Clock, 
  ShoppingCart, BarChart3, Eye, AlertTriangle, CheckCircle,
  Filter, Download, Upload, MessageCircle, FileText, Leaf
} from 'lucide-react';
import { initializeStorage, syncAllFarmerData, getSuppliers, saveSuppliers, getSalesData, getOrders, getMarketTransactions } from '../../services/marketStorageService';

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
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeStorage();
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sync farmer data first to ensure latest connections
      await syncAllFarmerData();
      
      const storedSuppliers = await getSuppliers() || [];
      const salesData = await getSalesData() || [];
      const orders = await getOrders() || [];
      const transactions = await getMarketTransactions() || [];
      
      if (storedSuppliers.length === 0) {
        // Initialize with default suppliers if none exist
        const defaultSuppliers = getDefaultSuppliers();
        await saveSuppliers(defaultSuppliers);
        setSuppliers(defaultSuppliers);
      } else {
        // Enhance suppliers with sales and order data
        const enhancedSuppliers = storedSuppliers.map(supplier => {
          const supplierOrders = Array.isArray(orders) ? orders.filter(order => order.supplierId === supplier.id) : [];
          const supplierSales = Array.isArray(salesData) ? salesData.filter(sale => sale.supplierId === supplier.id) : [];
          const supplierTransactions = Array.isArray(transactions) ? transactions.filter(t => t.farmerId === supplier.id) : [];
          
          // For farmer suppliers, use transaction data for more accurate metrics
          if (supplier.sourceType === 'farmer') {
            const totalTransactionRevenue = supplierTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
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
                new Date(Math.max(...supplierOrders.map(o => new Date(o.date || Date.now()).getTime()))).toISOString().split('T')[0] : null,
              performance: calculateSupplierPerformance(supplier, supplierOrders, supplierSales)
            };
          }
        });
        
        setSuppliers(enhancedSuppliers);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError(error.message || 'Failed to load suppliers');
      setSuppliers(getDefaultSuppliers());
      
      // Use mock data when API fails (for development)
      if (process.env.NODE_ENV === 'development') {
        setSuppliers(getDefaultSuppliers());
        setError('Using mock data - API unavailable');
      }
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
      name: "Musanze Avocado Cooperative",
      contactPerson: "Jean Baptiste Uwimana",
      email: "jean@musanzeavocado.rw",
      phone: "+250-788-123-456",
      category: "Hass Avocados",
      location: "Musanze, Northern Province",
      specialization: "Premium Hass Avocados, Organic Farming",
      status: "Active",
      joinDate: "2023-01-15",
      totalOrders: 45,
      lastOrderDate: "2024-10-01",
      rating: 4.8,
      deliveryTime: "2-3 days",
      paymentTerms: "Net 30",
      certifications: ["Organic", "Fair Trade"],
      totalSales: 850000,
      performance: {
        avgDeliveryTime: 2.5,
        onTimeRate: 95.2,
        totalRevenue: 850000,
        orderFrequency: 45
      }
    },
    {
      id: 'SUP-002',
      name: "Huye Agricultural Cooperative",
      contactPerson: "Marie Claire Mukamana",
      email: "marie@huyeagri.rw",
      phone: "+250-788-234-567",
      category: "Fuerte Avocados",
      location: "Huye, Southern Province",
      specialization: "Fuerte Avocados, Grade A Quality",
      status: "Active",
      joinDate: "2022-08-20",
      totalOrders: 32,
      lastOrderDate: "2024-09-28",
      rating: 4.6,
      deliveryTime: "1-2 days",
      paymentTerms: "Net 15",
      certifications: ["Organic", "Rwanda Standards Board"],
      totalSales: 620000,
      performance: {
        avgDeliveryTime: 1.5,
        onTimeRate: 98.1,
        totalRevenue: 620000,
        orderFrequency: 32
      }
    },
    {
      id: 'SUP-003',
      name: "Rwanda Agricultural Board",
      contactPerson: "Dr. Paul Nsengimana",
      email: "paul@rab.gov.rw",
      phone: "+250-788-345-678",
      category: "Avocado Seedlings",
      location: "Kigali, Kigali City",
      specialization: "Certified Avocado Seedlings, Research Support",
      status: "Active",
      joinDate: "2023-03-10",
      totalOrders: 8,
      lastOrderDate: "2024-09-15",
      rating: 4.9,
      deliveryTime: "1 week",
      paymentTerms: "Net 60",
      certifications: ["Government Certified", "Quality Assured"],
      totalSales: 450000,
      performance: {
        avgDeliveryTime: 7,
        onTimeRate: 100,
        totalRevenue: 450000,
        orderFrequency: 8
      }
    },
    {
      id: 'SUP-004',
      name: "Kigali Agro Supplies",
      contactPerson: "Emmanuel Habimana",
      email: "emmanuel@kigaliagro.rw",
      phone: "+250-788-456-789",
      category: "Fertilizers",
      location: "Kigali, Kigali City",
      specialization: "Organic Fertilizers, Pest Control, Farm Equipment",
      status: "Active",
      joinDate: "2023-06-05",
      totalOrders: 28,
      lastOrderDate: "2024-09-30",
      rating: 4.5,
      deliveryTime: "2-4 days",
      paymentTerms: "Net 30",
      certifications: ["Rwanda Standards Board", "ISO 9001"],
      totalSales: 380000,
      performance: {
        avgDeliveryTime: 3,
        onTimeRate: 92.5,
        totalRevenue: 380000,
        orderFrequency: 28
      }
    }
  ];

  // Ensure suppliers is always an array before filtering
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  // Filter suppliers based on search and filters
  const filteredSuppliers = safeSuppliers.filter(supplier => {
    if (!supplier) return false;
    
    const matchesSearch = (supplier.name?.toLowerCase() || '').includes(supplierSearchTerm.toLowerCase()) ||
      (supplier.contactPerson?.toLowerCase() || '').includes(supplierSearchTerm.toLowerCase()) ||
      (supplier.specialization?.toLowerCase() || '').includes(supplierSearchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Hass Avocados', 'Fuerte Avocados', 'Avocado Seedlings', 'Fertilizers', 'Pesticides', 'Farm Equipment'];

  const handleAddSupplier = async (supplierData) => {
    try {
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
      await saveSuppliers(updatedSuppliers);
      setShowModal(false);
      alert('Supplier added successfully!');
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Error adding supplier: ' + error.message);
    }
  };

  const handleEditSupplier = async (supplierData) => {
    try {
      const updatedSuppliers = suppliers.map(supplier => 
        supplier.id === selectedSupplier.id ? { ...supplier, ...supplierData } : supplier
      );
      setSuppliers(updatedSuppliers);
      await saveSuppliers(updatedSuppliers);
      setShowModal(false);
      setSelectedSupplier(null);
      alert('Supplier updated successfully!');
    } catch (error) {
      console.error('Error updating supplier:', error);
      alert('Error updating supplier: ' + error.message);
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!supplierId || !window.confirm('Are you sure you want to delete this supplier?')) return;
    
    try {
      const updatedSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
      setSuppliers(updatedSuppliers);
      await saveSuppliers(updatedSuppliers);
      alert('Supplier deleted successfully!');
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Error deleting supplier: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-200 text-green-800 ring-green-500';
      case 'Inactive': return 'bg-red-200 text-red-800 ring-red-500';
      default: return 'bg-gray-200 text-gray-800 ring-gray-500';
    }
  };

  const SupplierListView = () => (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center">
              <Leaf className="h-7 w-7 mr-3 text-emerald-600 animate-pulse" />
              Avocado Supplier Management
            </h2>
            <p className="text-emerald-600 mt-1">Manage suppliers for your Rwandan avocado farm business</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                ⚠️ {error}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                setModalType('add');
                setSelectedSupplier(null);
                setShowModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-all">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={supplierSearchTerm}
              onChange={(e) => setSupplierSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              aria-label="Search suppliers"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-emerald-600">
              Total Suppliers: <span className="font-semibold">{filteredSuppliers.length}</span>
            </span>
            <button
              onClick={loadSuppliers}
              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-emerald-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-emerald-600">Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center">
            <Truck className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-600">
              {error ? 'Unable to load suppliers. Please check your connection.' : 'No suppliers found. Add some avocado suppliers!'}
            </p>
            {error && (
              <button
                onClick={loadSuppliers}
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
                    Supplier Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Total Sales (RWF)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-100">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id || Math.random()} className="hover:bg-emerald-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-900">{supplier.name || 'N/A'}</div>
                      <div className="text-sm text-emerald-600">{supplier.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-emerald-900">{supplier.contactPerson || 'N/A'}</div>
                      <div className="text-sm text-emerald-600">{supplier.phone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-emerald-900">{supplier.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-emerald-900">{supplier.location || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(supplier.status)}`}>
                        {supplier.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-emerald-900">{supplier.rating || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-900">
                        {(supplier.totalSales || 0).toLocaleString()} RWF
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-emerald-900">{supplier.totalOrders || 0}</div>
                      <div className="text-xs text-emerald-500">
                        On-time: {supplier.performance?.onTimeRate || 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setActiveView('detail');
                          }}
                          className="text-emerald-600 hover:text-emerald-800 transform hover:scale-110 transition"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setModalType('edit');
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                          title="Edit Supplier"
                          aria-label="Edit Supplier"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="text-red-600 hover:text-red-800 transform hover:scale-110 transition"
                          title="Delete Supplier"
                          aria-label="Delete Supplier"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const SupplierDetailView = () => {
    if (!selectedSupplier) return null;

    return (
      <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => setActiveView('list')}
                className="mr-4 text-emerald-600 hover:text-emerald-800 font-medium"
              >
                ← Back to Suppliers
              </button>
              <h2 className="text-2xl font-bold text-emerald-800">{selectedSupplier.name}</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setModalType('edit');
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-all"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Supplier
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg ring-1 ring-blue-200">
              <div className="text-blue-600 text-sm font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-900">{(selectedSupplier.totalSales || 0).toLocaleString()} RWF</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg ring-1 ring-green-200">
              <div className="text-green-600 text-sm font-medium">On-Time Rate</div>
              <div className="text-2xl font-bold text-green-900">{selectedSupplier.performance?.onTimeRate || 0}%</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg ring-1 ring-yellow-200">
              <div className="text-yellow-600 text-sm font-medium">Avg Delivery</div>
              <div className="text-2xl font-bold text-yellow-900">{selectedSupplier.performance?.avgDeliveryTime || 0} days</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg ring-1 ring-purple-200">
              <div className="text-purple-600 text-sm font-medium">Total Orders</div>
              <div className="text-2xl font-bold text-purple-900">{selectedSupplier.totalOrders}</div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
            <h3 className="text-lg font-semibold mb-4 text-emerald-800">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-emerald-700">Contact Person</label>
                <p className="text-emerald-900">{selectedSupplier.contactPerson || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-700">Email</label>
                <p className="text-emerald-900">{selectedSupplier.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-700">Phone</label>
                <p className="text-emerald-900">{selectedSupplier.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-700">Location</label>
                <p className="text-emerald-900">{selectedSupplier.location || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
            <h3 className="text-lg font-semibold mb-4 text-emerald-800">Business Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-emerald-700">Category</label>
                <p className="text-emerald-900">{selectedSupplier.category || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-700">Specialization</label>
                <p className="text-emerald-900">{selectedSupplier.specialization || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-700">Payment Terms</label>
                <p className="text-emerald-900">{selectedSupplier.paymentTerms || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-700">Delivery Time</label>
                <p className="text-emerald-900">{selectedSupplier.deliveryTime || 'N/A'}</p>
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
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
          <div className="bg-emerald-600 text-white p-6 rounded-t-xl">
            <h2 className="text-xl font-bold">
              {modalType === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter contact person name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="+250-xxx-xxx-xxx"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="City, Province"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1">
                Specialization *
              </label>
              <textarea
                required
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                rows={3}
                placeholder="Describe what products/services this supplier provides"
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => { setShowModal(false); setSelectedSupplier(null); }}
                className="px-6 py-2 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
                disabled={!formData.name || !formData.contactPerson || !formData.email}
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
    <div className="min-h-screen">
      {activeView === 'list' && <SupplierListView />}
      {activeView === 'detail' && <SupplierDetailView />}
      {showModal && <SupplierModal />}
    </div>
  );
};

export default ShopSuppliers;