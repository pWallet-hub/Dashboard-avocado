import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, Edit, CheckCircle, Leaf } from 'lucide-react';
import { getOrders, updateOrder } from '../../services/marketStorageService.js';

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Error loading orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
      case 'processing': return 'bg-blue-200 text-blue-800 ring-blue-500';
      case 'completed': return 'bg-green-200 text-green-800 ring-green-500';
      case 'cancelled': return 'bg-red-200 text-red-800 ring-red-500';
      default: return 'bg-gray-200 text-gray-800 ring-gray-500';
    }
  };

  const handleEditOrder = async () => {
    if (!editOrder?.status) return;
    try {
      await updateOrder(editOrder.id, { ...editOrder });
      await loadOrders();
      setShowEditModal(false);
      setEditOrder(null);
      alert('Order updated successfully');
    } catch (error) {
      alert('Error updating order: ' + error.message);
    }
  };

  const openEditModal = (order) => {
    setEditOrder({ ...order });
    setShowEditModal(true);
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
          </div>
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
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-emerald-600">
              Total Orders: <span className="font-semibold">{filteredOrders.length}</span>
            </span>
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
            <p className="text-emerald-600">No orders found for your avocado farm</p>
          </div>
        ) : (
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
                      <div className="text-sm font-medium text-emerald-900">{order.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-900">{order.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-emerald-600">{order.customer?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-emerald-900">{order.orderDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-900">{order.totalAmount?.toFixed(0) || '0'} RWF</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
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
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-emerald-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-emerald-800">Order Details - {selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-emerald-400 hover:text-emerald-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-emerald-700">Customer Information</h4>
                <p className="text-sm text-emerald-600">Name: {selectedOrder.customer?.name || 'N/A'}</p>
                <p className="text-sm text-emerald-600">Email: {selectedOrder.customer?.email || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-emerald-700">Order Information</h4>
                <p className="text-sm text-emerald-600">Order Date: {selectedOrder.orderDate}</p>
                <p className="text-sm text-emerald-600">Status: 
                  <span className={`inline-flex ml-2 px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-emerald-600">Total: {selectedOrder.totalAmount?.toFixed(0) || '0'} RWF</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-emerald-700">Items Ordered</h4>
                {selectedOrder.items?.length ? (
                  <ul className="list-disc pl-5 space-y-2 text-sm text-emerald-600">
                    {selectedOrder.items.map((item, index) => (
                      <li key={index}>
                        {item.name} - {item.quantity} {item.unit} @ {item.price.toFixed(0)} RWF
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-600">No items in this order.</p>
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
              <h3 className="text-xl font-semibold text-emerald-800">Edit Order - {editOrder.id}</h3>
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
                  value={editOrder.status}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                  className="w-full p-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-all"
                  aria-label="Order status"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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