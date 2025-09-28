import React, { useState, useEffect } from 'react';
import { 
  listServiceRequests, 
  listHarvestRequests,
  listPestManagementRequests,
  approveHarvestRequest,
  rejectHarvestRequest,
  approvePropertyEvaluationRequest,
  rejectPropertyEvaluationRequest,
  approvePestManagementRequest,
  rejectPestManagementRequest,
  startHarvestRequest,
  completeHarvestRequest,
  startPropertyEvaluation,
  completePropertyEvaluation,
  startPestManagementTreatment,
  completePestManagementTreatment
} from '../../services/serviceRequestsService';

const AdminServiceRequestsDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [harvestRequests, setHarvestRequests] = useState([]);
  const [pestManagementRequests, setPestManagementRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching all service requests...');
      
      const [propertyResponse, harvestResponse, pestResponse] = await Promise.allSettled([
        listServiceRequests(),
        listHarvestRequests(),
        listPestManagementRequests()
      ]);

      // Handle property evaluation requests
      if (propertyResponse.status === 'fulfilled') {
        const propData = propertyResponse.value;
        const requests = Array.isArray(propData) ? propData : propData?.data || [];
        setServiceRequests(requests);
        console.log('✅ Property evaluation requests:', requests.length);
      } else {
        console.error('❌ Property evaluation failed:', propertyResponse.reason);
        setServiceRequests([]);
      }

      // Handle harvest requests
      if (harvestResponse.status === 'fulfilled') {
        const harvestData = harvestResponse.value;
        let requests = [];
        
        if (harvestData?.success && Array.isArray(harvestData.data)) {
          requests = harvestData.data;
        } else if (Array.isArray(harvestData?.data)) {
          requests = harvestData.data;
        } else if (Array.isArray(harvestData)) {
          requests = harvestData;
        }
        
        setHarvestRequests(requests);
        console.log('✅ Harvest requests:', requests.length);
      } else {
        console.error('❌ Harvest requests failed:', harvestResponse.reason);
        setHarvestRequests([]);
      }

      // Handle pest management requests
      if (pestResponse.status === 'fulfilled') {
        const pestData = pestResponse.value;
        let requests = [];
        
        if (pestData?.success && Array.isArray(pestData.data)) {
          requests = pestData.data;
        } else if (Array.isArray(pestData?.data)) {
          requests = pestData.data;
        } else if (Array.isArray(pestData)) {
          requests = pestData;
        }
        
        setPestManagementRequests(requests);
        console.log('✅ Pest management requests:', requests.length);
      } else {
        console.error('❌ Pest management requests failed:', pestResponse.reason);
        setPestManagementRequests([]);
      }

    } catch (err) {
      console.error('❌ Critical error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setRequestLoading = (requestId, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [requestId]: isLoading
    }));
  };

  const handleApproveRequest = async (request, type) => {
    const requestId = request.id || request._id;
    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await approveHarvestRequest(requestId, { 
          approved_by: 'admin',
          approval_notes: 'Approved by administrator'
        });
      } else if (type === 'pest') {
        await approvePestManagementRequest(requestId, { 
          approved_by: 'admin',
          approval_notes: 'Approved by administrator'
        });
      } else {
        await approvePropertyEvaluationRequest(requestId, { 
          approved_by: 'admin',
          approval_notes: 'Approved by administrator'
        });
      }
      await fetchAllRequests();
    } catch (err) {
      alert(`Failed to approve request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const handleRejectRequest = async (request, type) => {
    const requestId = request.id || request._id;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await rejectHarvestRequest(requestId, { rejection_reason: reason });
      } else if (type === 'pest') {
        await rejectPestManagementRequest(requestId, { rejection_reason: reason });
      } else {
        await rejectPropertyEvaluationRequest(requestId, { rejection_reason: reason });
      }
      await fetchAllRequests();
    } catch (err) {
      alert(`Failed to reject request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const handleStartRequest = async (request, type) => {
    const requestId = request.id || request._id;
    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await startHarvestRequest(requestId, { 
          started_by: 'admin',
          start_notes: 'Started by administrator'
        });
      } else if (type === 'pest') {
        await startPestManagementTreatment(requestId, { 
          started_by: 'admin',
          start_notes: 'Treatment started by administrator'
        });
      } else {
        await startPropertyEvaluation(requestId, { 
          started_by: 'admin',
          start_notes: 'Started by administrator'
        });
      }
      await fetchAllRequests();
    } catch (err) {
      alert(`Failed to start request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const handleCompleteRequest = async (request, type) => {
    const requestId = request.id || request._id;
    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await completeHarvestRequest(requestId, { 
          completed_by: 'admin',
          completion_notes: 'Completed by administrator'
        });
      } else if (type === 'pest') {
        await completePestManagementTreatment(requestId, { 
          completed_by: 'admin',
          completion_notes: 'Treatment completed by administrator',
          treatment_effectiveness: 'effective'
        });
      } else {
        await completePropertyEvaluation(requestId, { 
          completed_by: 'admin',
          completion_notes: 'Completed by administrator'
        });
      }
      await fetchAllRequests();
    } catch (err) {
      alert(`Failed to complete request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    
    const parts = [
      location.village,
      location.cell,
      location.sector,
      location.district,
      location.province
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-purple-100 text-purple-800 border-purple-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || statusClasses.pending}`}>
        {(status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      'low': 'bg-green-100 text-green-800 border-green-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'urgent': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityClasses[priority] || priorityClasses.medium}`}>
        {(priority || 'medium').charAt(0).toUpperCase() + (priority || 'medium').slice(1)}
      </span>
    );
  };

  const renderActionButtons = (request, type) => {
    const requestId = request.id || request._id;
    const isLoading = actionLoading[requestId];
    const status = request.status || 'pending';

    return (
      <div className="flex gap-1 flex-wrap">
        {status === 'pending' && (
          <>
            <button
              onClick={() => handleApproveRequest(request, type)}
              disabled={isLoading}
              className="px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳' : '✓ Approve'}
            </button>
            <button
              onClick={() => handleRejectRequest(request, type)}
              disabled={isLoading}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳' : '✗ Reject'}
            </button>
          </>
        )}
        {status === 'approved' && (
          <button
            onClick={() => handleStartRequest(request, type)}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '⏳' : '▶ Start'}
          </button>
        )}
        {status === 'in_progress' && (
          <button
            onClick={() => handleCompleteRequest(request, type)}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-500 text-white rounded-md text-xs hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '⏳' : '✓ Complete'}
          </button>
        )}
        {['completed', 'rejected', 'cancelled'].includes(status) && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
            No actions
          </span>
        )}
      </div>
    );
  };

  // Filter and search logic
  const allRequests = [
    ...serviceRequests.map(req => ({ ...req, type: 'property' })),
    ...harvestRequests.map(req => ({ ...req, type: 'harvest' })),
    ...pestManagementRequests.map(req => ({ ...req, type: 'pest' }))
  ];

  const filteredRequests = allRequests.filter(request => {
    // Tab filter
    if (activeTab === 'harvest' && request.type !== 'harvest') return false;
    if (activeTab === 'property' && request.type !== 'property') return false;
    if (activeTab === 'pest' && request.type !== 'pest') return false;
    
    // Status filter
    if (statusFilter && request.status !== statusFilter) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const farmerName = (request.farmer_id?.full_name || '').toLowerCase();
      const requestNumber = (request.request_number || request.id || '').toString().toLowerCase();
      const location = formatLocation(request.location).toLowerCase();
      const pestType = (request.pest_type || '').toLowerCase();
      
      return farmerName.includes(searchLower) || 
             requestNumber.includes(searchLower) || 
             location.includes(searchLower) ||
             pestType.includes(searchLower);
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
        <div className="flex items-center">
          <div className="text-red-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={fetchAllRequests}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Requests Management</h1>
          <p className="text-gray-600">Manage harvest requests, property evaluations, and pest management</p>
        </div>
        <button
          onClick={fetchAllRequests}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 font-medium transition-colors shadow-sm"
        >
          {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Requests</h3>
              <p className="text-3xl font-bold">{allRequests.length}</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Property Evaluations</h3>
              <p className="text-3xl font-bold">{serviceRequests.length}</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Harvest Requests</h3>
              <p className="text-3xl font-bold">{harvestRequests.length}</p>
            </div>
            <div className="text-orange-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 12a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 7a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pest Management</h3>
              <p className="text-3xl font-bold">{pestManagementRequests.length}</p>
            </div>
            <div className="text-green-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pending</h3>
              <p className="text-3xl font-bold">
                {allRequests.filter(req => req.status === 'pending').length}
              </p>
            </div>
            <div className="text-yellow-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Requests', count: allRequests.length },
              { key: 'property', label: 'Property Evaluations', count: serviceRequests.length },
              { key: 'harvest', label: 'Harvest Requests', count: harvestRequests.length },
              { key: 'pest', label: 'Pest Management', count: pestManagementRequests.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.key 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by farmer name, request ID, location, or pest type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
                      <p className="text-sm text-gray-500">
                        {searchTerm || statusFilter 
                          ? 'Try adjusting your search or filter criteria' 
                          : `No ${activeTab === 'all' ? '' : activeTab} requests are available at the moment.`
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr key={request.id || request._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          #{request.request_number || request.id || 'N/A'}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          request.type === 'harvest' 
                            ? 'bg-orange-100 text-orange-800' 
                            : request.type === 'pest'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {request.type === 'harvest' ? '🌾 Harvest' : 
                           request.type === 'pest' ? '🐛 Pest Control' : 
                           '🏡 Property Eval'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {request.farmer_id?.full_name || 'Unknown Farmer'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.farmer_id?.phone || request.farmer_id?.email || 'No contact'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 max-w-xs">
                        {formatLocation(request.location)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        {request.type === 'harvest' ? (
                          <div className="space-y-1">
                            <div>🌳 Trees: {request.harvest_details?.trees_to_harvest || 'N/A'}</div>
                            <div>👥 Workers: {request.harvest_details?.workers_needed || 'N/A'}</div>
                            <div>⚡ Equipment: {request.harvest_details?.equipment_needed || 'N/A'}</div>
                          </div>
                        ) : request.type === 'pest' ? (
                          <div className="space-y-1">
                            <div>🐛 Pest Type: {request.pest_type || 'N/A'}</div>
                            <div>📏 Affected Area: {request.affected_area || 'N/A'}</div>
                            <div>⚠️ Severity: {request.severity_level || 'N/A'}</div>
                            <div>💊 Treatment: {request.treatment_method || request.preferred_treatment || 'N/A'}</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div>🎯 Purpose: {request.evaluation_purpose || request.evaluationPurpose || 'N/A'}</div>
                            <div>💧 Irrigation: {request.irrigationSource || 'N/A'}</div>
                            <div>📏 Farm Size: {request.farmSize || 'N/A'}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {request.type === 'harvest' ? (
                          <div className="space-y-1">
                            <div>📅 From: {formatDate(request.harvest_details?.harvest_date_from)}</div>
                            <div>📅 To: {formatDate(request.harvest_details?.harvest_date_to)}</div>
                          </div>
                        ) : request.type === 'pest' ? (
                          <div className="space-y-1">
                            <div>📅 Requested: {formatDate(request.created_at || request.createdAt)}</div>
                            <div>🕐 Preferred: {formatDate(request.preferred_treatment_date)}</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div>📅 From: {formatDate(request.visitStartDate)}</div>
                            <div>📅 To: {formatDate(request.visitEndDate)}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderActionButtons(request, request.type)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
      {filteredRequests.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 text-center">
            Showing {filteredRequests.length} of {allRequests.length} total requests
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter && ` with status "${statusFilter}"`}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceRequestsDashboard;