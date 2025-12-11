import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Filter,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  BarChart3,
  Clock,
  Database
} from 'lucide-react';
import {
  getLogs,
  getLogsByLevel,
  getLogsByDateRange,
  exportLogs,
  clearOldLogs,
  getLogStatistics
} from '../../services/logsService';

const LogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    level: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 50
  });

  const logLevels = [
    { value: 'error', label: 'Error', color: 'text-red-600 bg-red-100', icon: XCircle },
    { value: 'warn', label: 'Warning', color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle },
    { value: 'info', label: 'Info', color: 'text-blue-600 bg-blue-100', icon: Info },
    { value: 'debug', label: 'Debug', color: 'text-gray-600 bg-gray-100', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchLogs();
    fetchStatistics();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (filters.startDate && filters.endDate) {
        response = await getLogsByDateRange(filters.startDate, filters.endDate, {
          level: filters.level,
          search: filters.search,
          page: filters.page,
          limit: filters.limit
        });
      } else if (filters.level) {
        response = await getLogsByLevel(filters.level, {
          search: filters.search,
          page: filters.page,
          limit: filters.limit
        });
      } else {
        response = await getLogs({
          level: filters.level,
          search: filters.search,
          page: filters.page,
          limit: filters.limit
        });
      }

      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      setError(error.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getLogStatistics();
      if (response.success) {
        setStatistics(response.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch log statistics:', error);
    }
  };

  const handleExportLogs = async () => {
    try {
      setLoading(true);
      const blob = await exportLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to export logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearOldLogs = async () => {
    if (!window.confirm('Are you sure you want to clear logs older than 30 days? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await clearOldLogs(30);
      if (response.success) {
        alert(`Successfully cleared ${response.data.deleted_count || 0} old log entries`);
        fetchLogs();
        fetchStatistics();
      }
    } catch (error) {
      setError('Failed to clear old logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLogLevelInfo = (level) => {
    return logLevels.find(l => l.value === level) || logLevels[2];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">System Logs Management</h1>
                  <p className="text-indigo-100 mt-1">Monitor and analyze system activity logs</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleExportLogs}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
                <button
                  onClick={handleClearOldLogs}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 shadow-lg disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Old
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-red-600 opacity-50" />
                </div>
                <p className="text-sm font-semibold text-red-600 mb-1">Error Logs</p>
                <p className="text-3xl font-bold text-red-700">{statistics.error_count || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-yellow-600 opacity-50" />
                </div>
                <p className="text-sm font-semibold text-yellow-600 mb-1">Warning Logs</p>
                <p className="text-3xl font-bold text-yellow-700">{statistics.warn_count || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-blue-600 opacity-50" />
                </div>
                <p className="text-sm font-semibold text-blue-600 mb-1">Info Logs</p>
                <p className="text-3xl font-bold text-blue-700">{statistics.info_count || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <BarChart3 className="w-5 h-5 text-green-600 opacity-50" />
                </div>
                <p className="text-sm font-semibold text-green-600 mb-1">Total Logs</p>
                <p className="text-3xl font-bold text-green-700">{statistics.total_count || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-5 h-5 text-indigo-700" />
            <h2 className="text-lg font-bold text-gray-900">Filters & Search</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Logs
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                placeholder="Search message content..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Log Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Log Level
              </label>
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value, page: 1 }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">All Levels</option>
                {logLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
              <p className="ml-4 text-gray-600 font-medium">Loading logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-indigo-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Metadata
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log, index) => {
                    const levelInfo = getLogLevelInfo(log.level);
                    const IconComponent = levelInfo.icon;
                    
                    return (
                      <tr key={log.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${levelInfo.color}`}>
                            <IconComponent className="w-3 h-3" />
                            {levelInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                          <div className="truncate" title={log.message}>
                            {log.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.meta && (
                            <div className="space-y-1">
                              {log.meta.userId && <div>User: {log.meta.userId}</div>}
                              {log.meta.ip && <div>IP: {log.meta.ip}</div>}
                              {log.meta.userAgent && <div className="truncate max-w-xs" title={log.meta.userAgent}>UA: {log.meta.userAgent}</div>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No logs found</h3>
              <p className="text-gray-600">No logs match your current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsManagement;