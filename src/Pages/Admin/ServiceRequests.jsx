import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Filter, Search, Calendar, User, MapPin, Phone, Mail, Database, CalendarClock } from 'lucide-react';
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
          return { data: [] };
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
        ...(propertyEvaluationRequests?.data || []).map(req => ({
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

      console.log('Loaded requests:', allRequests);
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
        (request.requestNumber && request.requestNumber.toLowerCase().includes(searchLower))
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
      
      const response = await updateServiceRequestStatusAPI(requestId, statusData);
      
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'postponed': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'postponed': return <CalendarClock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'N/A' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      let response;
      switch (action) {
        case 'approve':
          response = await approveHarvestRequest(requestId, {
            scheduled_date: new Date().toISOString(),
            notes: 'Approved by admin',
            ...additionalData
          });
          break;
        case 'reject':
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          response = await rejectHarvestRequest(requestId, {
            rejection_reason: reason,
            notes: 'Rejected by admin'
          });
          break;
        case 'start':
          response = await startHarvestRequest(requestId, additionalData);
          break;
        case 'complete':
          response = await completeHarvestRequest(requestId, additionalData);
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
      let response;
      switch (action) {
        case 'approve':
          response = await approvePropertyEvaluationRequest(requestId, {
            notes: 'Approved by admin',
            ...additionalData
          });
          break;
        case 'reject':
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          response = await rejectPropertyEvaluationRequest(requestId, {
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

  const RequestModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Service Request Details</h2>
            <p className="text-sm text-slate-500 mt-1">
              {request.service_type === 'property_evaluation' ? 'Property Evaluation Request' : `Request #${request.requestNumber}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            <XCircle className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              Farmer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-sm font-medium text-slate-600 w-20">Name:</span>
                <span className="text-sm text-slate-900 font-medium flex-1">{request.farmerName || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-slate-600 w-20">Phone:</span>
                <span className="text-sm text-slate-900 flex items-center flex-1">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {request.farmerPhone || 'N/A'}
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-slate-600 w-20">Email:</span>
                <span className="text-sm text-slate-900 flex items-center flex-1">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {request.farmerEmail || 'N/A'}
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-slate-600 w-20">Location:</span>
                <span className="text-sm text-slate-900 flex items-start flex-1">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{request.farmerLocation || 'N/A'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Request Information
            </h3>
            <div className="space-y-3">
              {/* Only show Request ID for non-property evaluation and non-harvest requests */}
              {request.service_type !== 'property_evaluation' && request.service_type !== 'harvest' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Request ID:</span>
                  <span className="text-sm font-mono bg-white px-2 py-1 rounded border border-emerald-200">
                    {request.requestNumber || 'N/A'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Service Type:</span>
                <span className="text-sm font-semibold text-slate-900">
                  {request.service_type === 'property_evaluation' ? 'Property Evaluation' :
                   request.service_type === 'harvest' ? 'Harvesting Day' :
                   request.service_type || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1.5 capitalize">{request.status}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Submitted:</span>
                <span className="text-sm text-slate-900">{formatDate(request.submittedAt)}</span>
              </div>
              {request.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Updated:</span>
                  <span className="text-sm text-slate-900">{formatDate(request.updatedAt)}</span>
                </div>
              )}
              {request.rescheduleDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Rescheduled:</span>
                  <span className="text-sm font-semibold text-orange-700">{new Date(request.rescheduleDate).toLocaleDateString('en-US')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mr-2.5">
              <Database className="w-4 h-4 text-white" />
            </div>
            Service Details
          </h3>
          
          {request.service_type === 'pest_management' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Pest Type', value: request.pestType },
                  { label: 'Infestation Level', value: request.infestationLevel },
                  { label: 'Crop Type', value: request.cropType },
                  { label: 'Farm Size', value: request.farmSize }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm text-slate-900 font-medium">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-slate-900">{request.description || 'N/A'}</p>
              </div>
            </div>
          )}

          {request.service_type === 'harvest' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Workers Needed', value: request.workersNeeded },
                  { label: 'Equipment Needed', value: Array.isArray(request.equipmentNeeded) ? request.equipmentNeeded.join(', ') : request.equipmentNeeded || 'None' },
                  { label: 'Trees to Harvest', value: request.treesToHarvest },
                  { label: 'Harvest Period', value: `${request.harvestDateFrom || 'N/A'} to ${request.harvestDateTo || 'N/A'}` },
                  { label: 'Priority', value: request.priority }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm text-slate-900 font-medium">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              {request.notes && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-900">{request.notes}</p>
                </div>
              )}
            </div>
          )}

          {request.service_type === 'property_evaluation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Farm Name', value: request.farmName },
                  { label: 'Priority', value: request.priority },
                  { label: 'Irrigation Source', value: request.irrigationSource },
                  { label: 'Irrigation Timing', value: request.irrigationTiming },
                  { label: 'Soil Testing', value: request.soilTesting ? 'Yes' : 'No' },
                  { label: 'Visit Date', value: request.visitStartDate ? formatDate(request.visitStartDate) : 'TBD' }
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-sm text-slate-900 font-medium">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Evaluation Purpose</p>
                <p className="text-sm text-slate-900">{request.evaluationPurpose || 'General property assessment'}</p>
              </div>
              {request.description && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-900">{request.description}</p>
                </div>
              )}
              {request.accessInstructions && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Access Instructions</p>
                  <p className="text-sm text-slate-900">{request.accessInstructions}</p>
                </div>
              )}
              {request.notes && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-slate-900">{request.notes}</p>
                </div>
              )}
              {request.propertyDetails && Object.keys(request.propertyDetails).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Property Details</p>
                  <div className="space-y-1.5">
                    {request.propertyDetails.farm_size && (
                      <p className="text-sm text-slate-700"><span className="font-medium">Farm Size:</span> {request.propertyDetails.farm_size}</p>
                    )}
                    {request.propertyDetails.crop_types && (
                      <p className="text-sm text-slate-700"><span className="font-medium">Crop Types:</span> {Array.isArray(request.propertyDetails.crop_types) ? request.propertyDetails.crop_types.join(', ') : request.propertyDetails.crop_types}</p>
                    )}
                    {request.propertyDetails.current_irrigation_system && (
                      <p className="text-sm text-slate-700"><span className="font-medium">Current Irrigation:</span> {request.propertyDetails.current_irrigation_system}</p>
                    )}
                    {request.propertyDetails.soil_type && (
                      <p className="text-sm text-slate-700"><span className="font-medium">Soil Type:</span> {request.propertyDetails.soil_type}</p>
                    )}
                  </div>
                </div>
              )}
              {request.attachments && request.attachments.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Attachments</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {request.attachments.map((attachment, index) => (
                      <div key={index} className="aspect-square bg-white rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-violet-400 transition-colors">
                        <span className="text-xs text-slate-500 font-medium">File {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            disabled={actionLoading[request.id]}
            className="px-5 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 font-semibold transition-all duration-200 disabled:opacity-50"
          >
            Close
          </button>
          
          {request.service_type !== 'harvest' && 
           request.service_type !== 'property_evaluation' && 
           request.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  updateRequestStatus(request.id, 'approved');
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => {
                  updateRequestStatus(request.id, 'rejected');
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 font-semibold shadow-lg shadow-rose-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl hover:from-orange-600 hover:to-amber-700 font-semibold shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-50"
              >
                Postpone
              </button>
            </>
          )}
          
          {request.service_type === 'harvest' && request.status === 'pending' && (
            <>
              <button
                onClick={async () => {
                  await handleHarvestAction('approve', request.id);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Approve Harvest'}
              </button>
              <button
                onClick={async () => {
                  await handleHarvestAction('reject', request.id);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 font-semibold shadow-lg shadow-rose-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Reject Harvest'}
              </button>
            </>
          )}

          {request.service_type === 'property_evaluation' && request.status === 'pending' && (
            <>
              <button
                onClick={async () => {
                  await handlePropertyEvaluationAction('approve', request.id);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Approve Evaluation'}
              </button>
              <button
                onClick={async () => {
                  await handlePropertyEvaluationAction('reject', request.id);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 font-semibold shadow-lg shadow-rose-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Reject Evaluation'}
              </button>
              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl hover:from-orange-600 hover:to-amber-700 font-semibold shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-50"
              >
                Postpone
              </button>
            </>
          )}
          
          {request.status === 'approved' && (
            <>
              <button
                onClick={() => {
                  updateRequestStatus(request.id, 'completed');
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Mark as Completed'}
              </button>
              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-5 py-2.5 text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl hover:from-orange-600 hover:to-amber-700 font-semibold shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-50"
              >
                Reschedule
              </button>
            </>
          )}
          
          {request.status === 'postponed' && (
            <button
              onClick={() => {
                updateRequestStatus(request.id, 'approved');
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-5 py-2.5 text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl hover:from-emerald-600 hover:to-green-700 font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Processing...' : 'Approve'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const RescheduleModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Reschedule Request</h2>
            <p className="text-sm text-slate-500 mt-1">Select a new date for this service</p>
          </div>
          <button
            onClick={() => {
              setShowRescheduleModal(false);
              setRescheduleDate('');
              setRescheduleReason('');
            }}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            <XCircle className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select New Date</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Rescheduling</label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Enter reason for rescheduling..."
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none"
              rows="4"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
          <button
            onClick={() => {
              setShowRescheduleModal(false);
              setRescheduleDate('');
              setRescheduleReason('');
            }}
            className="px-5 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 font-semibold transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={!rescheduleDate || !rescheduleReason || actionLoading[selectedRequest?.id]}
            className={`px-5 py-2.5 text-white rounded-xl font-semibold transition-all duration-200 ${
              rescheduleDate && rescheduleReason && !actionLoading[selectedRequest?.id]
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/30'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            {actionLoading[selectedRequest?.id] ? 'Processing...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #dbeafe 100%)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">Service Requests Management</h1>
              <p className="text-slate-500">Monitor and manage all service requests from farmers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
                Total: <span className="font-bold text-slate-900">{requests.length}</span> requests
              </div>
              <button
                onClick={loadServiceRequests}
                disabled={loading}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-50"
              >
                <Database className="w-4 h-4 mr-2" />
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 text-rose-800 px-5 py-4 rounded-xl mb-6 flex items-center shadow-sm">
            <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mr-2.5">
              <Database className="w-4 h-4 text-white" />
            </div>
            Request Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: summary.total, gradient: 'from-slate-50 to-slate-100', text: 'slate', icon: '📊' },
              { label: 'Pending', value: summary.pending, gradient: 'from-amber-50 to-yellow-100', text: 'amber', icon: '⏳' },
              { label: 'Approved', value: summary.approved, gradient: 'from-emerald-50 to-green-100', text: 'emerald', icon: '✅' },
              { label: 'Completed', value: summary.completed, gradient: 'from-blue-50 to-indigo-100', text: 'blue', icon: '🎉' },
              { label: 'Rejected', value: summary.rejected, gradient: 'from-rose-50 to-red-100', text: 'rose', icon: '❌' },
              { label: 'Postponed', value: summary.postponed, gradient: 'from-orange-50 to-amber-100', text: 'orange', icon: '📅' }
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-4 border-2 border-${stat.text}-200 text-center transition-transform hover:scale-105`}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className={`text-sm font-semibold text-${stat.text}-700 mb-1`}>{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.text}-900`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Search className="w-4 h-4 mr-1.5" />
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name, phone, email, request #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Filter className="w-4 h-4 mr-1.5" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                <Database className="w-4 h-4 mr-1.5" />
                Service Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              >
                <option value="all">All Types</option>
                <option value="pest_management">Pest Management</option>
                <option value="harvest">Harvesting Day</option>
                <option value="property_evaluation">Property Evaluation</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterType('all');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 font-semibold transition-all duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

       
       Requests Table
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-emerald-500 mb-4"></div>
              <p className="text-slate-600 font-medium">Loading service requests...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Farmer Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Telephone</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Request ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Service Type</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Submitted Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900 font-medium">{request.farmerName || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{request.farmerEmail || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">{request.farmerPhone || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700 font-mono">
                          {request.service_type === 'property_evaluation' ? 'Property Eval' : (request.requestNumber || request.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {request.service_type === 'property_evaluation' ? 'Property Evaluation' :
                           request.service_type === 'harvest' ? 'Harvesting Day' :
                           request.service_type === 'pest_management' ? 'Pest Management' :
                           request.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(request.status)}`}>
                          <span className="capitalize">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700">
                          {formatDate(request.submittedAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          disabled={actionLoading[request.id]}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Filter className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No service requests found</h3>
              <p className="text-slate-600">Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
          
      </div>

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