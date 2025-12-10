import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Users, AlertTriangle, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { getSystemUsage, getSystemActivity } from '../../services/monitoringService';
import { getSystemLogs } from '../../services/logsService';

const SystemMonitoring = () => {
  const [usage, setUsage] = useState({});
  const [activity, setActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [logLevel, setLogLevel] = useState('all');

  useEffect(() => {
    loadMonitoringData();
  }, [selectedPeriod]);

  const loadMonitoringData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [usageData, activityData, logsData] = await Promise.allSettled([
        getSystemUsage(selectedPeriod),
        getSystemActivity({ limit: 50 }),
        getSystemLogs({ level: logLevel === 'all' ? undefined : logLevel, limit: 100 })
      ]);

      if (usageData.status === 'fulfilled') {
        setUsage(usageData.value || {});
      }
      
      if (activityData.status === 'fulfilled') {
        setActivity(Array.isArray(activityData.value) ? activityData.value : []);
      }
      
      if (logsData.status === 'fulfilled') {
        setLogs(Array.isArray(logsData.value) ? logsData.value : []);
      }

      // Check if any requests failed
      const failedRequests = [usageData, activityData, logsData].filter(result => result.status === 'rejected');
      if (failedRequests.length > 0) {
        setError(`Some monitoring data could not be loaded. ${failedRequests.length} request(s) failed.`);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      setError('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading system monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Server className="h-7 w-7 mr-3 text-blue-600" />
              System Monitoring
            </h1>
            <p className="text-gray-600 mt-1">Monitor system performance, activity, and logs</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={loadMonitoringData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">{usage.cpu?.current || 0}%</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${usage.cpu?.current || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Avg: {usage.cpu?.average || 0}%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">{usage.memory?.percentage || 0}%</p>
            </div>
            <Database className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${usage.memory?.percentage || 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatBytes(usage.memory?.used)} / {formatBytes(usage.memory?.total)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{usage.activeUsers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {usage.userGrowth || 0}% vs last period
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{formatUptime(usage.uptime)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Since: {usage.startTime ? new Date(usage.startTime).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600">Latest system activities and user actions</p>
          </div>
          <div className="p-6">
            {activity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity found</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activity.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.action || 'Unknown action'}</p>
                      <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
                <p className="text-sm text-gray-600">Application logs and error messages</p>
              </div>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No logs found for selected level</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className={`p-3 rounded-lg text-sm ${getLogLevelColor(log.level)}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-medium uppercase text-xs">{log.level || 'INFO'}</span>
                      <span className="text-xs opacity-75">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}
                      </span>
                    </div>
                    <p className="mt-1">{log.message || 'No message'}</p>
                    {log.details && (
                      <pre className="mt-2 text-xs opacity-75 whitespace-pre-wrap">{log.details}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{usage.requests?.total || 0}</p>
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-xs text-gray-500 mt-1">
              Avg: {usage.requests?.average || 0}/min
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{usage.responseTime?.average || 0}ms</p>
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-xs text-gray-500 mt-1">
              Max: {usage.responseTime?.max || 0}ms
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{usage.errors?.count || 0}</p>
            <p className="text-sm text-gray-600">Error Count</p>
            <p className="text-xs text-gray-500 mt-1">
              Rate: {usage.errors?.rate || 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoring;