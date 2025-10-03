import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, Edit, CheckCircle, Leaf, Plus, Trash2 } from 'lucide-react';
import { listOrders, updateOrderStatus, getOrder, createOrder } from '../../services/orderService';

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    items: [{
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0
    }],
    shipping_address: {
      full_name: '',
      phone: '',
      street_address: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Rwanda'
    },
    billing_address: {
      full_name: '',
      phone: '',
      street_address: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Rwanda'
    },
    payment_method: 'cash',
    payment_status: 'pending',
    notes: '',
    shipping_cost: 0,
    tax_rate: 0.18,
    discount_amount: 0
  });
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        page: page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await listOrders(options);
      
      // Add debugging to see actual response structure
      console.log('API Response:', response);
      
      // Safely check if response and response.data exist and are arrays
      if (response && response.data && Array.isArray(response.data)) {
        // Transform API response to match component expectations
        const transformedOrders = response.data.map(order => ({
          id: order.id,
          order_number: order.order_number,
          customer: {
            name: order.shipping_address?.full_name || 'N/A',
            email: order.customer_id || 'N/A' // This would need customer lookup in real app
          },
          orderDate: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : 'N/A',
          status: order.status,
          totalAmount: order.total_amount || 0,
          items: order.items || [],
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          expected_delivery_date: order.expected_delivery_date,
          delivered_date: order.delivered_date,
          notes: order.notes,
          tracking_number: order.tracking_number,
          subtotal: order.subtotal,
          tax_amount: order.tax_amount,
          shipping_cost: order.shipping_cost,
          discount_amount: order.discount_amount
        }));

        setOrders(transformedOrders);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedOrders.length,
          itemsPerPage: 10
        });
      } else {
        // If no data or empty data, set empty arrays
        console.log('No orders found or invalid response structure');
        setOrders([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load orders');
      setOrders([]); // Set empty array instead of mock data
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== '' || statusFilter !== 'all') {
        loadOrders(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  // Ensure orders is always an array before filtering
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  // Client-side filtering for immediate feedback (API filtering happens on server)
  const filteredOrders = safeOrders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = searchTerm === '' || 
      (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.order_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (order.customer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
      case 'confirmed': return 'bg-blue-200 text-blue-800 ring-blue-500';
      case 'processing': return 'bg-purple-200 text-purple-800 ring-purple-500';
      case 'shipped': return 'bg-indigo-200 text-indigo-800 ring-indigo-500';
      case 'delivered': return 'bg-green-200 text-green-800 ring-green-500';
      case 'completed': return 'bg-green-200 text-green-800 ring-green-500';
      case 'cancelled': return 'bg-red-200 text-red-800 ring-red-500';
      case 'returned': return 'bg-orange-200 text-orange-800 ring-orange-500';
      default: return 'bg-gray-200 text-gray-800 ring-gray-500';
    }
  };

  const handleEditOrder = async () => {
    if (!editOrder?.status || !editOrder?.id) return;
    
    try {
      await updateOrderStatus(editOrder.id, editOrder.status);
      await loadOrders(pagination.currentPage); // Reload current page
      setShowEditModal(false);
      setEditOrder(null);
      alert('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order: ' + error.message);
    }
  };

  const handleCreateOrder = async () => {
    setCreateLoading(true);
    try {
      // Validate required fields
      if (!newOrder.shipping_address.full_name.trim()) {
        alert('Customer name is required');
        return;
      }
      
      if (!newOrder.shipping_address.phone.trim()) {
        alert('Phone number is required');
        return;
      }

      if (!newOrder.shipping_address.street_address.trim()) {
        alert('Street address is required');
        return;
      }

      if (!newOrder.shipping_address.city.trim()) {
        alert('City is required');
        return;
      }

      if (!newOrder.shipping_address.province.trim()) {
        alert('Province is required');
        return;
      }

      if (newOrder.items.some(item => !item.product_name.trim() || item.quantity <= 0 || item.unit_price <= 0)) {
        alert('All items must have a name, valid quantity, and price');
        return;
      }

      // Create the order
      await createOrder(newOrder);
      
      // Reset form and close modal
      setNewOrder({
        customer_id: '',
        items: [{
          product_id: '',
          product_name: '',
          quantity: 1,
          unit_price: 0
        }],
        shipping_address: {
          full_name: '',
          phone: '',
          street_address: '',
          city: '',
          province: '',
          postal_code: '',
          country: 'Rwanda'
        },
        billing_address: {
          full_name: '',
          phone: '',
          street_address: '',
          city: '',
          province: '',
          postal_code: '',
          country: 'Rwanda'
        },
        payment_method: 'cash',
        payment_status: 'pending',
        notes: '',
        shipping_cost: 0,
        tax_rate: 0.18,
        discount_amount: 0
      });
      
      setShowCreateModal(false);
      await loadOrders(1); // Reload orders
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order: ' + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (order) => {
    if (!order) return;
    setEditOrder({ ...order });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const addItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, {
        product_id: '',
        product_name: '',
        quantity: 1,
        unit_price: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleViewOrder = async (order) => {
    try {
      // Fetch full order details from API
      const fullOrderData = await getOrder(order.id);
      
      // Transform the detailed order data
      const transformedOrder = {
        ...order,
        ...fullOrderData,
        customer: {
          name: fullOrderData.shipping_address?.full_name || order.customer?.name || 'N/A',
          email: fullOrderData.customer_id || order.customer?.email || 'N/A'
        }
      };
      
      setSelectedOrder(transformedOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to showing order with available data
      setSelectedOrder(order);
    }
  };

  const handlePageChange = (page) => {
    loadOrders(page);
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-emerald-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center">
              <Leaf className="h-7 w-7 mr-3 text-emerald-600 animate-pulse" />
              Avocado Order Management
            </h2>
            <p className="text-emerald-600 mt-1">Track and manage customer orders for your Rwandan avocado farm</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                ⚠️ {error}
              </div>
            )}
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Order
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
              placeholder="Search orders or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              aria-label="Search orders or customers"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-emerald-600">
              Total Orders: <span className="font-semibold">{pagination.totalItems}</span>
            </span>
            <button
              onClick={() => loadOrders(pagination.currentPage)}
              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-emerald-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-2 text-emerald-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-emerald-600 text-lg font-medium mb-2">
              {error ? 'Unable to load orders' : 'No orders found'}
            </p>
            <p className="text-emerald-500 text-sm mb-4">
              {error 
                ? 'Please check your connection and try again.' 
                : 'There are currently no orders in your avocado farm database. Orders will appear here once customers start placing them.'
              }
            </p>
            {error ? (
              <button
                onClick={() => loadOrders(1)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
              >
                Try Again
              </button>
            ) : (
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Order
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Total (RWF)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-emerald-900">{order.order_number || order.id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-emerald-900">{order.customer?.name || 'N/A'}</div>
                        <div className="text-sm text-emerald-600">{order.customer?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-emerald-900">{order.orderDate || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(order.status)}`}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-emerald-900">
                          {order.totalAmount ? order.totalAmount.toLocaleString() : '0'} RWF
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-emerald-600 hover:text-emerald-800 transform hover:scale-110 transition"
                            title="View Order"
                            aria-label="View Order"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(order)}
                            className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                            title="Edit Order"
                            aria-label="Edit Order"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-emerald-50 px-6 py-3 flex items-center justify-between border-t border-emerald-100">
                <div className="flex items-center text-sm text-emerald-600">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-emerald-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-800">Create New Order</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer & Shipping Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-emerald-700 mb-4">Customer Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Customer ID (Optional)</label>
                      <input
                        type="text"
                        value={newOrder.customer_id}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, customer_id: e.target.value }))}
                        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter customer ID if applicable"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-emerald-700 mb-4">Shipping Address</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={newOrder.shipping_address.full_name}
                        onChange={(e) => setNewOrder(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, full_name: e.target.value }
                        }))}
                        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={newOrder.shipping_address.phone}
                        onChange={(e) => setNewOrder(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, phone: e.target.value }
                        }))}
                        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={newOrder.shipping_address.street_address}
                        onChange={(e) => setNewOrder(prev => ({
                          ...prev,
                          shipping_address: { ...prev.shipping_address, street_address: e.target.value }
                        }))}
                        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter street address"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">City *</label>
                        <input
                          type="text"
                          value={newOrder.shipping_address.city}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, city: e.target.value }
                          }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter city"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Province *</label>
                        <select
                          value={newOrder.shipping_address.province}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, province: e.target.value }
                          }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          required
                        >
                          <option value="">Select Province</option>
                          <option value="Kigali">Kigali</option>
                          <option value="Eastern">Eastern</option>
                          <option value="Northern">Northern</option>
                          <option value="Southern">Southern</option>
                          <option value="Western">Western</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={newOrder.shipping_address.postal_code}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, postal_code: e.target.value }
                          }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter postal code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={newOrder.shipping_address.country}
                          onChange={(e) => setNewOrder(prev => ({
                            ...prev,
                            shipping_address: { ...prev.shipping_address, country: e.target.value }
                          }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items & Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-emerald-700">Order Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-4">
                    {newOrder.items.map((item, index) => (
                      <div key={index} className="bg-emerald-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-emerald-700">Item {index + 1}</span>
                          {newOrder.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-emerald-700 mb-1">Product Name *</label>
                            <input
                              type="text"
                              value={item.product_name}
                              onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                              className="w-full p-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                              placeholder="Enter product name"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-emerald-700 mb-1">Quantity *</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full p-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-emerald-700 mb-1">Unit Price (RWF) *</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                                required
                              />
                            </div>
                          </div>
                          <div className="text-sm text-emerald-600">
                            Total: {(item.quantity * item.unit_price).toLocaleString()} RWF
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-emerald-700 mb-4">Order Details</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Payment Method</label>
                        <select
                          value={newOrder.payment_method}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, payment_method: e.target.value }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="cash">Cash</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="credit_card">Credit Card</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Payment Status</label>
                        <select
                          value={newOrder.payment_status}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, payment_status: e.target.value }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Shipping Cost (RWF)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newOrder.shipping_cost}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, shipping_cost: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Tax Rate</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={newOrder.tax_rate}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="0.18"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-emerald-700 mb-2">Discount (RWF)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newOrder.discount_amount}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, discount_amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-emerald-700 mb-2">Notes</label>
                      <textarea
                        value={newOrder.notes}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        rows="3"
                        placeholder="Add any additional notes for this order..."
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h5 className="font-medium text-emerald-700 mb-2">Order Summary</h5>
                      {(() => {
                        const subtotal = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
                        const taxAmount = subtotal * newOrder.tax_rate;
                        const total = subtotal + taxAmount + newOrder.shipping_cost - newOrder.discount_amount;
                        
                        return (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{subtotal.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax ({(newOrder.tax_rate * 100).toFixed(0)}%):</span>
                              <span>{taxAmount.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping:</span>
                              <span>{newOrder.shipping_cost.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount:</span>
                              <span>-{newOrder.discount_amount.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>Total:</span>
                              <span>{total.toLocaleString()} RWF</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all"
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-800">
                Order Details - {selectedOrder.order_number || selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-emerald-400 hover:text-emerald-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-emerald-700 mb-2">Customer Information</h4>
                  <p className="text-sm text-emerald-600">Name: {selectedOrder.customer?.name || 'N/A'}</p>
                  <p className="text-sm text-emerald-600">Email: {selectedOrder.customer?.email || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-emerald-700 mb-2">Order Information</h4>
                  <p className="text-sm text-emerald-600">Order Date: {selectedOrder.orderDate || 'N/A'}</p>
                  <p className="text-sm text-emerald-600">Status: 
                    <span className={`inline-flex ml-2 px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status ? selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1) : 'Unknown'}
                    </span>
                  </p>
                  <p className="text-sm text-emerald-600">Payment Status: {selectedOrder.payment_status || 'N/A'}</p>
                  {selectedOrder.tracking_number && (
                    <p className="text-sm text-emerald-600">Tracking: {selectedOrder.tracking_number}</p>
                  )}
                </div>

                {selectedOrder.shipping_address && (
                  <div>
                    <h4 className="text-sm font-medium text-emerald-700 mb-2">Shipping Address</h4>
                    <div className="text-sm text-emerald-600">
                      <p>{selectedOrder.shipping_address.full_name}</p>
                      <p>{selectedOrder.shipping_address.street_address}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province}</p>
                      <p>{selectedOrder.shipping_address.country}</p>
                      <p>Phone: {selectedOrder.shipping_address.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-emerald-700 mb-2">Items Ordered</h4>
                  {selectedOrder.items?.length ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="bg-emerald-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-emerald-900">
                            {item.product_name || item.name || 'N/A'}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Quantity: {item.quantity || 0} × {(item.unit_price || item.price || 0).toLocaleString()} RWF
                          </p>
                          <p className="text-xs text-emerald-600">
                            Total: {(item.total_price || (item.quantity * item.unit_price) || 0).toLocaleString()} RWF
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-emerald-600">No items in this order.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-emerald-700 mb-2">Order Summary</h4>
                  <div className="bg-emerald-50 p-3 rounded-lg space-y-1 text-sm">
                    {selectedOrder.subtotal && (
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{selectedOrder.subtotal.toLocaleString()} RWF</span>
                      </div>
                    )}
                    {selectedOrder.tax_amount && (
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{selectedOrder.tax_amount.toLocaleString()} RWF</span>
                      </div>
                    )}
                    {selectedOrder.shipping_cost && (
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{selectedOrder.shipping_cost.toLocaleString()} RWF</span>
                      </div>
                    )}
                    {selectedOrder.discount_amount && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{selectedOrder.discount_amount.toLocaleString()} RWF</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total:</span>
                      <span>{(selectedOrder.totalAmount || selectedOrder.total_amount || 0).toLocaleString()} RWF</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-emerald-700 mb-2">Notes</h4>
                    <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-800">
                Edit Order - {editOrder.order_number || editOrder.id}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-emerald-400 hover:text-emerald-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-2">Order Status</label>
                <select
                  value={editOrder.status || 'pending'}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  aria-label="Order status"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditOrder}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all transform hover:scale-105"
                disabled={!editOrder.status}
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopOrders;