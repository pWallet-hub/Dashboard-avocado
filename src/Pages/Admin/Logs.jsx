import React, { useEffect, useState } from 'react';
import { FileText, Filter, Download, Trash2, AlertCircle, AlertTriangle, Info, Bug, Globe } from 'lucide-react';
import { listLogs, exportLogs, getLogStatistics, cleanupLogs } from '../../services/logsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const LEVEL_OPTIONS = ['error', 'warn', 'info', 'http', 'debug'];

const LEVEL_ICONS = {
  error: AlertCircle,
  warn: AlertTriangle,
  info: Info,
  http: Globe,
  debug: Bug,
};

const LEVEL_COLORS = {
  error: 'bg-red-200 text-red-800 ring-red-500',
  warn: 'bg-yellow-200 text-yellow-800 ring-yellow-500',
  info: 'bg-blue-200 text-blue-800 ring-blue-500',
  http: 'bg-purple-200 text-purple-800 ring-purple-500',
  debug: 'bg-gray-200 text-gray-800 ring-gray-500',
};

const Logs = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });

  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [exporting, setExporting] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const loadLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const options = { page, limit: 20, ...(levelFilter !== 'all' && { level: levelFilter }) };
      const response = await listLogs(options);
      setLogs(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error loading logs:', err);
      setError(err.message || 'Failed to load logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    setStatsLoading(true);
    try {
      const data = await getLogStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Error loading log statistics:', err);
      toast.error(err.message || 'Failed to load log statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelFilter]);

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportLogs(levelFilter !== 'all' ? { level: levelFilter } : {});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `logs-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Logs exported successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  const handleCleanup = async () => {
    const days = parseInt(cleanupDays, 10);
    if (!Number.isInteger(days) || days < 1) {
      toast.error('Please enter a valid number of days');
      return;
    }
    const ok = await confirm(
      `Delete all logs older than ${days} day${days === 1 ? '' : 's'}? This cannot be undone.`,
      { title: 'Clean Up Logs', confirmLabel: 'Delete Logs' }
    );
    if (!ok) return;

    setCleanupLoading(true);
    try {
      await cleanupLogs(days);
      toast.success(`Logs older than ${days} days deleted`);
      await loadLogs(1);
      await loadStatistics();
    } catch (err) {
      toast.error(err.message || 'Failed to clean up logs');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handlePageChange = (page) => loadLogs(page);

  const formatStatus = (level) => (level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown');

  const statEntries = statistics && typeof statistics === 'object' && !Array.isArray(statistics)
    ? (statistics.byLevel || statistics.levels || statistics)
    : {};

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <FileText className="h-7 w-7 mr-3 text-green-600" />
              System Logs
            </h2>
            <p className="text-green-600 mt-1">Review, export, and clean up application logs</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">{error}</div>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            <Download className="h-5 w-5 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Log Level Statistics</h3>
        {statsLoading ? (
          <p className="text-green-600 text-sm">Loading statistics...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {LEVEL_OPTIONS.map((level) => {
              const Icon = LEVEL_ICONS[level];
              const value = (statEntries && (statEntries[level] ?? statEntries[level.toUpperCase()])) ?? 0;
              return (
                <div key={level} className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-green-600 uppercase">{level}</p>
                    <Icon className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-green-900 mt-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter + cleanup */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by level"
            >
              <option value="all">All Levels</option>
              {LEVEL_OPTIONS.map((l) => (
                <option key={l} value={l}>{formatStatus(l)}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-green-700 whitespace-nowrap">Delete logs older than</label>
            <input
              type="number"
              min="1"
              value={cleanupDays}
              onChange={(e) => setCleanupDays(e.target.value)}
              className="w-24 p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-green-700">days</span>
            <button
              onClick={handleCleanup}
              disabled={cleanupLoading}
              className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {cleanupLoading ? 'Cleaning...' : 'Cleanup'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {logs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                        {log.timestamp || log.createdAt ? new Date(log.timestamp || log.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${LEVEL_COLORS[log.level] || 'bg-gray-200 text-gray-800 ring-gray-500'}`}>
                          {formatStatus(log.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-green-700 max-w-xl truncate">{log.message}</td>
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
    </div>
  );
};

export default Logs;
