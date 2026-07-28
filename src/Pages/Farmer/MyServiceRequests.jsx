import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, Eye, Calendar, User, MapPin, AlertTriangle, ArrowUpDown, RefreshCw, X, Search, SlidersHorizontal, MoreHorizontal, ChevronLeft, ChevronRight, Download, Check } from 'lucide-react';
import DashboardHeader from '../../components/Header/DashboardHeader';
import {
  getServiceRequestsForFarmer,
  listHarvestRequests,
  listPestManagementRequests,
  getHarvestingPlanRequests,
  getIPMRoutineRequests
} from '../../services/serviceRequestsService';
import { getFarmerInformation } from '../../services/farmer-information';

export default function MyServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  useEffect(() => {
    loadRequests();

    const handleWindowFocus = () => {
      loadRequests();
    };

    const refreshInterval = setInterval(() => {
      loadRequests();
    }, 30000); // refresh every 30 seconds so farmer sees admin status changes

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
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

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      const userString = localStorage.getItem('user');

      if (!authToken) {
        setRequests([]);
        setError('You are not logged in. Please log in again to see your service requests.');
        return;
      }

      let user = null;
      try {
        user = userString ? JSON.parse(userString) : null;
      } catch (parseError) {
        console.error(parseError);
      }

      let farmerId = user?.id || user?._id || user?.user_id;

      if (!farmerId) {
        farmerId = localStorage.getItem('farmerId') ||
                  localStorage.getItem('userId') ||
                  localStorage.getItem('currentUserId');

        const currentUser = localStorage.getItem('currentUser');
        if (!farmerId && currentUser) {
          try {
            const parsedCurrentUser = JSON.parse(currentUser);
            farmerId = parsedCurrentUser?.id || parsedCurrentUser?._id || parsedCurrentUser?.user_id;
            user = user || parsedCurrentUser;
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (!farmerId || farmerId === 'undefined' || farmerId === 'null') {
        const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
        setRequests(localRequests);
        return;
      }

      let cleanFarmerId = String(farmerId).trim();
      const objectIdRegex = /^[a-f\d]{24}$/i;

      if (!objectIdRegex.test(cleanFarmerId)) {
        if (cleanFarmerId.length < 24 && cleanFarmerId.length > 10) {
          if (user && typeof user === 'object') {
            const possibleIds = [
              user.id, user._id, user.userId, user.user_id,
              user.farmerId, user.farmer_id, user.uid
            ];

            for (const possibleId of possibleIds) {
              if (possibleId && typeof possibleId === 'string' && objectIdRegex.test(possibleId)) {
                cleanFarmerId = possibleId;
                break;
              }
            }
          }
        }

        if (!objectIdRegex.test(cleanFarmerId)) {
          const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
          setRequests(localRequests);
          return;
        }
      }

      // This page always shows the *current logged-in farmer's own* requests.
      // The backend's farmer_id field often comes back as a bare ID string rather
      // than a populated object, so instead of relying on req.farmer_id?.full_name
      // (which is why everything showed "Anonymous Account" / blank fields), we
      // use the farmer's own profile info as the source of truth for every row.
      // Use backend farmer profile when available (fresh source-of-truth).
      // Fall back to localStorage-derived `user` if the backend call fails.
      let backendUserInfo = null;
      let backendFarmerProfile = null;
      try {
        const fi = await getFarmerInformation();
        const fd = fi?.data || fi;
        backendUserInfo = fd?.user_info || fd?.user || null;
        backendFarmerProfile = fd?.farmer_profile || fd?.profile || null;
      } catch (e) {
        // ignore — we'll fall back to local `user` values
      }

      const sourceUser = backendUserInfo || user || {};
      const selfName = sourceUser?.full_name || sourceUser?.name || [sourceUser?.first_name, sourceUser?.last_name].filter(Boolean).join(' ') || 'N/A';
      const selfPhone = sourceUser?.phone || sourceUser?.phone_number || 'N/A';
      const selfEmail = sourceUser?.email || 'N/A';

      const profileToLocation = (p) => {
        if (!p) return null;
        return {
          province: p.farm_province || p.province || undefined,
          district: p.farm_district || p.district || undefined,
          sector: p.farm_sector || p.sector || undefined,
          cell: p.farm_cell || p.cell || undefined,
          village: p.farm_village || p.village || undefined,
          farm_name: p.farm_name || undefined
        };
      };

      const profileLocationString = backendFarmerProfile ? formatLocation(profileToLocation(backendFarmerProfile)) : null;

      try {
        const results = await Promise.allSettled([
          getServiceRequestsForFarmer(cleanFarmerId, { limit: 100 }),
          listHarvestRequests({ farmer_id: cleanFarmerId, limit: 100 }),
          listPestManagementRequests({ farmer_id: cleanFarmerId, limit: 100 }),
          getHarvestingPlanRequests({ farmer_id: cleanFarmerId, limit: 100 }),
          getIPMRoutineRequests({ farmer_id: cleanFarmerId, limit: 100 })
        ]);

        const [
          propertyEvalResult,
          harvestResult,
          pestManagementResult,
          harvestingPlanResult,
          ipmRoutineResult
        ] = results;

        const propertyEvalRequests = propertyEvalResult.status === 'fulfilled'
          ? (Array.isArray(propertyEvalResult.value) ? propertyEvalResult.value : propertyEvalResult.value?.data || [])
          : [];
        const harvestRequests = harvestResult.status === 'fulfilled' ? (harvestResult.value?.data || []) : [];
        const pestManagementRequests = pestManagementResult.status === 'fulfilled' ? (pestManagementResult.value?.data || []) : [];
        const harvestingPlanRequests = harvestingPlanResult.status === 'fulfilled' ? (harvestingPlanResult.value?.data || []) : [];
        const ipmRoutineRequests = ipmRoutineResult.status === 'fulfilled' ? (ipmRoutineResult.value?.data || []) : [];

        const allRequests = [
          ...propertyEvalRequests.map(req => ({
            ...req,
            type: 'Property Evaluation',
            service_type: 'property_evaluation',
            farmerName: selfName,
            farmerPhone: selfPhone,
            farmerEmail: selfEmail,
            farmerLocation: profileLocationString && profileLocationString !== 'N/A' ? profileLocationString : (req.location ? formatLocation(req.location) : 'N/A'),
            submittedAt: req.created_at || req.submittedAt,
            requestNumber: req.request_number || req.id || req._id,
            evaluationPurpose: req.evaluation_purpose || 'General property assessment',
            irrigationSource: req.irrigation_source || 'N/A',
            irrigationTiming: req.irrigation_timing || 'N/A',
            visitStartDate: req.visit_start_date || req.requested_date || 'TBD',
            visitEndDate: req.visit_end_date || 'TBD',
            priority: req.priority || 'medium',
            notes: req.notes || ''
          })),
          ...harvestRequests.map(req => ({
            ...req,
            type: 'Harvesting Day',
            service_type: 'harvest',
            farmerName: selfName,
            farmerPhone: selfPhone,
            farmerEmail: selfEmail,
            farmerLocation: profileLocationString && profileLocationString !== 'N/A' ? profileLocationString : (req.location ? formatLocation(req.location) : 'N/A'),
            submittedAt: req.created_at,
            requestNumber: req.request_number || req.id || req._id,
            workersNeeded: req.workersNeeded || req.harvest_details?.workers_needed,
            equipmentNeeded: req.equipmentNeeded || req.harvest_details?.equipment_needed,
            treesToHarvest: req.treesToHarvest || req.harvest_details?.trees_to_harvest,
            harvestDateFrom: req.harvestDateFrom || req.harvest_details?.harvest_date_from,
            harvestDateTo: req.harvestDateTo || req.harvest_details?.harvest_date_to,
            hassBreakdown: req.hassBreakdown || req.harvest_details?.hass_breakdown,
            harvestImages: req.harvestImages || req.harvest_details?.harvest_images,
            priority: req.priority,
            notes: req.notes
          })),
          ...pestManagementRequests.map(req => ({
            ...req,
            type: 'Pest Management',
            service_type: 'pest_management',
            farmerName: selfName,
            farmerPhone: selfPhone,
            farmerEmail: selfEmail,
            farmerLocation: profileLocationString && profileLocationString !== 'N/A' ? profileLocationString : (req.location ? formatLocation(req.location) : 'N/A'),
            submittedAt: req.created_at || req.submittedAt,
            requestNumber: req.request_number || req.id || req._id,
            pestsDiseases: req.pest_management_details?.pests_diseases || [],
            firstNoticed: req.pest_management_details?.first_noticed || 'N/A',
            damageObserved: req.pest_management_details?.damage_observed,
            damageDetails: req.pest_management_details?.damage_details || 'N/A',
            controlMethodsTried: req.pest_management_details?.control_methods_tried || 'N/A',
            severityLevel: req.pest_management_details?.severity_level || 'N/A',
            priority: req.priority || 'medium',
            notes: req.description || req.notes || ''
          })),
          ...harvestingPlanRequests.map(req => ({
            ...req,
            type: 'Harvesting Plan',
            service_type: 'harvesting_plan',
            farmerName: selfName,
            farmerPhone: selfPhone,
            farmerEmail: selfEmail,
            farmerLocation: profileLocationString && profileLocationString !== 'N/A' ? profileLocationString : (req.location ? formatLocation(req.location) : 'N/A'),
            submittedAt: req.created_at || req.submittedAt,
            requestNumber: req.request_number || req.id || req._id,
            plannedHarvestDate: req.harvesting_plan_details?.planned_harvest_date || req.plannedHarvestDate || 'N/A',
            estimatedYield: req.harvesting_plan_details?.estimated_yield || req.estimatedYield || 'N/A',
            farmSize: req.harvesting_plan_details?.farm_size || req.farmSize || 'N/A',
            laborRequirement: req.harvesting_plan_details?.labor_requirement || req.laborRequirement || 'N/A',
            marketTarget: req.harvesting_plan_details?.market_target || req.marketTarget || 'N/A',
            priority: req.priority || 'medium',
            notes: req.notes || ''
          })),
          ...ipmRoutineRequests.map(req => ({
            ...req,
            type: 'IPM Routine',
            service_type: 'ipm_routine',
            farmerName: selfName,
            farmerPhone: selfPhone,
            farmerEmail: selfEmail,
            farmerLocation: profileLocationString && profileLocationString !== 'N/A' ? profileLocationString : (req.location ? formatLocation(req.location) : 'N/A'),
            submittedAt: req.created_at || req.submittedAt,
            requestNumber: req.request_number || req.id || req._id,
            scheduledDate: req.ipm_routine_details?.scheduled_date || req.scheduledDate || 'N/A',
            farmSize: req.ipm_routine_details?.farm_size || req.farmSize || 'N/A',
            pestTypes: req.ipm_routine_details?.pest_type || req.pestType || [],
            ipmMethods: req.ipm_routine_details?.ipm_method || req.ipmMethod || [],
            laborRequired: req.ipm_routine_details?.labor_required || req.laborRequired || 'N/A',
            targetArea: req.ipm_routine_details?.target_area || req.targetArea || 'N/A',
            priority: req.priority || 'medium',
            notes: req.notes || ''
          }))
        ];

        setRequests(allRequests);
        localStorage.setItem('farmerServiceRequests', JSON.stringify(allRequests));

        const failedSources = results
          .map((r, i) => ({ r, name: ['property evaluation', 'harvest', 'pest management', 'harvesting plan', 'IPM routine'][i] }))
          .filter(({ r }) => r.status === 'rejected');
        if (failedSources.length > 0) {
          console.error('Some request sources failed to load:', failedSources.map(f => f.name));
        }

      } catch (apiError) {
        const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
        setRequests(localRequests);
        setError(localRequests.length === 0
          ? 'Unable to load your service requests. Please check your connection and try again.'
          : 'Showing your last saved requests — unable to refresh from the server right now.');
      }

    } catch (error) {
      const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
      setRequests(localRequests);
      setError(localRequests.length === 0
        ? 'Unable to load your service requests. Please check your connection and try again.'
        : 'Showing your last saved requests — unable to refresh from the server right now.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-[#ecfdf3] text-[#12b76a] border border-[#d1fadf]';
      case 'pending': return 'bg-[#fff9e6] text-[#f3a000] border border-[#ffe199]';
      case 'postponed': case 'on hold': return 'bg-[#f2f4f7] text-[#344054] border border-[#eaecf0]';
      case 'rejected': return 'bg-[#fef3f2] text-[#f04438] border border-[#fee4e2]';
      default: return 'bg-[#f8f9fa] text-[#475467] border border-[#e4e7ec]';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      case 'postponed': return <Clock className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return isNaN(d) ? 'N/A' : d.toISOString().split('T')[0];
  };

  const getServiceTypeLabel = (request) => {
    if (!request) return 'Service';
    if (request.service_type === 'harvest' || request.type === 'Harvesting Day') return 'Harvesting Day';
    if (request.service_type === 'pest_management' || request.type === 'Pest Management') return 'Pest Management';
    if (request.service_type === 'property_evaluation' || request.type === 'Property Evaluation') return 'Property Evaluation';
    if (request.service_type === 'harvesting_plan' || request.type === 'Harvesting Plan') return 'Harvesting Plan';
    if (request.service_type === 'ipm_routine' || request.type === 'IPM Routine') return 'IPM Routine';
    return request.type || 'Service';
  };

  const getStatusBadge = (status) => {
    const label = status ? status.replace(/_/g, ' ') : 'pending';
    const colorClass = status === 'approved'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'pending'
      ? 'bg-amber-100 text-amber-700'
      : status === 'in_progress'
      ? 'bg-sky-100 text-sky-700'
      : status === 'completed'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'rejected'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-slate-100 text-slate-700';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
        {label}
      </span>
    );
  };

  const toggleSelectRow = (id) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter(rowId => rowId !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredRequests.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredRequests.map(req => req.id));
    }
  };

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus;
    const typeMatch = filterType === 'all' || request.type === filterType;
    const searchMatch = searchQuery.trim() === '' ||
      (request.id && request.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.type && request.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.farmerName && request.farmerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return statusMatch && typeMatch && searchMatch;
  });

  const renderDynamicFormRows = (request) => {
    if (!request) return null;
    const labelStyle = "text-sm font-semibold text-[#344054] mb-1.5 block font-['Poppins']";
    const inputStyle = "w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] placeholder-gray-400 focus:outline-none shadow-xs font-['Poppins']";

    switch (request.type) {
      case 'Pest Management':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Pests / Diseases</label>
                <input
                  type="text"
                  readOnly
                  value={Array.isArray(request.pestsDiseases) && request.pestsDiseases.length > 0
                    ? request.pestsDiseases.map(p => p.name).filter(Boolean).join(', ')
                    : 'N/A'}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Severity Level</label>
                <input type="text" readOnly value={request.severityLevel || 'N/A'} className={`${inputStyle} capitalize`} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>First Noticed</label>
                <input type="text" readOnly value={request.firstNoticed || 'N/A'} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Control Methods Already Tried</label>
                <input type="text" readOnly value={request.controlMethodsTried || 'N/A'} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Damage Details</label>
              <textarea readOnly rows={3} value={request.damageDetails || 'No descriptive text assigned.'} className={`${inputStyle} resize-none`} />
            </div>
          </>
        );
      case 'Harvesting Day':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Labor Force Count Required</label>
                <input type="text" readOnly value={request.workersNeeded || '0'} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Operational Priority Level</label>
                <input type="text" readOnly value={request.priority || 'Standard'} className={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <div className="md:col-span-1">
                <label className={labelStyle}>Yield Trees</label>
                <input type="text" readOnly value={request.treesToHarvest || 'N/A'} className={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Active Windows Duration Dates</label>
                <input type="text" readOnly value={`${formatDate(request.harvestDateFrom)} — ${formatDate(request.harvestDateTo)}`} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Required Equipment Matrix</label>
              <input type="text" readOnly value={Array.isArray(request.equipmentNeeded) ? request.equipmentNeeded.join(', ') : request.equipmentNeeded || 'None'} className={inputStyle} />
            </div>
          </>
        );
      case 'Property Evaluation':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Evaluation Purpose</label>
                <input type="text" readOnly value={request.evaluationPurpose || 'N/A'} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Irrigation Source</label>
                <input type="text" readOnly value={request.irrigationSource || 'N/A'} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Visit Window</label>
              <input type="text" readOnly value={`${formatDate(request.visitStartDate)} — ${formatDate(request.visitEndDate)}`} className={inputStyle} />
            </div>
          </>
        );
      case 'Harvesting Plan':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Planned Harvest Date</label>
                <input type="text" readOnly value={formatDate(request.plannedHarvestDate)} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Estimated Yield</label>
                <input type="text" readOnly value={request.estimatedYield || 'N/A'} className={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Labor Requirement</label>
                <input type="text" readOnly value={request.laborRequirement || 'N/A'} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Market Target</label>
                <input type="text" readOnly value={request.marketTarget || 'N/A'} className={inputStyle} />
              </div>
            </div>
          </>
        );
      case 'IPM Routine':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Scheduled Date</label>
                <input type="text" readOnly value={formatDate(request.scheduledDate)} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Target Area</label>
                <input type="text" readOnly value={request.targetArea || 'N/A'} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Pest Types</label>
              <input type="text" readOnly value={Array.isArray(request.pestTypes) ? request.pestTypes.join(', ') : request.pestTypes || 'N/A'} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>IPM Methods</label>
              <input type="text" readOnly value={Array.isArray(request.ipmMethods) ? request.ipmMethods.join(', ') : request.ipmMethods || 'N/A'} className={inputStyle} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#475467] antialiased font-['Poppins']">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-y-6">

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs font-['Poppins']">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500 mt-0.5" />
              <p className="text-sm text-amber-900 font-medium">{error}</p>
            </div>
            <button onClick={loadRequests} className="flex-shrink-0 text-sm font-semibold text-amber-800 underline hover:text-amber-900">
              Retry
            </button>
          </div>
        )}

        {/* Utility Input Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-700 transition-colors font-['Poppins']"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-700 flex-1 sm:flex-none min-w-[130px] font-['Poppins']"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="postponed">Postponed</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-700 flex-1 sm:flex-none min-w-[160px] font-['Poppins']"
            >
              <option value="all">All Service Types</option>
              <option value="Harvesting Day">Harvesting Day</option>
              <option value="Property Evaluation">Property Evaluation</option>
              <option value="Pest Management">Pest Management</option>
              <option value="Harvesting Plan">Harvesting Plan</option>
              <option value="IPM Routine">IPM Routine</option>
            </select>

            <button
              onClick={loadRequests}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-2xs hover:bg-gray-50 flex-1 sm:flex-none font-['Poppins']"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Selection Actions Control Bar Layout */}
        {selectedRowIds.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-3xs animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3 text-sm text-gray-900 font-medium">
              <div className="w-5 h-5 bg-black text-white rounded flex items-center justify-center text-[10px]">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>{selectedRowIds.length} items selected</span>
              <span className="text-gray-300">|</span>
              <button onClick={toggleSelectAll} className="text-xs text-gray-500 hover:text-black font-semibold bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100">
                {selectedRowIds.length === filteredRequests.length ? 'Deselect All' : 'Select all items'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs">
                <Download className="w-3.5 h-3.5 text-gray-400" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setSelectedRowIds([])}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Request Datatable */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-t-green-700 border-gray-200 mb-3"></div>
              <p className="text-xs text-gray-400 font-medium">Fetching your service requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto">
              <ClipboardList className="mx-auto h-10 w-10 text-gray-300 stroke-[1.25]" />
              <h3 className="mt-4 text-sm font-bold text-gray-900">No requests found</h3>
              <p className="mt-1 text-xs text-gray-400">
                You haven't submitted any service requests matching these filters yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#fcfcfd]">
                  <tr className="divide-x divide-transparent">
                    <th className="w-12 px-4 py-4 text-left">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={filteredRequests.length > 0 && selectedRowIds.length === filteredRequests.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded-full border-gray-300 text-green-700 focus:ring-green-600 cursor-pointer accent-green-700"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer select-none">
                        Farmer <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Service</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Location</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer select-none">
                        Submitted <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Priority</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Status</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-[#475467] tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-[13px] text-[#475467]">
                  {filteredRequests.map((request) => {
                    const isSelected = selectedRowIds.includes(request.id);
                    const rowKey = `${request.requestNumber || request.id || request._id}-${request.type || 'unknown'}-${request.submittedAt || 'noDate'}`;
                    return (
                      <tr key={rowKey} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-green-50/20' : ''}`}>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(request.id)}
                              className="w-4 h-4 rounded-full border-gray-300 text-green-700 focus:ring-green-600 cursor-pointer accent-green-700"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          {request.farmerName || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                          {request.type}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 max-w-[200px] truncate">
                          {request.farmerLocation || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#1d2939]">
                          {formatDate(request.submittedAt)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-900 capitalize">
                          {request.priority || 'medium'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                            {request.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <button
                            onClick={() => openRequestModal(request)}
                            className="p-1 rounded-md text-gray-400 hover:text-green-700 hover:bg-gray-100/80 transition-all inline-flex items-center justify-center"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Control Pagination Block */}
          <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div>
              Showing <span className="text-gray-900 font-semibold">1-{filteredRequests.length}</span> of <span className="text-gray-900 font-semibold">{filteredRequests.length}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-40" disabled>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
                <span>Previous</span>
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition-colors shadow-2xs disabled:opacity-40" disabled>
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-[#0c111d]/40 backdrop-blur-xs overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 max-h-[92vh] overflow-y-auto animate-in fade-in duration-200">

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Request Specs</span>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {getServiceTypeLabel(selectedRequest)} {selectedRequest.requestNumber ? `#${selectedRequest.requestNumber}` : selectedRequest.request_number ? `#${selectedRequest.request_number}` : ''}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Farmer Information</h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-semibold text-slate-900">{selectedRequest.farmerName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-medium text-slate-900">{selectedRequest.farmerPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-900">{selectedRequest.farmerEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-right text-slate-900 max-w-[220px] truncate">{selectedRequest.farmerLocation || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Metadata</h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Category:</span>
                      <span className="font-semibold text-slate-900 capitalize">{getServiceTypeLabel(selectedRequest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Submitted Date:</span>
                      <span className="font-medium text-slate-900">{formatDate(selectedRequest.submittedAt)}</span>
                    </div>
                    {selectedRequest.rescheduleDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Postponed Date:</span>
                        <span className="font-semibold text-orange-600">{formatDate(selectedRequest.rescheduleDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Specific Requirements & Notes</h3>
                {renderDynamicFormRows(selectedRequest) || (
                  <p className="text-slate-600">No additional request details are available for this service type.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <span className="text-slate-500 block mb-2">Submitted On</span>
                  <span className="font-semibold text-slate-900">{formatDate(selectedRequest.submittedAt)}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <span className="text-slate-500 block mb-2">Priority</span>
                  <span className="font-semibold text-slate-900 capitalize">{selectedRequest.priority || 'medium'}</span>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <span className="text-slate-500 block mb-2">Status</span>
                  <span className="font-semibold text-slate-900 capitalize">{selectedRequest.status || 'pending'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={closeModal}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-2xl transition-colors"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}