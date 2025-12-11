import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Server,
  Database,
  Wifi,
  WifiOff,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import ApiTester from '../../utils/apiTester';

const ApiTesting = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  const apiTester = new ApiTester();

  const testCategories = [
    { id: 'all', name: 'All Endpoints', icon: Server, color: 'indigo' },
    { id: 'auth', name: 'Authentication', icon: CheckCircle, color: 'green' },
    { id: 'users', name: 'User Management', icon: Settings, color: 'blue' },
    { id: 'products', name: 'Products', icon: Database, color: 'purple' },
    { id: 'orders', name: 'Orders', icon: FileText, color: 'orange' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'pink' },
    { id: 'monitoring', name: 'Monitoring', icon: Wifi, color: 'teal' }
  ];

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      const results = await apiTester.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Testing failed:', error);
      setTestResults({
        total: 0,
        passed: 0,
        failed: 1,
        results: [{
          endpoint: 'Test Runner',
          method: 'SYSTEM',
          status: 'FAIL',
          message: error.message,
          timestamp: new Date().toISOString()
        }]
      });
    } finally {
      setTesting(false);
    }
  };

  const runCategoryTests = async (category) => {
    setTesting(true);
    setTestResults(null);

    try {
      let results;
      switch (category) {
        case 'auth':
          await apiTester.testAuthEndpoints();
          break;
        case 'users':
          await apiTester.testUserEndpoints();
          break;
        case 'products':
          await apiTester.testProductsEndpoints();
          break;
        case 'orders':
          await apiTester.testOrdersEndpoints();
          break;
        case 'analytics':
          await apiTester.testAnalyticsEndpoints();
          break;
        case 'monitoring':
          await apiTester.testMonitoringEndpoints();
          break;
        default:
          results = await apiTester.runAllTests();
      }
      
      if (category !== 'all') {
        results = apiTester.generateReport();
      }
      
      setTestResults(results);
    } catch (error) {
      console.error('Category testing failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const exportResults = () => {
    if (!testResults) return;

    const csvContent = [
      ['Endpoint', 'Method', 'Status', 'Message', 'Timestamp'],
      ...testResults.results.map(result => [
        result.endpoint,
        result.method,
        result.status,
        result.message,
        result.timestamp
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return Wifi;
      case 'error': return AlertTriangle;
      case 'disconnected': return WifiOff;
      default: return Clock;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS': return CheckCircle;
      case 'FAIL': return XCircle;
      case 'EXPECTED_FAIL': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return 'text-green-600 bg-green-100';
      case 'FAIL': return 'text-red-600 bg-red-100';
      case 'EXPECTED_FAIL': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const ConnectionStatusIcon = getConnectionStatusIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">API Testing Dashboard</h1>
                  <p className="text-indigo-100 mt-1">Comprehensive endpoint testing and monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${getConnectionStatusColor()}`}>
                  <ConnectionStatusIcon className="w-5 h-5" />
                  <span className="capitalize">{connectionStatus}</span>
                </div>
                <button
                  onClick={checkConnectionStatus}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <RefreshCw className="w-5 h-5" />
                  Check Status
                </button>
              </div>
            </div>
          </div>

          {/* Test Categories */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Test Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {testCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => runCategoryTests(category.id)}
                    disabled={testing}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 ${
                      selectedCategory === category.id
                        ? `border-${category.color}-500 bg-${category.color}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${category.color}-500 to-${category.color}-600 rounded-xl flex items-center justify-center mb-3`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                      <p className="text-sm text-gray-600">Test {category.name.toLowerCase()} endpoints</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Test Controls</h2>
              <p className="text-gray-600">Run comprehensive API endpoint testing</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={runTests}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run All Tests
                  </>
                )}
              </button>
              {testResults && (
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h2>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Total Tests</p>
                      <p className="text-2xl font-bold text-gray-900">{testResults.total}</p>
                    </div>
                    <Server className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600">Passed</p>
                      <p className="text-2xl font-bold text-green-700">{testResults.passed}</p>
                      <p className="text-xs text-green-600">
                        {testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-red-600">Failed</p>
                      <p className="text-2xl font-bold text-red-700">{testResults.failed}</p>
                      <p className="text-xs text-red-600">
                        {testResults.total > 0 ? ((testResults.failed / testResults.total) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {testResults.results.map((result, index) => {
                      const StatusIcon = getStatusIcon(result.status);
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(result.status)}`}>
                              <StatusIcon className="w-3 h-3" />
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-mono">
                              {result.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-900">
                            {result.endpoint}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                            <div className="truncate" title={result.message}>
                              {result.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Testing in Progress */}
        {testing && !testResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Running API Tests</h3>
              <p className="text-gray-600">Testing all endpoints and generating report...</p>
            </div>
          </div>
        )}

        {/* No Results Yet */}
        {!testing && !testResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <Server className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Test</h3>
              <p className="text-gray-600 mb-6">Click "Run All Tests" to start comprehensive API endpoint testing</p>
              <button
                onClick={runTests}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
              >
                <Play className="w-5 h-5" />
                Start Testing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTesting;