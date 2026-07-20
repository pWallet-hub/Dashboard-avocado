import React, { useEffect, useState } from 'react';
import { ClipboardList, Filter, Eye, Plus, Trash2, Send, CheckCircle2, XCircle, PackageCheck, Leaf } from 'lucide-react';
import {
  listPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrder,
  submitPurchaseOrder,
  approvePurchaseOrder,
  cancelPurchaseOrder,
  receiveGoods,
} from '../../services/procurementService';
import { getSuppliers } from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const STATUS_OPTIONS = ['draft', 'submitted', 'approved', 'ordered', 'partially_received', 'fully_received', 'cancelled'];

const emptyItem = () => ({ product_name: '', product_id: '', quantity_ordered: 1, unit_price: 0 });

const emptyReceiptItem = () => ({ product_name: '', product_id: '', quantity: 1, unit_price: 0, notes: '' });

const Procurement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newPO, setNewPO] = useState({
    supplier_id: '',
    expected_date: '',
    notes: '',
    items: [emptyItem()],
  });

  const [selectedPO, setSelectedPO] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ notes: '', items: [emptyReceiptItem()] });

  useEffect(() => {
    loadPurchaseOrders();
    getSuppliers()
      .then((response) => {
        const data = Array.isArray(response) ? response : response?.data || [];
        setSuppliers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Error loading suppliers:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPurchaseOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadPurchaseOrders = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      const response = await listPurchaseOrders(options);
      setPurchaseOrders(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error loading purchase orders:', err);
      setError(err.message || 'Failed to load purchase orders');
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-200 text-gray-800 ring-gray-500';
      case 'submitted': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
      case 'approved': return 'bg-blue-200 text-blue-800 ring-blue-500';
      case 'ordered': return 'bg-indigo-200 text-indigo-800 ring-indigo-500';
      case 'partially_received': return 'bg-purple-200 text-purple-800 ring-purple-500';
      case 'fully_received': return 'bg-green-200 text-green-800 ring-green-500';
      case 'cancelled': return 'bg-red-200 text-red-800 ring-red-500';
      default: return 'bg-gray-200 text-gray-800 ring-gray-500';
    }
  };

  const formatStatus = (status) => (status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown');

  const canReceive = (status) => ['approved', 'ordered', 'partially_received'].includes(status);
  const canCancel = (status) => isAdmin && status !== 'fully_received' && status !== 'cancelled';

  // ── Create PO ──
  const addItem = () => setNewPO((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (index) => setNewPO((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItem = (index, field, value) =>
    setNewPO((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));

  const resetNewPO = () => setNewPO({ supplier_id: '', expected_date: '', notes: '', items: [emptyItem()] });

  const handleCreatePO = async () => {
    if (!newPO.supplier_id) {
      toast.error('Please select a supplier');
      return;
    }
    if (newPO.items.some((item) => !item.product_name.trim() || item.quantity_ordered <= 0 || item.unit_price < 0)) {
      toast.error('All items require a product name, valid quantity, and price');
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        supplier_id: newPO.supplier_id,
        notes: newPO.notes || undefined,
        expected_date: newPO.expected_date || undefined,
        items: newPO.items.map((item) => ({
          product_name: item.product_name,
          product_id: item.product_id || undefined,
          quantity_ordered: Number(item.quantity_ordered),
          unit_price: Number(item.unit_price),
        })),
      };
      await createPurchaseOrder(payload);
      toast.success('Purchase order created as draft');
      resetNewPO();
      setShowCreateModal(false);
      await loadPurchaseOrders(1);
    } catch (err) {
      toast.error(err.message || 'Failed to create purchase order');
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Detail view ──
  const openDetail = async (po) => {
    setDetailLoading(true);
    setSelectedPO(po);
    try {
      const full = await getPurchaseOrder(po.id);
      setSelectedPO(full);
    } catch (err) {
      toast.error(err.message || 'Failed to load purchase order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async (id) => {
    try {
      const full = await getPurchaseOrder(id);
      setSelectedPO(full);
    } catch (err) {
      console.error('Error refreshing purchase order:', err);
    }
  };

  const handleSubmitPO = async (id) => {
    setActionLoading(true);
    try {
      await submitPurchaseOrder(id);
      toast.success('Purchase order submitted for approval');
      await refreshDetail(id);
      await loadPurchaseOrders(pagination.currentPage);
    } catch (err) {
      toast.error(err.message || 'Failed to submit purchase order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePO = async (id) => {
    setActionLoading(true);
    try {
      await approvePurchaseOrder(id);
      toast.success('Purchase order approved');
      await refreshDetail(id);
      await loadPurchaseOrders(pagination.currentPage);
    } catch (err) {
      toast.error(err.message || 'Failed to approve purchase order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPO = async (id) => {
    const ok = await confirm('Cancel this purchase order? This cannot be undone.', { title: 'Cancel Purchase Order', confirmLabel: 'Cancel PO' });
    if (!ok) return;
    setActionLoading(true);
    try {
      await cancelPurchaseOrder(id);
      toast.success('Purchase order cancelled');
      await refreshDetail(id);
      await loadPurchaseOrders(pagination.currentPage);
    } catch (err) {
      toast.error(err.message || 'Failed to cancel purchase order');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Receive goods ──
  const openReceiveModal = () => {
    const items = (selectedPO.items || []).map((item) => ({
      product_name: item.product_name,
      product_id: item.product_id || '',
      quantity: item.quantity_ordered || 1,
      unit_price: item.unit_price || 0,
      notes: '',
    }));
    setReceiptForm({ notes: '', items: items.length > 0 ? items : [emptyReceiptItem()] });
    setShowReceiveModal(true);
  };

  const addReceiptItem = () => setReceiptForm((prev) => ({ ...prev, items: [...prev.items, emptyReceiptItem()] }));
  const removeReceiptItem = (index) => setReceiptForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateReceiptItem = (index, field, value) =>
    setReceiptForm((prev) => ({ ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)) }));

  const handleReceiveGoods = async () => {
    if (receiptForm.items.some((item) => !item.product_name.trim() || item.quantity <= 0 || item.unit_price < 0)) {
      toast.error('All received items require a product name, valid quantity, and price');
      return;
    }
    setReceiveLoading(true);
    try {
      const payload = {
        notes: receiptForm.notes || undefined,
        items: receiptForm.items.map((item) => ({
          product_name: item.product_name,
          product_id: item.product_id || undefined,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          notes: item.notes || undefined,
        })),
      };
      await receiveGoods(selectedPO.id, payload);
      toast.success('Goods receipt recorded');
      setShowReceiveModal(false);
      await refreshDetail(selectedPO.id);
      await loadPurchaseOrders(pagination.currentPage);
    } catch (err) {
      toast.error(err.message || 'Failed to record goods receipt');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handlePageChange = (page) => loadPurchaseOrders(page);

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <ClipboardList className="h-7 w-7 mr-3 text-green-600" />
              Procurement
            </h2>
            <p className="text-green-600 mt-1">Manage purchase orders and goods receipts from suppliers</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{formatStatus(s)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Total Purchase Orders: <span className="font-semibold">{pagination.totalItems}</span>
            </span>
            <button
              onClick={() => loadPurchaseOrders(pagination.currentPage)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading purchase orders...</p>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No purchase orders found</p>
            <p className="text-green-500 text-sm mb-4">Create a purchase order to start restocking from your suppliers.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Purchase Order
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">PO Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Expected Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-900">{po.po_number || po.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-900">{po.supplier?.name || po.supplier_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(po.status)}`}>
                          {formatStatus(po.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-900">
                          {po.expected_date ? new Date(po.expected_date).toISOString().split('T')[0] : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openDetail(po)}
                          className="text-green-600 hover:text-green-800 transform hover:scale-110 transition"
                          title="View Purchase Order"
                          aria-label="View Purchase Order"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="bg-green-50 px-6 py-3 flex items-center justify-between border-t border-green-100">
                <div className="flex items-center text-sm text-green-600">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-green-700">Page {pagination.currentPage} of {pagination.totalPages}</span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Create Purchase Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-green-400 hover:text-green-600 text-2xl" aria-label="Close">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Supplier *</label>
                <select
                  value={newPO.supplier_id}
                  onChange={(e) => setNewPO((prev) => ({ ...prev, supplier_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name || s.company_name || s.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Expected Date</label>
                <input
                  type="date"
                  value={newPO.expected_date}
                  onChange={(e) => setNewPO((prev) => ({ ...prev, expected_date: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={newPO.notes}
                  onChange={(e) => setNewPO((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                  placeholder="Add any notes for this purchase order..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-green-700">Line Items</h4>
                  <button type="button" onClick={addItem} className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {newPO.items.map((item, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-green-700">Item {index + 1}</span>
                        {newPO.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Product Name *</label>
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                            className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Enter product name"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Quantity Ordered *</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity_ordered}
                              onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 1)}
                              className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Unit Price (RWF) *</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="text-sm text-green-600">
                          Line Total: {(item.quantity_ordered * item.unit_price).toLocaleString()} RWF
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePO}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800 flex items-center gap-3">
                Purchase Order - {selectedPO.po_number || selectedPO.id}
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(selectedPO.status)}`}>
                  {formatStatus(selectedPO.status)}
                </span>
              </h3>
              <button onClick={() => setSelectedPO(null)} className="text-green-400 hover:text-green-600 text-2xl" aria-label="Close">×</button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Supplier</h4>
                    <p className="text-sm text-green-600">{selectedPO.supplier?.name || selectedPO.supplier_id || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Expected Date</h4>
                    <p className="text-sm text-green-600">
                      {selectedPO.expected_date ? new Date(selectedPO.expected_date).toISOString().split('T')[0] : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedPO.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2">Notes</h4>
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{selectedPO.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2">Line Items</h4>
                  {selectedPO.items?.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-100">
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Product</th>
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Ordered Qty</th>
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Unit Price</th>
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPO.items.map((item, idx) => (
                            <tr key={item.id || idx} className="border-b border-green-50">
                              <td className="py-2 px-3">{item.product_name}</td>
                              <td className="py-2 px-3">{item.quantity_ordered}</td>
                              <td className="py-2 px-3">{Number(item.unit_price || 0).toLocaleString()} RWF</td>
                              <td className="py-2 px-3">{(Number(item.quantity_ordered || 0) * Number(item.unit_price || 0)).toLocaleString()} RWF</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No line items.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2">Goods Receipts</h4>
                  {selectedPO.goods_receipts?.length || selectedPO.receipts?.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-100">
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Received Date</th>
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Items</th>
                            <th className="text-left py-2 px-3 font-semibold text-green-700">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedPO.goods_receipts || selectedPO.receipts).map((receipt, idx) => (
                            <tr key={receipt.id || idx} className="border-b border-green-50">
                              <td className="py-2 px-3">
                                {receipt.received_date || receipt.createdAt ? new Date(receipt.received_date || receipt.createdAt).toISOString().split('T')[0] : 'N/A'}
                              </td>
                              <td className="py-2 px-3">
                                {(receipt.items || []).map((i) => `${i.product_name} x${i.quantity}`).join(', ') || '—'}
                              </td>
                              <td className="py-2 px-3">{receipt.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">No goods received yet.</p>
                  )}
                </div>

                {/* Lifecycle actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-green-100">
                  {selectedPO.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitPO(selectedPO.id)}
                      disabled={actionLoading}
                      className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Approval
                    </button>
                  )}
                  {isAdmin && selectedPO.status === 'submitted' && (
                    <button
                      onClick={() => handleApprovePO(selectedPO.id)}
                      disabled={actionLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  )}
                  {canReceive(selectedPO.status) && (
                    <button
                      onClick={openReceiveModal}
                      disabled={actionLoading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      <PackageCheck className="h-4 w-4 mr-2" />
                      Record Goods Receipt
                    </button>
                  )}
                  {canCancel(selectedPO.status) && (
                    <button
                      onClick={() => handleCancelPO(selectedPO.id)}
                      disabled={actionLoading}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel PO
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setSelectedPO(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Goods Modal */}
      {showReceiveModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800 flex items-center">
                <Leaf className="h-6 w-6 mr-2 text-green-600" />
                Record Goods Receipt
              </h3>
              <button onClick={() => setShowReceiveModal(false)} className="text-green-400 hover:text-green-600 text-2xl" aria-label="Close">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                  placeholder="Add any notes about this receipt..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-green-700">Received Items</h4>
                  <button type="button" onClick={addReceiptItem} className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {receiptForm.items.map((item, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-green-700">Item {index + 1}</span>
                        {receiptForm.items.length > 1 && (
                          <button type="button" onClick={() => removeReceiptItem(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Product Name *</label>
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => updateReceiptItem(index, 'product_name', e.target.value)}
                            className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Quantity Received *</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateReceiptItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">Unit Price (RWF) *</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateReceiptItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowReceiveModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={receiveLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReceiveGoods}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={receiveLoading}
              >
                {receiveLoading ? 'Recording...' : 'Record Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procurement;
