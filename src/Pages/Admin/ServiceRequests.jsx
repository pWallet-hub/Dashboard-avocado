import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Filter, Search, Calendar, User, MapPin, Phone, Mail, Database, CalendarClock } from 'lucide-react';
import '../Styles/Admin.css';
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
  rescheduleEvaluationVisit // Added import for rescheduling
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
  const [rescheduleReason, setRescheduleReason] = useState(''); // Added for reschedule reason
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // Added for per-action loading states

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

      // Validate and format requests
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'postponed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
          rescheduled_by: 'admin', // Adjust based on auth context
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Farmer Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{request.farmerName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {request.farmerPhone || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {request.farmerEmail || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {request.farmerLocation || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Request Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Request Number</label>
                <p className="text-gray-900 font-mono text-sm">{request.requestNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Service Type</label>
                <p className="text-gray-900 font-semibold">{request.service_type || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1 capitalize">{request.status}</span>
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Submitted</label>
                <p className="text-gray-900">{formatDate(request.submittedAt)}</p>
              </div>
              {request.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{formatDate(request.updatedAt)}</p>
                </div>
              )}
              {request.rescheduleDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Rescheduled To</label>
                  <p className="text-gray-900">{new Date(request.rescheduleDate).toLocaleDateString('en-US')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
          
          {request.service_type === 'pest_management' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Pest Type</label>
                  <p className="text-gray-900">{request.pestType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Infestation Level</label>
                  <p className="text-gray-900">{request.infestationLevel || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Crop Type</label>
                  <p className="text-gray-900">{request.cropType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Farm Size</label>
                  <p className="text-gray-900">{request.farmSize || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{request.description || 'N/A'}</p>
              </div>
            </div>
          )}

          {request.service_type === 'harvest' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Workers Needed</label>
                  <p className="text-gray-900">{request.workersNeeded || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Equipment Needed</label>
                  <p className="text-gray-900">
                    {Array.isArray(request.equipmentNeeded) 
                      ? request.equipmentNeeded.join(', ') 
                      : request.equipmentNeeded || 'No equipment needed'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Trees to Harvest</label>
                  <p className="text-gray-900">{request.treesToHarvest || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Harvest Period</label>
                  <p className="text-gray-900">
                    {request.harvestDateFrom || 'N/A'} to {request.harvestDateTo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className="text-gray-900 capitalize">{request.priority || 'N/A'}</p>
                </div>
              </div>
              {request.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-900">{request.notes}</p>
                </div>
              )}
            </div>
          )}

          {request.service_type === 'property_evaluation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Farm Name</label>
                  <p className="text-gray-900">{request.farmName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <p className="text-gray-900 capitalize">{request.priority || 'Medium'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Irrigation Source</label>
                  <p className="text-gray-900">{request.irrigationSource || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Irrigation Timing</label>
                  <p className="text-gray-900">{request.irrigationTiming || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Soil Testing</label>
                  <p className="text-gray-900">{request.soilTesting ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Visit Date</label>
                  <p className="text-gray-900">{request.visitStartDate ? formatDate(request.visitStartDate) : 'TBD'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Evaluation Purpose</label>
                <p className="text-gray-900">{request.evaluationPurpose || 'General property assessment'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{request.description || 'N/A'}</p>
              </div>
              {request.accessInstructions && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Access Instructions</label>
                  <p className="text-gray-900">{request.accessInstructions}</p>
                </div>
              )}
              {request.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-900">{request.notes}</p>
                </div>
              )}
              {request.propertyDetails && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Property Details</label>
                  <div className="mt-2 space-y-1">
                    {request.propertyDetails.farm_size && (
                      <p className="text-gray-900 text-sm">Farm Size: {request.propertyDetails.farm_size}</p>
                    )}
                    {request.propertyDetails.crop_types && (
                      <p className="text-gray-900 text-sm">Crop Types: {Array.isArray(request.propertyDetails.crop_types) ? request.propertyDetails.crop_types.join(', ') : request.propertyDetails.crop_types}</p>
                    )}
                    {request.propertyDetails.current_irrigation_system && (
                      <p className="text-gray-900 text-sm">Current Irrigation: {request.propertyDetails.current_irrigation_system}</p>
                    )}
                    {request.propertyDetails.soil_type && (
                      <p className="text-gray-900 text-sm">Soil Type: {request.propertyDetails.soil_type}</p>
                    )}
                  </div>
                </div>
              )}
              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Attachments</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {request.attachments.map((attachment, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">Attachment {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={actionLoading[request.id]}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
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
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => {
                  updateRequestStatus(request.id, 'rejected');
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
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
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Approve Harvest'}
              </button>
              <button
                onClick={async () => {
                  await handleHarvestAction('reject', request.id);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Approve Evaluation'}
              </button>
              <button
                onClick={async () => {
                  await handlePropertyEvaluationAction('reject', request.id);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Reject Evaluation'}
              </button>
              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
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
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Processing...' : 'Mark as Completed'}
              </button>
              <button
                onClick={() => openRescheduleModal(request)}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
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
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Processing...' : 'Approve'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const RescheduleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Reschedule Request</h2>
          <button
            onClick={() => {
              setShowRescheduleModal(false);
              setRescheduleDate('');
              setRescheduleReason('');
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select New Date</label>
          <input
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rescheduling</label>
          <textarea
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            placeholder="Enter reason for rescheduling"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows="4"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowRescheduleModal(false);
              setRescheduleDate('');
              setRescheduleReason('');
            }}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={!rescheduleDate || !rescheduleReason || actionLoading[selectedRequest.id]}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              rescheduleDate && rescheduleReason && !actionLoading[selectedRequest.id]
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {actionLoading[selectedRequest.id] ? 'Processing...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-inner">
        <div className="admin-header">
          <h1 className="admin-title">Service Requests Management</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Requests: {requests.length}
            </div>
            <button
              onClick={loadServiceRequests}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{summary.pending}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-green-800">Approved</p>
              <p className="text-2xl font-bold text-green-900">{summary.approved}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-blue-800">Completed</p>
              <p className="text-2xl font-bold text-blue-900">{summary.completed}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{summary.rejected}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-orange-800">Postponed</p>
              <p className="text-2xl font-bold text-orange-900">{summary.postponed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, request #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading service requests...</p>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-600">
                          {request.requestNumber || request.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.farmerName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.farmerPhone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {request.service_type === 'property_evaluation' ? 'Property Evaluation' :
                           request.service_type === 'harvest' ? 'Harvesting Day' :
                           request.service_type === 'pest_management' ? 'Pest Management' :
                           request.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          disabled={actionLoading[request.id]}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No service requests found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria</p>
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