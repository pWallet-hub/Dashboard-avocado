import React, { useState, useEffect } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  getMarketTransactions,
  getTransactionsSummary,
  getTransactionById,
  updateTransactionStatus,
} from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const STATUS_OPTIONS = ['pending', 'completed', 'failed', 'cancelled', 'processing'];
const TYPE_OPTIONS = ['payment', 'refund', 'adjustment', 'fee', 'commission'];

function Transactions() {
  const toast = useToast();
  const confirm = useConfirm();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');

  const loadTransactions = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
      };

      const result = await getMarketTransactions(options);

      // Be defensive: result may be a plain array or { data, pagination }
      const list = Array.isArray(result) ? result : (result?.data || []);
      const paginationData = (!Array.isArray(result) && result?.pagination) || {};

      setTransactions(Array.isArray(list) ? list : []);
      setPagination({
        page: paginationData.page || paginationData.currentPage || page,
        limit: paginationData.limit || paginationData.itemsPerPage || 10,
        total: paginationData.total || paginationData.totalItems || list.length || 0,
        pages: paginationData.pages || paginationData.totalPages || 1,
      });
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'Failed to load transactions');
      setTransactions([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const result = await getTransactionsSummary();
      setSummary(result || null);
    } catch (err) {
      console.error('Error loading transactions summary:', err);
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadSummary();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
      case 'processing': return 'bg-purple-200 text-purple-800 ring-purple-500';
      case 'completed': return 'bg-green-200 text-green-800 ring-green-500';
      case 'failed': return 'bg-red-200 text-red-800 ring-red-500';
      case 'cancelled': return 'bg-red-200 text-red-800 ring-red-500';
      default: return 'bg-gray-200 text-gray-800 ring-gray-500';
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const handleViewTransaction = async (tx) => {
    try {
      const full = await getTransactionById(tx.id);
      const merged = { ...tx, ...(full || {}) };
      setSelectedTransaction(merged);
      setNewStatus(merged.status || 'pending');
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setSelectedTransaction(tx);
      setNewStatus(tx.status || 'pending');
    }
  };

  const handlePageChange = (page) => {
    loadTransactions(page);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTransaction?.id) return;
    const confirmed = await confirm(`Update this transaction's status to ${newStatus}?`);
    if (!confirmed) return;

    try {
      await updateTransactionStatus(selectedTransaction.id, newStatus);
      toast.success('Transaction status updated');
      setShowStatusModal(false);
      setSelectedTransaction(null);
      await loadTransactions(pagination.page);
    } catch (err) {
      console.error('Error updating transaction status:', err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const totalRevenue = summary?.total_revenue ?? summary?.total_amount ?? 0;
  const totalTransactions = summary?.total_transactions ?? summary?.count ?? 0;
  const pendingAmount = summary?.pending_amount ?? 0;
  const completedCount = summary?.completed_count ?? summary?.completed_transactions ?? 0;

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-slate-50 to-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-blue-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Receipt className="h-7 w-7 mr-3 text-blue-600" />
            Transactions
          </h2>
          <p className="text-slate-600 mt-1">Financial transactions and admin summary</p>
          {error && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {summaryLoading || !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-6 w-32 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {Number(totalRevenue ?? 0).toLocaleString()} RWF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Transactions</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {Number(totalTransactions ?? 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Amount</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {Number(pendingAmount ?? 0).toLocaleString()} RWF
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-xl font-bold text-slate-800 mt-1">
                  {Number(completedCount ?? 0).toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              Total: <span className="font-semibold">{pagination.total}</span>
            </span>
            <button
              onClick={() => loadTransactions(pagination.page)}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-blue-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium mb-2">
              {error ? 'Unable to load transactions' : 'No transactions found'}
            </p>
            <p className="text-slate-500 text-sm mb-4">
              {error
                ? 'Please check your connection and try again.'
                : 'There are currently no transactions recorded.'}
            </p>
            {error && (
              <button
                onClick={() => loadTransactions(1)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">ID / Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Payer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Payee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{tx.id || 'N/A'}</div>
                        {tx.order_id && (
                          <div className="text-xs text-slate-500">Order: {tx.order_id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{tx.payer_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{tx.payee_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {Number(tx.amount ?? 0).toLocaleString()} {tx.currency || 'RWF'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700 capitalize">{tx.type || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700 capitalize">{(tx.payment_method || 'N/A').replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(tx.status)}`}>
                          {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{formatDate(tx.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewTransaction(tx)}
                          className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                          title="View Transaction"
                          aria-label="View Transaction"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-blue-50 px-6 py-3 flex items-center justify-between border-t border-blue-100">
                <div className="flex items-center text-sm text-slate-600">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-blue-300 rounded-lg text-slate-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-slate-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 border border-blue-300 rounded-lg text-slate-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Transaction Details - {selectedTransaction.id}
              </h3>
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setShowStatusModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">ID</p>
                <p className="text-sm text-slate-800">{selectedTransaction.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Order ID</p>
                <p className="text-sm text-slate-800">{selectedTransaction.order_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Payer ID</p>
                <p className="text-sm text-slate-800">{selectedTransaction.payer_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Payee ID</p>
                <p className="text-sm text-slate-800">{selectedTransaction.payee_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Amount</p>
                <p className="text-sm text-slate-800">
                  {Number(selectedTransaction.amount ?? 0).toLocaleString()} {selectedTransaction.currency || 'RWF'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Fees</p>
                <p className="text-sm text-slate-800">{Number(selectedTransaction.fees ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Type</p>
                <p className="text-sm text-slate-800 capitalize">{selectedTransaction.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Payment Method</p>
                <p className="text-sm text-slate-800 capitalize">{(selectedTransaction.payment_method || 'N/A').replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Status</p>
                <p className="text-sm">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status ? selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1) : 'Unknown'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Created At</p>
                <p className="text-sm text-slate-800">{formatDate(selectedTransaction.created_at)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 uppercase">Description</p>
                <p className="text-sm text-slate-800">{selectedTransaction.description || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-blue-100 pt-6">
              {!showStatusModal ? (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
                >
                  Change Status
                </button>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                    aria-label="New transaction status"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="px-4 py-2 border border-blue-300 rounded-lg text-slate-700 hover:bg-blue-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => {
                  setSelectedTransaction(null);
                  setShowStatusModal(false);
                }}
                className="px-6 py-3 border border-blue-300 rounded-lg text-slate-700 hover:bg-blue-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
