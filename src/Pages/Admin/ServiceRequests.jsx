import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, Clock, Eye, Filter, Search, Calendar, 
  User, MapPin, Phone, Mail, Database, CalendarClock, RefreshCw,
  BarChart3, Hourglass, PartyPopper, CheckSquare, MoreVertical,
  AlertCircle, FileText, ChevronRight, X
} from 'lucide-react';
import { 
  listHarvestRequests,
  approveHarvestRequest,
  rejectHarvestRequest,
  startHarvestRequest,
  completeHarvestRequest,
  updateServiceRequestStatus as updateServiceRequestStatusAPI,
  getPropertyEvaluationRequests,
  approvePropertyEvaluationRequest,
  rejectPropertyEvaluationRequest,
  rescheduleEvaluationVisit,
  listPestManagementRequests,
  approvePestManagementRequest,
  rejectPestManagementRequest,
  startPestManagementTreatment,
  completePestManagementTreatment,
  getHarvestingPlanRequests,
  approveHarvestingPlanRequest,
  completeHarvestingPlanRequest,
  getIPMRoutineRequests,
  approveIPMRoutineRequest,
  completeIPMRoutineRequest
} from '../../services/serviceRequestsService';
import { getFarmerProfileById } from '../../services/farmer-information';
import { createNotification } from '../../services/notificationsService';

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

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    const parts = [];
    if (location.farm_name) parts.push(location.farm_name);
    if (location.street_address) parts.push(location.street_address);
    if (location.village) parts.push(location.village);
    if (location.cell) parts.push(location.cell);
    if (location.sector) parts.push(location.sector);
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city && !parts.includes(location.city)) parts.push(location.city);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Farmer identity can arrive in different shapes depending on request type:
  // - a populated farmer_id object ({ full_name, phone, email })
  // - a bare farmer_id string with a separate farmer_info sub-object (pest management)
  // - already-flattened farmerName/farmerPhone/farmerEmail fields
  // This checks all of them so real backend data is used instead of silently
  // falling back to "Unknown" whenever one particular shape isn't populated.
  const extractFarmerInfo = (req) => {
    const farmerObj = (req.farmer_id && typeof req.farmer_id === 'object') ? req.farmer_id : null;
    const farmerInfo = req.farmer_info || {};
    const farmerName = farmerObj?.full_name || farmerObj?.name || `${farmerObj?.first_name || ''} ${farmerObj?.last_name || ''}`.trim();
    const infoName = farmerInfo?.full_name || farmerInfo?.name || `${farmerInfo?.first_name || ''} ${farmerInfo?.last_name || ''}`.trim();
    const locationSource = req.farmerLocation || req.location || farmerInfo?.location || farmerInfo?.farm_location || farmerInfo?.address || farmerInfo?.farm_address;

    return {
      name: farmerName || infoName || req.farmerName || 'N/A',
      phone: farmerObj?.phone || farmerInfo?.phone || farmerObj?.phone_number || farmerInfo?.phone_number || req.farmerPhone || 'N/A',
      email: farmerObj?.email || farmerInfo?.email || farmerObj?.email_address || farmerInfo?.email_address || req.farmerEmail || 'N/A',
      location: locationSource ? formatLocation(locationSource) : 'N/A'
    };
  };

  const getRequestFarmerId = (req) => {
    if (!req) return null;

    if (req.farmer_id) {
      return typeof req.farmer_id === 'object'
        ? req.farmer_id.id || req.farmer_id._id || req.farmer_id.user_id || req.farmer_id.farmer_id || null
        : req.farmer_id;
    }

    return req.farmer_info?.id || req.farmer_info?._id || req.farmer_info?.farmer_id || req.farmerId || req.user_id || null;
  };

  const normalizeFarmerProfile = (rawProfile) => {
    const payload = rawProfile || {};
    const data = payload.data || payload;
    const farmerProfile = data.farmer_profile || data.profile || data;
    const user = data.user || data.user_info || data;
    const name = farmerProfile?.full_name || farmerProfile?.name || user?.full_name || user?.name || `${farmerProfile?.first_name || ''} ${farmerProfile?.last_name || ''}`.trim() || `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    const phone = farmerProfile?.phone || user?.phone || farmerProfile?.phone_number || user?.phone_number || 'N/A';
    const email = farmerProfile?.email || user?.email || 'N/A';
    const locationSource = farmerProfile?.location || farmerProfile?.farm_location || farmerProfile?.address || farmerProfile?.farm_address || user?.location || user?.address;

    return {
      name: name || 'N/A',
      phone,
      email,
      location: locationSource ? formatLocation(locationSource) : 'N/A'
    };
  };

  const loadFarmerProfilesForRequests = async (requests) => {
    const farmerIds = Array.from(new Set(requests.map(getRequestFarmerId).filter(Boolean)));
    const profiles = {};

    await Promise.all(farmerIds.map(async (id) => {
      try {
        const response = await getFarmerProfileById(id);
        profiles[id] = normalizeFarmerProfile(response);
      } catch (err) {
        console.warn(`Failed to load farmer profile for ${id}:`, err?.message || err);
      }
    }));

    return profiles;
  };

  const normalizeAdminRequest = (req, serviceType, displayType, farmerProfiles = {}) => {
    const farmer = extractFarmerInfo(req);
    const farmerId = getRequestFarmerId(req);
    const profile = farmerId ? farmerProfiles[farmerId] : null;

    return {
      ...req,
      service_type: serviceType,
      type: displayType,
      farmerName: (farmer.name && farmer.name !== 'N/A') ? farmer.name : profile?.name || 'N/A',
      farmerPhone: (farmer.phone && farmer.phone !== 'N/A') ? farmer.phone : profile?.phone || 'N/A',
      farmerEmail: (farmer.email && farmer.email !== 'N/A') ? farmer.email : profile?.email || 'N/A',
      farmerLocation: (farmer.location && farmer.location !== 'N/A') ? farmer.location : profile?.location || 'N/A',
      location: (farmer.location && farmer.location !== 'N/A') ? farmer.location : profile?.location || 'N/A',
      submittedAt: req.created_at || req.submittedAt || req.createdAt,
      requestNumber: req.request_number || req.requestNumber || req.id || req._id,
      priority: req.priority || 'medium',
      notes: req.notes || req.description || ''
    };
  };

  // NOTE: previously this called `listServiceRequests()` AND `getPropertyEvaluationRequests()`,
  // which both hit the exact same '/service-requests/property-evaluation' endpoint under the hood.
  // That produced duplicate property-evaluation rows and, more importantly, meant pest-management,
  // harvesting-plan, and IPM-routine requests were never fetched at all. Fixed below: one call per
  // real endpoint, five endpoints total.
  const loadServiceRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        harvestRequests,
        propertyEvaluationRequests,
        pestManagementRequests,
        harvestingPlanRequests,
        ipmRoutineRequests
      ] = await Promise.all([
        listHarvestRequests().catch((err) => {
          console.error('Error fetching harvest requests:', err);
          return { data: [] };
        }),
        getPropertyEvaluationRequests().catch((err) => {
          console.error('Error fetching property evaluation requests:', err);
          return [];
        }),
        listPestManagementRequests().catch((err) => {
          console.error('Error fetching pest management requests:', err);
          return { data: [] };
        }),
        getHarvestingPlanRequests().catch((err) => {
          console.error('Error fetching harvesting plan requests:', err);
          return { data: [] };
        }),
        getIPMRoutineRequests().catch((err) => {
          console.error('Error fetching IPM routine requests:', err);
          return { data: [] };
        })
      ]);

      const allRequestsRaw = [
        ...(harvestRequests?.data || []),
        ...(Array.isArray(propertyEvaluationRequests) ? propertyEvaluationRequests : propertyEvaluationRequests?.data || []),
        ...(pestManagementRequests?.data || []),
        ...(harvestingPlanRequests?.data || []),
        ...(ipmRoutineRequests?.data || [])
      ];

      const farmerProfiles = await loadFarmerProfilesForRequests(allRequestsRaw);

      const allRequests = [
        ...(harvestRequests?.data || []).map(req => ({
          ...normalizeAdminRequest(req, 'harvest', 'Harvesting Day', farmerProfiles),
          workersNeeded: req.workersNeeded || req.harvest_details?.workers_needed || 'N/A',
          equipmentNeeded: req.equipmentNeeded || req.harvest_details?.equipment_needed || [],
          treesToHarvest: req.treesToHarvest || req.harvest_details?.trees_to_harvest || 'N/A',
          harvestDateFrom: req.harvestDateFrom || req.harvest_details?.harvest_date_from || 'N/A',
          harvestDateTo: req.harvestDateTo || req.harvest_details?.harvest_date_to || 'N/A',
          hassBreakdown: req.hassBreakdown || req.harvest_details?.hass_breakdown,
          harvestImages: req.harvestImages || req.harvest_details?.harvest_images || []
        })),
        ...(Array.isArray(propertyEvaluationRequests) ? propertyEvaluationRequests : propertyEvaluationRequests?.data || []).map(req => ({
          ...normalizeAdminRequest(req, 'property_evaluation', 'Property Evaluation', farmerProfiles),
          farmName: req.location?.farm_name || 'N/A',
          accessInstructions: req.location?.access_instructions || '',
          evaluationPurpose: req.evaluation_purpose || 'General property assessment',
          irrigationSource: req.irrigation_source || 'N/A',
          irrigationTiming: req.irrigation_timing || 'N/A',
          soilTesting: req.soil_testing || false,
          visitStartDate: req.visit_start_date || req.requested_date || 'TBD',
          visitEndDate: req.visit_end_date || 'TBD',
          propertyDetails: req.property_details || {},
          attachments: req.attachments || []
        })),
        ...(pestManagementRequests?.data || []).map(req => ({
          ...normalizeAdminRequest(req, 'pest_management', 'Pest Management', farmerProfiles),
          pestsDiseases: req.pest_management_details?.pests_diseases || [],
          firstNoticed: req.pest_management_details?.first_noticed || 'N/A',
          damageObserved: req.pest_management_details?.damage_observed,
          damageDetails: req.pest_management_details?.damage_details || 'N/A',
          controlMethodsTried: req.pest_management_details?.control_methods_tried || 'N/A',
          severityLevel: req.pest_management_details?.severity_level || 'N/A'
        })),
        ...(harvestingPlanRequests?.data || []).map(req => ({
          ...normalizeAdminRequest(req, 'harvesting_plan', 'Harvesting Plan', farmerProfiles),
          plannedHarvestDate: req.harvesting_plan_details?.planned_harvest_date || req.plannedHarvestDate || 'N/A',
          estimatedYield: req.harvesting_plan_details?.estimated_yield || req.estimatedYield || 'N/A',
          farmSize: req.harvesting_plan_details?.farm_size || req.farmSize || 'N/A',
          laborRequirement: req.harvesting_plan_details?.labor_requirement || req.laborRequirement || 'N/A',
          marketTarget: req.harvesting_plan_details?.market_target || req.marketTarget || 'N/A'
        })),
        ...(ipmRoutineRequests?.data || []).map(req => ({
          ...normalizeAdminRequest(req, 'ipm_routine', 'IPM Routine', farmerProfiles),
          scheduledDate: req.ipm_routine_details?.scheduled_date || req.scheduledDate || 'N/A',
          farmSize: req.ipm_routine_details?.farm_size || req.farmSize || 'N/A',
          pestTypes: req.ipm_routine_details?.pest_type || req.pestType || [],
          ipmMethods: req.ipm_routine_details?.ipm_method || req.ipmMethod || [],
          laborRequired: req.ipm_routine_details?.labor_required || req.laborRequired || 'N/A',
          targetArea: req.ipm_routine_details?.target_area || req.targetArea || 'N/A'
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

  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(request => request.service_type === filterType.toLowerCase().replace(/ /g, '_'));
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

  const getFarmerRecipientId = (request) => {
    if (!request) return null;
    return request.farmer_id?.id || request.farmer_id?._id || request.farmer_id ||
      request.farmer_info?.id || request.farmer_info?._id || request.farmer_info?.farmer_id ||
      request.farmerId || request.farmer_id?.farmer_id || null;
  };

  const buildNotificationMessage = (request, status, rescheduleDate) => {
    const label = getServiceTypeLabel(request.service_type);
    const requestNumber = request.requestNumber || request.id || request._id || 'service request';

    if (status === 'postponed') {
      return `Your ${label} ${requestNumber} has been postponed${rescheduleDate ? ` to ${new Date(rescheduleDate).toLocaleDateString('en-US')}` : ''}.`;
    }

    if (status === 'in_progress') {
      return `Your ${label} ${requestNumber} is now in progress.`;
    }

    return `Your ${label} ${requestNumber} has been updated to ${status.replace('_', ' ')}.`;
  };

  const notifyFarmer = async (request, status, rescheduleDate = null) => {
    const recipientId = getFarmerRecipientId(request);
    if (!recipientId) return;

    try {
      await createNotification({
        recipient_id: recipientId,
        title: 'Service request status updated',
        message: buildNotificationMessage(request, status, rescheduleDate),
        type: 'service_request'
      });
    } catch (err) {
      console.error('Failed to create farmer notification:', err?.message || err);
    }
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
      await loadServiceRequests();

      const updatedRequest = requests.find(r => r.id === requestId || r._id === requestId);
      if (updatedRequest) {
        await notifyFarmer(updatedRequest, newStatus, rescheduleDate);
      }
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
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
            In Progress
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

  const getServiceTypeLabel = (serviceType) => {
    switch (serviceType) {
      case 'property_evaluation': return 'Property Evaluation';
      case 'harvest': return 'Harvesting Day';
      case 'pest_management': return 'Pest Management';
      case 'harvesting_plan': return 'Harvesting Plan';
      case 'ipm_routine': return 'IPM Routine';
      default: return serviceType || 'Unknown';
    }
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

  const handleHarvestAction = async (action, request, additionalData = {}) => {
    const requestId = request.id || request._id;
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
          await notifyFarmer(request, 'approved');
          break;
        case 'reject': {
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await rejectHarvestRequest(requestId, {
            rejection_reason: reason,
            notes: 'Rejected by admin'
          });
          await notifyFarmer(request, 'rejected');
          break;
        }
        case 'start':
          await startHarvestRequest(requestId, additionalData);
          await notifyFarmer(request, 'in_progress');
          break;
        case 'complete':
          await completeHarvestRequest(requestId, additionalData);
          await notifyFarmer(request, 'completed');
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

  const handlePropertyEvaluationAction = async (action, request, additionalData = {}) => {
    const requestId = request.id || request._id;
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      switch (action) {
        case 'approve':
          await approvePropertyEvaluationRequest(requestId, {
            notes: 'Approved by admin',
            ...additionalData
          });
          await notifyFarmer(request, 'approved');
          break;
        case 'reject': {
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await rejectPropertyEvaluationRequest(requestId, {
            rejection_reason: reason,
            notes: 'Rejected by admin'
          });
          await notifyFarmer(request, 'rejected');
          break;
        }
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

  const handlePestManagementAction = async (action, request, additionalData = {}) => {
    const requestId = request.id || request._id;
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      switch (action) {
        case 'approve':
          await approvePestManagementRequest(requestId, {
            notes: 'Approved by admin',
            ...additionalData
          });
          await notifyFarmer(request, 'approved');
          break;
        case 'reject': {
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await rejectPestManagementRequest(requestId, {
            rejection_reason: reason,
            notes: 'Rejected by admin'
          });
          await notifyFarmer(request, 'rejected');
          break;
        }
        case 'start':
          await startPestManagementTreatment(requestId, additionalData);
          await notifyFarmer(request, 'in_progress');
          break;
        case 'complete':
          await completePestManagementTreatment(requestId, additionalData);
          await notifyFarmer(request, 'completed');
          break;
        default:
          throw new Error('Unknown pest management action');
      }

      await loadServiceRequests();
    } catch (error) {
      console.error(`Error ${action}ing pest management request:`, error);
      setError(`Failed to ${action} pest management request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleHarvestingPlanAction = async (action, request, additionalData = {}) => {
    const requestId = request.id || request._id;
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      switch (action) {
        case 'approve':
          await approveHarvestingPlanRequest(requestId, {
            notes: 'Approved by admin',
            ...additionalData
          });
          await notifyFarmer(request, 'approved');
          break;
        case 'reject': {
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await updateRequestStatus(requestId, 'rejected');
          await notifyFarmer(request, 'rejected');
          return; // updateRequestStatus already reloads local state
        }
        case 'complete':
          await completeHarvestingPlanRequest(requestId, additionalData);
          await notifyFarmer(request, 'completed');
          break;
        default:
          throw new Error('Unknown harvesting plan action');
      }

      await loadServiceRequests();
    } catch (error) {
      console.error(`Error ${action}ing harvesting plan request:`, error);
      setError(`Failed to ${action} harvesting plan request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleIPMRoutineAction = async (action, request, additionalData = {}) => {
    const requestId = request.id || request._id;
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    setError(null);
    try {
      switch (action) {
        case 'approve':
          await approveIPMRoutineRequest(requestId, {
            notes: 'Approved by admin',
            ...additionalData
          });
          await notifyFarmer(request, 'approved');
          break;
        case 'reject': {
          const reason = additionalData.reason || prompt('Please provide a rejection reason:');
          if (!reason) return;
          await updateRequestStatus(requestId, 'rejected');
          await notifyFarmer(request, 'rejected');
          return;
        }
        case 'complete':
          await completeIPMRoutineRequest(requestId, additionalData);
          await notifyFarmer(request, 'completed');
          break;
        default:
          throw new Error('Unknown IPM routine action');
      }

      await loadServiceRequests();
    } catch (error) {
      console.error(`Error ${action}ing IPM routine request:`, error);
      setError(`Failed to ${action} IPM routine request: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  // Routes an action to the right handler based on service_type
  const dispatchAction = (action, request) => {
    switch (request.service_type) {
      case 'harvest':
        return handleHarvestAction(action, request);
      case 'property_evaluation':
        return handlePropertyEvaluationAction(action, request);
      case 'pest_management':
        return handlePestManagementAction(action, request);
      case 'harvesting_plan':
        return handleHarvestingPlanAction(action, request);
      case 'ipm_routine':
        return handleIPMRoutineAction(action, request);
      default:
        return updateRequestStatus(request.id, action === 'approve' ? 'approved' : 'rejected');
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
              {getServiceTypeLabel(request.service_type)} {request.requestNumber ? `#${request.requestNumber}` : ''}
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
                  {getServiceTypeLabel(request.service_type)}
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
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Pests / Diseases</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(request.pestsDiseases) && request.pestsDiseases.length > 0
                    ? request.pestsDiseases.map(p => p.name).filter(Boolean).join(', ')
                    : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Severity Level</span>
                <span className="font-semibold text-slate-800 capitalize">{request.severityLevel}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">First Noticed</span>
                <span className="font-semibold text-slate-800">{request.firstNoticed}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Damage Details</span>
                <p className="text-slate-700 mt-1">{request.damageDetails}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Control Methods Already Tried</span>
                <p className="text-slate-700 mt-1">{request.controlMethodsTried}</p>
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
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Harvest Window</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(request.harvestDateFrom)} - {formatDate(request.harvestDateTo)}
                </span>
              </div>
              {request.notes && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                  <span className="text-slate-400 font-semibold block">Field Notes</span>
                  <p className="text-slate-700 mt-1">{request.notes}</p>
                </div>
              )}
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

          {request.service_type === 'harvesting_plan' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Planned Harvest Date</span>
                <span className="font-semibold text-slate-800">{formatDate(request.plannedHarvestDate)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Estimated Yield</span>
                <span className="font-semibold text-slate-800">{request.estimatedYield}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Farm Size</span>
                <span className="font-semibold text-slate-800">{request.farmSize}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Labor Requirement</span>
                <span className="font-semibold text-slate-800">{request.laborRequirement}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Market Target</span>
                <span className="font-semibold text-slate-800">{request.marketTarget}</span>
              </div>
              {request.notes && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                  <span className="text-slate-400 font-semibold block">Field Notes</span>
                  <p className="text-slate-700 mt-1">{request.notes}</p>
                </div>
              )}
            </div>
          )}

          {request.service_type === 'ipm_routine' && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Scheduled Date</span>
                <span className="font-semibold text-slate-800">{formatDate(request.scheduledDate)}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Farm Size</span>
                <span className="font-semibold text-slate-800">{request.farmSize}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Target Area</span>
                <span className="font-semibold text-slate-800">{request.targetArea}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block">Labor Required</span>
                <span className="font-semibold text-slate-800">{request.laborRequired}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">Pest Types</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(request.pestTypes) ? request.pestTypes.join(', ') : request.pestTypes || 'N/A'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2">
                <span className="text-slate-400 font-semibold block">IPM Methods</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(request.ipmMethods) ? request.ipmMethods.join(', ') : request.ipmMethods || 'N/A'}
                </span>
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
                  dispatchAction('approve', request);
                  onClose();
                }}
                disabled={actionLoading[request.id]}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading[request.id] ? 'Updating...' : 'Approve Request'}
              </button>

              <button
                onClick={() => {
                  dispatchAction('reject', request);
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

          {/* HARVEST-SPECIFIC WORKFLOW: approved -> start -> in_progress -> complete -> completed */}
          {request.status === 'approved' && request.service_type === 'harvest' && (
            <button
              onClick={() => {
                handleHarvestAction('start', request, { actual_start_date: new Date().toISOString() });
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Start Harvest'}
            </button>
          )}

          {request.status === 'in_progress' && request.service_type === 'harvest' && (
            <button
              onClick={() => {
                handleHarvestAction('complete', request, { completed_at: new Date().toISOString() });
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Complete Harvest'}
            </button>
          )}

          {/* PEST MANAGEMENT WORKFLOW: approved -> start -> in_progress -> complete -> completed */}
          {request.status === 'approved' && request.service_type === 'pest_management' && (
            <button
              onClick={() => {
                handlePestManagementAction('start', request, { actual_start_date: new Date().toISOString() });
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Start Treatment'}
            </button>
          )}

          {request.status === 'in_progress' && request.service_type === 'pest_management' && (
            <button
              onClick={() => {
                handlePestManagementAction('complete', request, { completed_at: new Date().toISOString() });
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Complete Treatment'}
            </button>
          )}

          {/* HARVESTING PLAN & IPM ROUTINE: approved -> complete (no separate "start" step) */}
          {request.status === 'approved' && request.service_type === 'harvesting_plan' && (
            <button
              onClick={() => {
                handleHarvestingPlanAction('complete', request, { completed_at: new Date().toISOString() });
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Mark Completed'}
            </button>
          )}

          {request.status === 'approved' && request.service_type === 'ipm_routine' && (
            <button
              onClick={() => {
                handleIPMRoutineAction('complete', request, { completed_at: new Date().toISOString() });
                onClose();
              }}
              disabled={actionLoading[request.id]}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              {actionLoading[request.id] ? 'Updating...' : 'Mark Completed'}
            </button>
          )}

          {/* Property evaluation keeps the original generic completion behavior */}
          {request.status === 'approved' && request.service_type === 'property_evaluation' && (
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
                <option value="in_progress">In Progress</option>
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
              <option value="harvesting_plan">Harvesting Plan</option>
              <option value="ipm_routine">IPM Routine</option>
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
                    <th className="px-6 py-3.5">Farmer Name</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Location</th>
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
                        {request.farmerPhone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {request.location || request.farmerLocation || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {getServiceTypeLabel(request.service_type)}
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