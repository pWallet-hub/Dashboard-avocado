import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Filter, MoreVertical, Eye, CheckCircle, XCircle, 
  Clock, Play, CheckCheck, AlertCircle, ChevronDown, Bell, User, 
  Package, Trees, Bug, Home, Calendar, MapPin, Phone, Mail, Info
} from 'lucide-react';
import {
  getPestManagementRequests, 
  getHarvestRequests,
  getPropertyEvaluationRequests,
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
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [propertyResponse, harvestResponse, pestResponse] = await Promise.allSettled([
        getPropertyEvaluationRequests(),
        getHarvestRequests(),
        getPestManagementRequests()
      ]);

      if (propertyResponse.status === 'fulfilled') {
        const propData = propertyResponse.value;
        const requests = Array.isArray(propData) ? propData : propData?.data || [];
        setServiceRequests(requests);
      } else {
        setServiceRequests([]);
      }

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
      } else {
        setHarvestRequests([]);
      }

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
      } else {
        setPestManagementRequests([]);
      }

    } catch (err) {
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
        await approveHarvestRequest(requestId, { approved_by: 'admin', approval_notes: 'Approved by administrator' });
      } else if (type === 'pest') {
        await approvePestManagementRequest(requestId, { approved_by: 'admin', approval_notes: 'Approved by administrator' });
      } else {
        await approvePropertyEvaluationRequest(requestId, { approved_by: 'admin', approval_notes: 'Approved by administrator' });
      }
      await fetchAllRequests();
      setShowModal(false);
      setShowActionsMenu(null);
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
      setShowModal(false);
      setShowActionsMenu(null);
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
        await startHarvestRequest(requestId, { started_by: 'admin', start_notes: 'Started by administrator' });
      } else if (type === 'pest') {
        await startPestManagementTreatment(requestId, { started_by: 'admin', start_notes: 'Treatment started by administrator' });
      } else {
        await startPropertyEvaluation(requestId, { started_by: 'admin', start_notes: 'Started by administrator' });
      }
      await fetchAllRequests();
      setShowModal(false);
      setShowActionsMenu(null);
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
        await completeHarvestRequest(requestId, { completed_by: 'admin', completion_notes: 'Completed by administrator' });
      } else if (type === 'pest') {
        await completePestManagementTreatment(requestId, { 
          completed_by: 'admin', 
          completion_notes: 'Treatment completed by administrator',
          treatment_effectiveness: 'effective'
        });
      } else {
        await completePropertyEvaluation(requestId, { completed_by: 'admin', completion_notes: 'Completed by administrator' });
      }
      await fetchAllRequests();
      setShowModal(false);
      setShowActionsMenu(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'approved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border border-green-200';
      case 'rejected': return 'bg-rose-50 text-rose-700 border border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'harvest': return <Trees className="w-4 h-4" />;
      case 'pest': return <Bug className="w-4 h-4" />;
      case 'property': return <Home className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const allRequests = [
    ...serviceRequests.map(req => ({ ...req, type: 'property' })),
    ...harvestRequests.map(req => ({ ...req, type: 'harvest' })),
    ...pestManagementRequests.map(req => ({ ...req, type: 'pest' }))
  ];

  let filteredRequests = allRequests.filter(request => {
    if (activeTab !== 'all' && request.type !== activeTab) return false;
    if (statusFilter !== 'All' && request.status !== statusFilter.toLowerCase()) return false;
    
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

  // Sorting
  if (sortConfig.key) {
    filteredRequests.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'farmer') {
        aVal = a.farmer_id?.full_name || '';
        bVal = b.farmer_id?.full_name || '';
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const renderActionButtons = (request, type) => {
    const requestId = request.id || request._id;
    const isLoading = actionLoading[requestId];
    const status = request.status || 'pending';

    return (
      <div className="flex gap-1">
        {status === 'pending' && (
          <>
            <button
              onClick={() => handleApproveRequest(request, type)}
              disabled={isLoading}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
              title="Approve"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleRejectRequest(request, type)}
              disabled={isLoading}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
              title="Reject"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            </button>
          </>
        )}
        {status === 'approved' && (
          <button
            onClick={() => handleStartRequest(request, type)}
            disabled={isLoading}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
            title="Start"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          </button>
        )}
        {status === 'in_progress' && (
          <button
            onClick={() => handleCompleteRequest(request, type)}
            disabled={isLoading}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
            title="Complete"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
          </button>
        )}
      </div>
    );
  };

  const RequestModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Request Details</h2>
              <p className="text-sm text-slate-500 mt-1">ID: {request.id || request._id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" /> Request Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Type</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    {getTypeIcon(request.type)}
                    {request.type === 'harvest' ? 'Harvest' : request.type === 'pest' ? 'Pest Control' : 'Property Evaluation'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Priority</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority || 'medium'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Farmer Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Name</span>
                  <span className="text-sm font-medium text-slate-900">{request.farmer_id?.full_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Phone</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {request.farmer_id?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Email</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {request.farmer_id?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Location</span>
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {formatLocation(request.location)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Type-specific Details */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.type === 'harvest' && (
                <>
                  <div><span className="text-sm text-slate-500">Trees to Harvest:</span> <strong>{request.harvest_details?.trees_to_harvest || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Workers Needed:</span> <strong>{request.harvest_details?.workers_needed || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Equipment:</span> <strong>{request.harvest_details?.equipment_needed || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Start Date:</span> <strong>{formatDate(request.harvest_details?.harvest_date_from)}</strong></div>
                  <div><span className="text-sm text-slate-500">End Date:</span> <strong>{formatDate(request.harvest_details?.harvest_date_to)}</strong></div>
                </>
              )}
              {request.type === 'pest' && (
                <>
                  <div><span className="text-sm text-slate-500">Pest Type:</span> <strong>{request.pest_type || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Severity:</span> <strong>{request.severity_level || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Affected Area:</span> <strong>{request.affected_area || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Preferred Date:</span> <strong>{formatDate(request.preferred_treatment_date)}</strong></div>
                  <div className="md:col-span-2"><span className="text-sm text-slate-500">Description:</span> <p className="mt-1">{request.description || 'No description'}</p></div>
                </>
              )}
              {request.type === 'property' && (
                <>
                  <div><span className="text-sm text-slate-500">Purpose:</span> <strong>{request.evaluation_purpose || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Farm Size:</span> <strong>{request.farmSize || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Irrigation:</span> <strong>{request.irrigationSource || 'N/A'}</strong></div>
                  <div><span className="text-sm text-slate-500">Visit Start:</span> <strong>{formatDate(request.visitStartDate)}</strong></div>
                  <div><span className="text-sm text-slate-500">Visit End:</span> <strong>{formatDate(request.visitEndDate)}</strong></div>
                </>
              )}
            </div>
          </div>

          {(request.notes || request.special_instructions) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-1">Additional Notes</h4>
              <p className="text-sm text-amber-800">{request.notes || request.special_instructions}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Close
          </button>
          {renderActionButtons(request, request.type)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
    

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{allRequests.length}</p>
              </div>
              <Package className="w-8 h-8 text-slate-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Property</p>
                <p className="text-2xl font-bold text-slate-900">{serviceRequests.length}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Harvest</p>
                <p className="text-2xl font-bold text-slate-900">{harvestRequests.length}</p>
              </div>
              <Trees className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pest Control</p>
                <p className="text-2xl font-bold text-slate-900">{pestManagementRequests.length}</p>
              </div>
              <Bug className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-amber-600">
                  {allRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 mb-4 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by farmer, location, pest type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={activeTab}
                onChange={(e) => { setActiveTab(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="property">Property</option>
                <option value="harvest">Harvest</option>
                <option value="pest">Pest</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>pending</option>
                <option>approved</option>
                <option>in_progress</option>
                <option>completed</option>
                <option>rejected</option>
              </select>
              <button 
                onClick={fetchAllRequests}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading requests...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('farmer')}>
                        Farmer {sortConfig.key === 'farmer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRequests.length > 0 ? (
                      paginatedRequests.map((request) => (
                        <tr key={request.id || request._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedRequest(request); setShowModal(true); }}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(request.type)}
                              <span className="text-sm font-medium capitalize">{request.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{request.farmer_id?.full_name || 'Unknown'}</div>
                              <div className="text-xs text-slate-500">{request.farmer_id?.phone || 'No phone'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{formatLocation(request.location)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {request.type === 'harvest' && `Trees: ${request.harvest_details?.trees_to_harvest || 'N/A'}`}
                            {request.type === 'pest' && `Pest: ${request.pest_type || 'N/A'}`}
                            {request.type === 'property' && `Purpose: ${request.evaluation_purpose || 'N/A'}`}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                              {request.priority || 'medium'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {request.type === 'harvest' ? `${formatDate(request.harvest_details?.harvest_date_from)} → ${formatDate(request.harvest_details?.harvest_date_to)}` :
                             request.type === 'pest' ? formatDate(request.preferred_treatment_date) :
                             `${formatDate(request.visitStartDate)} → ${formatDate(request.visitEndDate)}`}
                          </td>
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            {renderActionButtons(request, request.type)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center">
                            <Package className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No requests found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRequests.length > 0 && (
                <div className="bg-white border-t border-slate-200 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} results
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-sm">‹</button>
                      {getPageNumbers().map(num => (
                        <button key={num} onClick={() => setCurrentPage(num)} className={`px-3 py-1 border rounded text-sm ${currentPage === num ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}>
                          {num}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-sm">›</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRequest && (
        <RequestModal request={selectedRequest} onClose={() => { setShowModal(false); setSelectedRequest(null); }} />
      )}
    </div>
  );
};

export default AdminServiceRequestsDashboard;