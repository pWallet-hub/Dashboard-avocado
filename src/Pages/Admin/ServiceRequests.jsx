import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Eye, Filter, Search, Calendar, 
  User, MapPin, Phone, Mail, Database, CalendarClock, RefreshCw,
  BarChart3, Hourglass, PartyPopper, CheckSquare, MoreVertical,
  AlertCircle, FileText, ChevronRight, X
} from 'lucide-react';
import { 
  listServiceRequests, 
  listHarvestRequests,
  approveHarvestRequest,
  rejectHarvestRequest,
  startHarvestRequest,
  completeHarvestRequest,
  updateServiceRequestStatus as updateServiceRequestStatusAPI,
  getPropertyEvaluationRequests,
  approvePropertyEvaluationRequest,
  rejectPropertyEvaluationRequest,
  rescheduleEvaluationVisit
} from '../../services/serviceRequestsService';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadServiceRequests();
  }, []);

  const loadServiceRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [regularRequests, harvestRequests, propertyEvaluationRequests] = await Promise.all([
        listServiceRequests().catch((err) => {
          console.error('Error fetching regular requests:', err);
          return [];
        }),
        listHarvestRequests().catch((err) => {
          console.error('Error fetching harvest requests:', err);
          return { data: [] };
        }),
        getPropertyEvaluationRequests().catch((err) => {
          console.error('Error fetching property evaluation requests:', err);
          return [];
        })
      ]);

      const allRequests = [
        ...(Array.isArray(regularRequests) ? regularRequests : regularRequests?.data || []).map(req => ({
          ...req,
          service_type: req.service_type || req.type || 'unknown',
          farmerName: req.farmer_id?.full_name || req.farmerName || 'Unknown',
          farmerPhone: req.farmer_id?.phone || req.farmerPhone || 'N/A',
          farmerEmail: req.farmer_id?.email || req.farmerEmail || 'N/A',
          farmerLocation: req.location ? formatLocation(req.location) : 'N/A',
          submittedAt: req.created_at || req.submittedAt,
          requestNumber: req.request_number || req.id
        })),
        ...(harvestRequests?.data || []).map(req => ({
          ...req,
          service_type: 'harvest',
          type: 'Harvesting Day',
          farmerName: req.farmer_id?.full_name || req.farmerName || 'Unknown',
          farmerPhone: req.farmer_id?.phone || req.farmerPhone || 'N/A',
          farmerEmail: req.farmer_id?.email || req.farmerEmail || 'N/A',
          farmerLocation: req.location ? formatLocation(req.location) : 'N/A',
          submittedAt: req.created_at,
          requestNumber: req.request_number || req.id,
          workersNeeded: req.workersNeeded || req.harvest_details?.workers_needed || 'N/A',
          equipmentNeeded: req.equipmentNeeded || req.harvest_details?.equipment_needed || [],
          treesToHarvest: req.treesToHarvest || req.harvest_details?.trees_to_harvest || 'N/A',
          harvestDateFrom: req.harvestDateFrom || req.harvest_details?.harvest_date_from || 'N/A',
          harvestDateTo: req.harvestDateTo || req.harvest_details?.harvest_date_to || 'N/A',
          hassBreakdown: req.hassBreakdown || req.harvest_details?.hass_breakdown,
          harvestImages: req.harvestImages || req.harvest_details?.harvest_images || [],
          priority: req.priority || 'medium',
          notes: req.notes || ''
        })),
        ...(Array.isArray(propertyEvaluationRequests) ? propertyEvaluationRequests : propertyEvaluationRequests?.data || []).map(req => ({
          ...req,
          service_type: 'property_evaluation',
          type: 'Property Evaluation',
          farmerName: req.farmer_id?.full_name || req.farmerName || 'Unknown',
          farmerPhone: req.farmer_id?.phone || req.farmerPhone || 'N/A',
          farmerEmail: req.farmer_id?.email || req.farmerEmail || 'N/A',
          farmerLocation: req.location ? formatLocation(req.location) : 'N/A',
          submittedAt: req.created_at || req.submittedAt,
          requestNumber: req.request_number || req.id,
          farmName: req.location?.farm_name || 'N/A',
          accessInstructions: req.location?.access_instructions || '',
          evaluationPurpose: req.evaluation_purpose || 'General property assessment',
          irrigationSource: req.irrigation_source || 'N/A',
          irrigationTiming: req.irrigation_timing || 'N/A',
          soilTesting: req.soil_testing || false,
          visitStartDate: req.visit_start_date || req.requested_date || 'TBD',
          visitEndDate: req.visit_end_date || 'TBD',
          propertyDetails: req.property_details || {},
          priority: req.priority || 'medium',
          notes: req.notes || '',
          attachments: req.attachments || []
        }))
      ];

      setRequests(allRequests);
      setFilteredRequests(allRequests);
    } catch (error) {
      console.error('Error loading service requests:', error);
      setError('Failed to load service requests. Please try again.');
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    const parts = [];
    if (location.farm_name) parts.push(location.farm_name);
    if (location.village) parts.push(location.village);
    if (location.cell) parts.push(location.cell);
    if (location.sector) parts.push(location.sector);
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city && !parts.includes(location.city)) parts.push(location.city);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(request => request.service_type === filterType.toLowerCase().replace(' ', '_'));
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        (request.farmerName && request.farmerName.toLowerCase().includes(searchLower)) ||
        (request.farmerPhone && request.farmerPhone.toLowerCase().includes(searchLower)) ||
        (request.farmerEmail && request.farmerEmail.toLowerCase().includes(searchLower)) ||
        (request.service_type && request.service_type.toLowerCase().includes(searchLower)) ||
        (request.requestNumber && String(request.requestNumber).toLowerCase().includes(searchLower))
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, filterType, searchTerm]);

  const summary = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    postponed: requests.filter(r => r.status === 'postponed').length,
  };

  const updateRequestStatus = async (requestId, newStatus, rescheduleDate = null) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      const statusData = {
        status: newStatus,
        ...(newStatus === 'postponed' && rescheduleDate && { rescheduleDate })
      };
      
      await updateServiceRequestStatusAPI(requestId, statusData);
      
      const updatedRequests = requests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: newStatus,
              ...(newStatus === 'postponed' && rescheduleDate && { rescheduleDate }),
              updatedAt: new Date().toISOString(),
              statusUpdates: [
                ...(request.statusUpdates || []),
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: newStatus === 'postponed' 
                    ? `Request postponed to ${rescheduleDate ? new Date(rescheduleDate).toLocaleDateString('en-US') : 'TBD'} by admin`
                    : `Request ${newStatus} by admin`
                }
              ]
            }
          : request
      );
      
      setRequests(updatedRequests);
      
      const request = updatedRequests.find(r => r.id === requestId);
      const notification = {
        id: `${requestId}-${Date.now()}`,
        requestId,
        farmerId: request.farmerId || request.farmer_id?.id || 'farmer1',
        message: newStatus === 'postponed'
          ? `Your ${request.service_type} request (ID: ${requestId}) has been postponed${rescheduleDate ? ` to ${new Date(rescheduleDate).toLocaleDateString('en-US')}` : ''}.`
          : `Your ${request.service_type} request (ID: ${requestId}) has been ${newStatus}.`,
        status: newStatus,
        timestamp: new Date().toISOString(),
        read: false
      };

      const savedNotifications = localStorage.getItem('farmerNotifications');
      const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      notifications.push(notification);
      localStorage.setItem('farmerNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error updating request status:', error);
      setError(`Failed to update request status: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
            Completed
          </span>
        );
      case 'postponed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
            Postponed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openRescheduleModal = (request) => {
    setSelectedRequest(request);
    setShowRescheduleModal(true);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleReason) return;
    
    setActionLoading(prev => ({ ...prev, [selectedRequest.id]: true }));
    setError(null);
    try {
      if (selectedRequest.service_type === 'property_evaluation') {
        await rescheduleEvaluationVisit(selectedRequest.id, {
          new_visit_date: rescheduleDate,
          reason: rescheduleReason,
          rescheduled_by: 'admin',
          farmer_notified: true
        });
      } else {
        await updateRequestStatus(selectedRequest.id, 'postponed', rescheduleDate);
      }
      
      await loadServiceRequests();
      setShowRescheduleModal(false);
      setShowModal(false);
      setRescheduleDate('');
      setRescheduleReason('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rescheduling request:', error);
      setError(`Failed to reschedule request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedRequest.id]: false }));
    }
  };

  const handleHarvestAction = async (action, requestId, additionalData = {}) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      switch (action) {
        case 'approve':
          await approveHarvestRequest(requestId, {
            scheduled_date: new Date().toISOString(),
            notes: 'Approved by admin',
            ...additionalData
          });
          break;
        case 'reject':
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await rejectHarvestRequest(requestId, {
            rejection_reason: reason,
            notes: 'Rejected by admin'
          });
          break;
        case 'start':
          await startHarvestRequest(requestId, additionalData);
          break;
        case 'complete':
          await completeHarvestRequest(requestId, additionalData);
          break;
        default:
          throw new Error('Unknown harvest action');
      }
      
      await loadServiceRequests();
    } catch (error) {
      console.error(`Error ${action}ing harvest request:`, error);
      setError(`Failed to ${action} harvest request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handlePropertyEvaluationAction = async (action, requestId, additionalData = {}) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      switch (action) {
        case 'approve':
          await approvePropertyEvaluationRequest(requestId, {
            notes: 'Approved by admin',
            ...additionalData
          });
          break;
        case 'reject':
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await rejectPropertyEvaluationRequest(requestId, {
            rejection_reason: reason,
            notes: 'Rejected by admin'
          });
          break;
        default:
          throw new Error('Unknown property evaluation action');
      }
      
      await loadServiceRequests();
    } catch (error) {
      console.error(`Error ${action}ing property evaluation request:`, error);
      setError(`Failed to ${action} property evaluation request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Modernized Modal Component
  const RequestModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Request Specs</span>
              {getStatusBadge(request.status)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {request.service_type === 'property_evaluation' ? 'Property Evaluation Request' : `Request #${request.requestNumber}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          
          {/* Farmer Details Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <User className="w-4 h-4 text-emerald-600" />
              Farmer Information
            </h3>
            
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">{request.farmerName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {request.farmerPhone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {request.farmerEmail || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                  {request.farmerLocation || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Request Meta Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Service Metadata
            </h3>
            
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service Category:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {request.service_type === 'property_evaluation' ? 'Property Evaluation' :
                   request.service_type === 'harvest' ? 'Harvesting Day' :
                   request.service_type || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted Date:</span>
                <span className="font-medium text-slate-800">{formatDate(request.submittedAt)}</span>
              </div>
              {request.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Modified:</span>
                  <span className="font-medium text-slate-800">{formatDate(request.updatedAt)}</span>
                </div>
              )}
              {request.rescheduleDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Postponed Date:</span>
                  <span className="font-bold text-orange-600">{new Date(request.rescheduleDate).toLocaleDateString('en-US')}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Detailed Service Parameters */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Specific Requirements & Notes
          </h3>

          {request.service_type === 'pest_management' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Pest Category</span>
                <span className="font-semibold text-slate-800">{request.pestType || 'N/A'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Infestation Level</span>
                <span className="font-semibold text-slate-800">{request.infestationLevel || 'N/A'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Problem Description</span>
                <p className="text-slate-700 mt-1">{request.description || 'No additional details provided.'}</p>
              </div>
            </div>
          )}

          {request.service_type === 'harvest' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Workers Requested</span>
                <span className="font-semibold text-slate-800">{request.workersNeeded}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Trees Count</span>
                <span className="font-semibold text-slate-800">{request.treesToHarvest}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Equipment Required</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(request.equipmentNeeded) ? request.equipmentNeeded.join(', ') : request.equipmentNeeded || 'None'}
                </span>
              </div>
            </div>
          )}

          {request.service_type === 'property_evaluation' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Evaluation Purpose</span>
                <span className="font-semibold text-slate-800">{request.evaluationPurpose}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Irrigation Source</span>
                <span className="font-semibold text-slate-800">{request.irrigationSource}</span>
              </div>
              {request.notes && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                  <span className="text-slate-400 font-semibold block">Field Notes</span>
                  <p className="text-slate-700 mt-1">{request.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-xs transition-colors"
          >
            Close Panel
          </button>

          {request.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  if (request.service_type === 'harvest') handleHarvestAction('approve', request.id);
                  else if (request.service_type === 'property_evaluation') handlePropertyEvaluationAction('approve', request.id);
                  else updateRequestStatus(request.id, 'approved');
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Updating...' : 'Approve Request'}
              </button>

              <button
                onClick={() => {
                  if (request.service_type === 'harvest') handleHarvestAction('reject', request.id);
                  else if (request.service_type === 'property_evaluation') handlePropertyEvaluationAction('reject', request.id);
                  else updateRequestStatus(request.id, 'rejected');
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Updating...' : 'Reject Request'}
              </button>

              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                Postpone
              </button>
            </>
          )}

          {request.status === 'approved' && (
            <button
              onClick={() => {
                updateRequestStatus(request.id, 'completed');
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Mark Completed'}
            </button>
          )}
        </div>

      </div>
    </div>
  );

  // Modern Reschedule Modal
  const RescheduleModal = () => (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Postpone / Reschedule</h2>
          </div>
          <button
            onClick={() => {
              setShowRescheduleModal(false);
              setRescheduleDate('');
              setRescheduleReason('');
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Execution Date</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Postponement</label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="State reason clearly for the farmer..."
              rows="3"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              setShowRescheduleModal(false);
              setRescheduleDate('');
              setRescheduleReason('');
            }}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium text-xs hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleReschedule}
            disabled={!rescheduleDate || !rescheduleReason || actionLoading[selectedRequest?.id]}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {actionLoading[selectedRequest?.id] ? 'Saving...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-['Poppins'] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Service Requests Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track, schedule, and process field service inquiries from farmers</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
              Total: <strong className="text-slate-900">{requests.length}</strong>
            </span>
            <button
              onClick={loadServiceRequests}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Metric Cards with Lucide Icons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase">Total</span>
              <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{summary.total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-600">
              <span className="text-xs font-semibold uppercase text-slate-500">Pending</span>
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                <Hourglass className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{summary.pending}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-semibold uppercase text-slate-500">Approved</span>
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{summary.approved}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-xs font-semibold uppercase text-slate-500">Completed</span>
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                <PartyPopper className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{summary.completed}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-600">
              <span className="text-xs font-semibold uppercase text-slate-500">Rejected</span>
              <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{summary.rejected}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-orange-600">
              <span className="text-xs font-semibold uppercase text-slate-500">Postponed</span>
              <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600 border border-orange-100">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-3">{summary.postponed}</p>
          </div>

        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by farmer, contact, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl px-3 py-2 outline-none"
            >
              <option value="all">All Service Types</option>
              <option value="pest_management">Pest Management</option>
              <option value="harvest">Harvesting Day</option>
              <option value="property_evaluation">Property Evaluation</option>
            </select>

            {(filterStatus !== 'all' || filterType !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                  setSearchTerm('');
                }}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline px-2 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-700" />
              <span>Fetching service records...</span>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="px-6 py-3.5">Farmer Info</th>
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-6 py-3.5">Request ID</th>
                    <th className="px-6 py-3.5">Service Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Submitted</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {request.farmerName ? request.farmerName.charAt(0).toUpperCase() : 'F'}
                          </div>
                          <span className="font-semibold text-slate-900">{request.farmerName || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div>{request.farmerPhone || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{request.farmerEmail || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {request.service_type === 'property_evaluation' ? 'PROP-EVAL' : (request.requestNumber || request.id)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {request.service_type === 'property_evaluation' ? 'Property Evaluation' :
                         request.service_type === 'harvest' ? 'Harvesting Day' :
                         request.service_type === 'pest_management' ? 'Pest Management' :
                         request.service_type}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(request.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-xs border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No service requests matching filters.</p>
            </div>
          )}
        </div>

      </div>

      {/* Render Modals */}
      {showModal && selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {showRescheduleModal && selectedRequest && (
        <RescheduleModal />
      )}
    </div>
  );
}