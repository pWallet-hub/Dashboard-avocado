import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Server,
  Database,
  Wifi,
  Code,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import EndpointVerifier from '../../utils/endpointVerifier';

const ApiStatus = () => {
  const [verificationReport, setVerificationReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const endpointVerifier = new EndpointVerifier();

  useEffect(() => {
    runVerification();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const runVerification = async () => {
    setLoading(true);
    try {
      const report = await endpointVerifier.verifyAllServices();
      setVerificationReport(report);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      setAutoRefresh(false);
    } else {
      const interval = setInterval(runVerification, 30000); // 30 seconds
      setRefreshInterval(interval);
      setAutoRefresh(true);
    }
  };

  const exportReport = () => {
    if (verificationReport) {
      endpointVerifier.exportReport(verificationReport);
    }
  };

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'FULLY_WORKING': return 'text-green-600 bg-green-100 border-green-200';
      case 'FRONTEND_READY': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'MIXED_BACKEND': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'INCOMPLETE': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getServiceStatusIcon = (status) => {
    switch (status) {
      case 'FULLY_WORKING': return CheckCircle;
      case 'FRONTEND_READY': return Clock;
      case 'MIXED_BACKEND': return AlertTriangle;
      case 'INCOMPLETE': return XCircle;
      default: return Server;
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'FULLY_WORKING': return 'All functions implemented and API working';
      case 'FRONTEND_READY': return 'Frontend ready, waiting for backend';
      case 'MIXED_BACKEND': return 'Some endpoints working, some missing';
      case 'INCOMPLETE': return 'Frontend implementation incomplete';
      default: return 'Status unknown';
    }
  };

  if (loading && !verificationReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying API Status</h2>
          <p className="text-gray-600">Checking all services and endpoints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">API Integration Status</h1>
                  <p className="text-blue-100 mt-1">Real-time monitoring of all API endpoints and services</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 border ${
                    autoRefresh 
                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                      : 'bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30'
                  }`}
                >
                  {autoRefresh ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {autoRefresh ? 'Stop Auto-Refresh' : 'Auto-Refresh'}
                </button>
                <button
                  onClick={runVerification}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {verificationReport && (
                  <button
                    onClick={exportReport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Export
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          {verificationReport && (
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <BarChart3 className="w-5 h-5 text-green-600 opacity-50" />
                  </div>
                  <p className="text-sm font-semibold text-green-600 mb-1">Frontend Complete</p>
                  <p className="text-3xl font-bold text-green-700">{verificationReport.summary.implementedFunctions}</p>
                  <p className="text-xs text-green-600">
                    {((verificationReport.summary.implementedFunctions / verificationReport.summary.totalFunctions) * 100).toFixed(1)}% of functions
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-white" />
                    </div>
                    <BarChart3 className="w-5 h-5 text-blue-600 opacity-50" />
                  </div>
                  <p className="text-sm font-semibold text-blue-600 mb-1">API Working</p>
                  <p className="text-3xl font-bold text-blue-700">{verificationReport.summary.apiSuccesses}</p>
                  <p className="text-xs text-blue-600">Endpoints responding</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <BarChart3 className="w-5 h-5 text-yellow-600 opacity-50" />
                  </div>
                  <p className="text-sm font-semibold text-yellow-600 mb-1">Backend Missing</p>
                  <p className="text-3xl font-bold text-yellow-700">{verificationReport.summary.backendMissing}</p>
                  <p className="text-xs text-yellow-600">Endpoints needed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <BarChart3 className="w-5 h-5 text-purple-600 opacity-50" />
                  </div>
                  <p className="text-sm font-semibold text-purple-600 mb-1">Total Services</p>
                  <p className="text-3xl font-bold text-purple-700">{verificationReport.summary.totalServices}</p>
                  <p className="text-xs text-purple-600">Service modules</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Status Grid */}
        {verificationReport && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Services Status</h2>
              <p className="text-gray-600">Click on a service to view detailed information</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(verificationReport.serviceBreakdown).map(([serviceName, breakdown]) => {
                  const StatusIcon = getServiceStatusIcon(breakdown.status);
                  const statusColor = getServiceStatusColor(breakdown.status);
                  
                  return (
                    <div
                      key={serviceName}
                      onClick={() => setSelectedService(serviceName)}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${statusColor}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="w-6 h-6" />
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{serviceName}</h3>
                            <p className="text-xs opacity-75">{getStatusDescription(breakdown.status)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Functions:</span>
                          <span className="font-semibold">{breakdown.implemented}/{breakdown.totalFunctions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>API Working:</span>
                          <span className="font-semibold">{breakdown.apiWorking}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Backend Missing:</span>
                          <span className="font-semibold">{breakdown.backendMissing}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="w-full bg-white/50 rounded-full h-2">
                          <div 
                            className="bg-current h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(breakdown.implemented / breakdown.totalFunctions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Service View */}
        {selectedService && verificationReport && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedService} Details</h2>
                  <p className="text-gray-600">Function-level status and API integration details</p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Function
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Frontend Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        API Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {verificationReport.results
                      .filter(result => result.service === selectedService)
                      .reduce((acc, result) => {
                        const existing = acc.find(item => item.function === result.function);
                        if (existing) {
                          if (result.type === 'api') {
                            existing.apiStatus = result.status;
                            existing.apiMessage = result.message;
                          }
                        } else {
                          acc.push({
                            function: result.function,
                            frontendStatus: result.type === 'frontend' ? result.status : 'UNKNOWN',
                            frontendMessage: result.type === 'frontend' ? result.message : '',
                            apiStatus: result.type === 'api' ? result.status : 'NOT_TESTED',
                            apiMessage: result.type === 'api' ? result.message : ''
                          });
                        }
                        return acc;
                      }, [])
                      .map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-gray-900">
                            {item.function}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              item.frontendStatus === 'IMPLEMENTED' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                            }`}>
                              {item.frontendStatus === 'IMPLEMENTED' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {item.frontendStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              item.apiStatus === 'API_SUCCESS' ? 'text-green-600 bg-green-100' :
                              item.apiStatus === 'BACKEND_MISSING' ? 'text-yellow-600 bg-yellow-100' :
                              item.apiStatus === 'API_ERROR' ? 'text-red-600 bg-red-100' :
                              'text-gray-600 bg-gray-100'
                            }`}>
                              {item.apiStatus === 'API_SUCCESS' && <CheckCircle className="w-3 h-3" />}
                              {item.apiStatus === 'BACKEND_MISSING' && <Clock className="w-3 h-3" />}
                              {item.apiStatus === 'API_ERROR' && <XCircle className="w-3 h-3" />}
                              {item.apiStatus === 'NOT_TESTED' && <AlertTriangle className="w-3 h-3" />}
                              {item.apiStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                            <div className="space-y-1">
                              {item.frontendMessage && (
                                <div className="text-xs text-gray-500">Frontend: {item.frontendMessage}</div>
                              )}
                              {item.apiMessage && (
                                <div className="text-xs text-gray-500">API: {item.apiMessage}</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {verificationReport && (
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date(verificationReport.timestamp).toLocaleString()}
            {autoRefresh && <span className="ml-2">(Auto-refreshing every 30 seconds)</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiStatus;