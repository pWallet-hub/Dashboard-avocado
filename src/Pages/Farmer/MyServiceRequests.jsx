import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, Eye, Calendar, User, MapPin, AlertTriangle, ArrowUpDown, RefreshCw, X, Search, SlidersHorizontal, MoreHorizontal, ChevronLeft, ChevronRight, Download, Check } from 'lucide-react';
import DashboardHeader from '../../components/Header/DashboardHeader';
import { getServiceRequestsForFarmer, listHarvestRequests } from '../../services/serviceRequestsService';

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
  }, []);

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
      
      try {
        const results = await Promise.allSettled([
          getServiceRequestsForFarmer(cleanFarmerId, { limit: 100 }),
          listHarvestRequests({ farmer_id: cleanFarmerId, limit: 100 })
        ]);

        let regularRequests = [];
        let harvestRequestsResult = { data: [] };

        if (results[0].status === 'fulfilled') {
          regularRequests = results[0].value || [];
        }

        if (results[1].status === 'fulfilled') {
          harvestRequestsResult = results[1].value || { data: [] };
        }
        
        const allRequests = [
          ...(regularRequests || []),
          ...(harvestRequestsResult?.data || []).map(req => ({
            ...req,
            type: req.service_type === 'harvest' ? 'Harvesting Day' : req.service_type,
            farmerName: req.farmer_id?.full_name,
            farmerPhone: req.farmer_id?.phone,
            farmerEmail: req.farmer_id?.email,
            farmerLocation: req.location ? `${req.location.village || ''}, ${req.location.cell || ''}, ${req.location.sector || ''}, ${req.location.district || ''}, ${req.location.province || ''}`.replace(/,\s*,/g, ',').replace(/^,|,$/g, '') : 'N/A',
            submittedAt: req.created_at,
            workersNeeded: req.workersNeeded || req.harvest_details?.workers_needed,
            equipmentNeeded: req.equipmentNeeded || req.harvest_details?.equipment_needed,
            treesToHarvest: req.treesToHarvest || req.harvest_details?.trees_to_harvest,
            harvestDateFrom: req.harvestDateFrom || req.harvest_details?.harvest_date_from,
            harvestDateTo: req.harvestDateTo || req.harvest_details?.harvest_date_to,
            hassBreakdown: req.hassBreakdown || req.harvest_details?.hass_breakdown,
            harvestImages: req.harvestImages || req.harvest_details?.harvest_images,
            priority: req.priority,
            notes: req.notes
          }))
        ];
        
        setRequests(allRequests);
        localStorage.setItem('farmerServiceRequests', JSON.stringify(allRequests));
        
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
    return new Date(dateString).toISOString().split('T')[0];
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
                <label className={labelStyle}>Pest Classification</label>
                <input type="text" readOnly value={request.pestType || 'N/A'} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Infestation Level</label>
                <input type="text" readOnly value={request.infestationLevel || 'N/A'} className={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelStyle}>Crop Type</label>
                <input type="text" readOnly value={request.cropType || 'N/A'} className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Farm Surface Size</label>
                <input type="text" readOnly value={request.farmSize || 'N/A'} className={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelStyle}>Incident Field Description</label>
              <textarea readOnly rows={3} value={request.description || 'No descriptive text assigned.'} className={`${inputStyle} resize-none`} />
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

            <button 
              onClick={loadRequests}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-2xs hover:bg-gray-50 flex-1 sm:flex-none font-['Poppins']"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span>All Status</span>
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
              <button className="bg-[#ecfdf3] hover:bg-[#d1fadf] text-[#12b76a] border border-[#d1fadf] text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
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
              <p className="text-xs text-gray-400 font-medium">Fetching secure transaction rows...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-24 text-center max-w-sm mx-auto">
              <ClipboardList className="mx-auto h-10 w-10 text-gray-300 stroke-[1.25]" />
              <h3 className="mt-4 text-sm font-bold text-gray-900">No requests cataloged</h3>
              <p className="mt-1 text-xs text-gray-400">
                No telemetry data entries map accurately to your current parameters.
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
                        Requests ID <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer select-none">
                        Customer ID <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Service</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Provider</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer select-none">
                        Event Date <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer select-none">
                        Amount <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-[#475467] tracking-wider">Status</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-[#475467] tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-[13px] text-[#475467]">
                  {filteredRequests.map((request) => {
                    const isSelected = selectedRowIds.includes(request.id);
                    return (
                      <tr key={request.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-green-50/20' : ''}`}>
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
                        <td className="px-4 py-3.5 font-medium text-gray-400 whitespace-nowrap">
                          {request.id ? `REQ-${request.id.slice(-3).toUpperCase()}` : 'REQ-000'}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          {request.farmerName || 'Anonymous Account'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                          {request.type}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-500">
                          {request.workersNeeded ? `${request.workersNeeded} Workers Unit` : 'Standard Ops'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-medium text-[#1d2939]">
                          {formatDate(request.submittedAt)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-900">
                          {request.farmSize ? `${request.farmSize}` : '$450'}
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

      {/* Profile Form Modal Layout Block */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-[#0c111d]/40 backdrop-blur-xs overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto w-full max-w-2xl bg-[#f9fafb] rounded-xl shadow-xl border border-[#eaecf0] p-6 md:p-8 flex flex-col max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-[#667085] hover:text-[#344054] p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Name</label>
                  <input type="text" readOnly value={selectedRequest.farmerName || ''} placeholder="Your name" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Email</label>
                  <input type="text" readOnly value={selectedRequest.farmerEmail || ''} placeholder="Your Email" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Card Details</label>
                <input type="text" readOnly value={selectedRequest.id || ''} placeholder="XXXX-XXXX-XXXX-XXXX" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm font-mono text-[#475467] focus:outline-none shadow-xs font-['Poppins']" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Street Number</label>
                  <input type="text" readOnly value={selectedRequest.farmerLocation?.split(',')[0] || ''} placeholder="Your Street Number" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">City</label>
                  <input type="text" readOnly value={selectedRequest.farmerLocation?.split(',')[2] || ''} placeholder="Your City" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Country</label>
                  <input type="text" readOnly value={selectedRequest.farmerLocation?.split(',').pop() || ''} placeholder="Your Country" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Company Name</label>
                <input type="text" readOnly value={selectedRequest.type || ''} placeholder="Your Company Name" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm font-semibold text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#344054] mb-1.5 font-['Poppins']">Email address</label>
                <input type="text" readOnly value={selectedRequest.farmerPhone || ''} placeholder="Email address" className="w-full bg-white border border-[#e4e7ec] rounded-lg px-4 py-3 text-sm text-[#1d2939] focus:outline-none shadow-xs font-['Poppins']" />
              </div>

              <div className="space-y-4 pt-1">
                {renderDynamicFormRows(selectedRequest)}
              </div>

              {/* Subtotal Checkout Calculations Block */}
              <div className="pt-4 space-y-2 text-sm text-[#344054] border-t border-[#eaecf0] font-['Poppins']">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1d2939]">{formatDate(selectedRequest.submittedAt)}</span>
                </div>
                <div className="flex justify-between items-center text-[#475467]">
                  <span>Discount</span>
                  <span className="text-[#f04438] font-medium">-{selectedRequest.priority || 'Standard'}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1d2939] pt-1">
                  <span>Subtotal</span>
                  <span className="text-[#1d2939] font-bold tracking-wide">
                    {selectedRequest.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Primary Theme Action Button */}
              <div className="pt-2">
                <button
                  onClick={closeModal}
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-base font-semibold py-3 px-4 rounded-lg transition-colors shadow-xs text-center font-['Poppins']"
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}