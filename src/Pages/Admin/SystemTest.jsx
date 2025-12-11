import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Database,
  Code,
  Settings
} from 'lucide-react';
import ProjectHealthCheck from '../../utils/projectHealthCheck';
import ApiTester from '../../utils/apiTester';
import EndpointVerifier from '../../utils/endpointVerifier';
import ComprehensiveApiTest from '../../utils/comprehensiveApiTest';

const SystemTest = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [selectedTest, setSelectedTest] = useState('health');

  const testOptions = [
    { 
      id: 'health', 
      name: 'Project Health Check', 
      description: 'Check all services, components, and configurations',
      icon: CheckCircle,
      color: 'green'
    },
    { 
      id: 'api', 
      name: 'API Testing', 
      description: 'Test all API endpoints for functionality',
      icon: Server,
      color: 'blue'
    },
    { 
      id: 'verification', 
      name: 'Endpoint Verification', 
      description: 'Verify frontend-backend integration',
      icon: Database,
      color: 'purple'
    },
    { 
      id: 'comprehensive', 
      name: 'Comprehensive Test', 
      description: 'Full system integration testing',
      icon: Code,
      color: 'orange'
    }
  ];

  const runTest = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      let results;
      
      switch (selectedTest) {
        case 'health':
          const healthChecker = new ProjectHealthCheck();
          results = await healthChecker.runAllChecks();
          break;
          
        case 'api':
          const apiTester = new ApiTester();
          results = await apiTester.runAllTests();
          break;
          
        case 'verification':
          const verifier = new EndpointVerifier();
          results = await verifier.verifyAllServices();
          break;
          
        case 'comprehensive':
          const comprehensiveTester = new ComprehensiveApiTest();
          results = await comprehensiveTester.runAllTests();
          break;
          
        default:
          throw new Error('Unknown test type');
      }
      
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
      case 'IMPLEMENTED':
      case 'API_SUCCESS':
        return 'text-green-600 bg-green-100';
      case 'FAIL':
      case 'MISSING':
      case 'API_ERROR':
        return 'text-red-600 bg-red-100';
      case 'EXPECTED_FAIL':
      case 'BACKEND_MISSING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedTestOption = testOptions.find(t => t.id === selectedTest);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">System Testing Dashboard</h1>
                <p className="text-indigo-100 mt-1">Comprehensive project health and API testing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Select Test Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedTest === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedTest(option.id)}
                  disabled={testing}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${option.color}-500 to-${option.color}-600 rounded-xl flex items-center justify-center mb-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Run {selectedTestOption?.name}
              </h2>
              <p className="text-gray-600">{selectedTestOption?.description}</p>
            </div>
            <button
              onClick={runTest}
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
                  Run Test
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Results</h2>
              <p className="text-gray-600">
                Completed at: {new Date(testResults.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="p-8">
              {testResults.error ? (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-red-600 mb-2">Test Failed</h3>
                  <p className="text-gray-600">{testResults.message}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  {testResults.summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-blue-600">Total</p>
                            <p className="text-2xl font-bold text-blue-700">
                              {testResults.summary.totalTests || testResults.summary.totalChecks || testResults.summary.totalServices || 0}
                            </p>
                          </div>
                          <Server className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-green-600">Success</p>
                            <p className="text-2xl font-bold text-green-700">
                              {testResults.summary.passed || testResults.summary.successes || testResults.summary.implementedFunctions || 0}
                            </p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                      </div>

                      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-red-600">Failed</p>
                            <p className="text-2xl font-bold text-red-700">
                              {testResults.summary.failed || testResults.summary.issues || testResults.summary.apiErrors || 0}
                            </p>
                          </div>
                          <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-yellow-600">Warnings</p>
                            <p className="text-2xl font-bold text-yellow-700">
                              {testResults.summary.warnings || testResults.summary.backendMissing || 0}
                            </p>
                          </div>
                          <AlertTriangle className="w-8 h-8 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Health Score */}
                  {testResults.summary?.healthScore !== undefined && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Health Score</h3>
                        <div className="text-4xl font-bold text-indigo-600 mb-2">
                          {testResults.summary.healthScore.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${testResults.summary.healthScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Results Table */}
                  {testResults.results && testResults.results.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {testResults.results.slice(0, 20).map((result, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(result.status)}`}>
                                  {result.status === 'PASS' || result.status === 'IMPLEMENTED' || result.status === 'API_SUCCESS' ? 
                                    <CheckCircle className="w-3 h-3" /> : 
                                    result.status === 'FAIL' || result.status === 'MISSING' || result.status === 'API_ERROR' ?
                                    <XCircle className="w-3 h-3" /> :
                                    <AlertTriangle className="w-3 h-3" />
                                  }
                                  {result.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {result.category || result.service || result.endpoint}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {result.function || result.method || result.type || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                                <div className="truncate" title={result.message}>
                                  {result.message}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {testResults.results.length > 20 && (
                        <div className="p-4 text-center text-gray-500">
                          Showing first 20 of {testResults.results.length} results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Testing in Progress */}
        {testing && !testResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Running {selectedTestOption?.name}</h3>
              <p className="text-gray-600">Please wait while we test your system...</p>
            </div>
          </div>
        )}

        {/* No Results Yet */}
        {!testing && !testResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <Settings className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Test</h3>
              <p className="text-gray-600 mb-6">Select a test type and click "Run Test" to start system verification</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemTest;