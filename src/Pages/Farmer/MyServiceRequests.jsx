import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, Eye, Calendar, User, MapPin, Bell } from 'lucide-react';
import DashboardHeader from '../../components/Header/DashboardHeader';
import { getPestManagementRequests, getHarvestRequests, getPropertyEvaluationRequests } from '../../services/serviceRequestsService';

export default function MyServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
    loadNotifications();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Get authentication info first
      const authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      const userString = localStorage.getItem('user');
      
      console.log('=== AUTHENTICATION DEBUG ===');
      console.log('Auth token exists:', !!authToken);
      console.log('User string exists:', !!userString);
      
      if (!authToken) {
        console.error('No authentication token found');
        // Redirect to login or show authentication error
        setRequests([]);
        return;
      }
      
      let user = null;
      try {
        user = userString ? JSON.parse(userString) : null;
        console.log('Parsed user:', user);
      } catch (parseError) {
        console.error('Failed to parse user from localStorage:', parseError);
      }
      
      // Get farmer ID with multiple fallback strategies
      let farmerId = user?.id || user?._id || user?.user_id;
      
      if (!farmerId) {
        // Try alternative storage locations
        farmerId = localStorage.getItem('farmerId') || 
                  localStorage.getItem('userId') || 
                  localStorage.getItem('currentUserId');
                  
        // Try parsing currentUser if it exists
        const currentUser = localStorage.getItem('currentUser');
        if (!farmerId && currentUser) {
          try {
            const parsedCurrentUser = JSON.parse(currentUser);
            farmerId = parsedCurrentUser?.id || parsedCurrentUser?._id || parsedCurrentUser?.user_id;
          } catch (e) {
            console.error('Failed to parse currentUser:', e);
          }
        }
      }
      
      console.log('Final farmer ID:', farmerId);
      console.log('Farmer ID type:', typeof farmerId);
      console.log('Farmer ID length:', farmerId?.length);
      
      if (!farmerId || farmerId === 'undefined' || farmerId === 'null') {
        console.error('No valid farmer ID found');
        // Try to use only localStorage data
        const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
        setRequests(localRequests);
        return;
      }
      
      // Clean and validate farmer ID
      let cleanFarmerId = String(farmerId).trim();
      
      // Check if the farmer ID is truncated or incomplete
      console.log('Clean farmer ID:', cleanFarmerId);
      console.log('Clean farmer ID length:', cleanFarmerId.length);
      
      // Validate farmer ID format (should be MongoDB ObjectId)
      const objectIdRegex = /^[a-f\d]{24}$/i;
      
      if (!objectIdRegex.test(cleanFarmerId)) {
        console.error('Invalid MongoDB ObjectId format:', cleanFarmerId);
        console.error('Expected: 24 character hexadecimal string (e.g., 507f1f77bcf86cd799439011)');
        console.error('Received length:', cleanFarmerId.length);
        
        // Check if it's a truncated ID
        if (cleanFarmerId.length < 24 && cleanFarmerId.length > 10) {
          console.error('ID appears to be truncated. Full ID might be stored elsewhere.');
          
          // Try to find the full ID in user object
          if (user && typeof user === 'object') {
            console.log('Searching user object for complete ID:', user);
            // Try different possible ID fields
            const possibleIds = [
              user.id, user._id, user.userId, user.user_id, 
              user.farmerId, user.farmer_id, user.uid
            ];
            
            for (const possibleId of possibleIds) {
              if (possibleId && typeof possibleId === 'string' && objectIdRegex.test(possibleId)) {
                console.log('Found valid ObjectId:', possibleId);
                cleanFarmerId = possibleId;
                break;
              }
            }
          }
        }
        
        // If still invalid, fallback to localStorage
        if (!objectIdRegex.test(cleanFarmerId)) {
          console.error('Could not find valid farmer ID, using localStorage fallback');
          const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
          setRequests(localRequests);
          return;
        }
      }
      
      console.log('Making API calls with validated farmer ID:', cleanFarmerId);
      
      try {
        // Use Promise.allSettled to handle individual failures
        const results = await Promise.allSettled([
          getServiceRequestsForFarmer(cleanFarmerId, { limit: 100 }),
          listHarvestRequests({ farmer_id: cleanFarmerId, limit: 100 })
        ]);

        console.log('API Results:', results);

        let regularRequests = [];
        let harvestRequestsResult = { data: [] };

        if (results[0].status === 'fulfilled') {
          regularRequests = results[0].value || [];
        } else {
          console.error('=== Regular Service Requests API Error ===');
          const error = results[0].reason;
          console.error('Full error object:', error);
          console.error('Error message:', error?.message);
          
          // Better error response extraction
          if (error?.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
            console.error('Error response text:', error.response.statusText);
          } else if (error?.status) {
            console.error('Error status:', error.status);
            console.error('Error data:', error.data);
          }
          
          // Specific error handling
          if (error?.message === 'Validation failed') {
            console.error('VALIDATION FAILED - This means the farmer ID format is wrong');
            console.error('Current farmer ID being sent:', cleanFarmerId);
            console.error('Expected format: 24-character MongoDB ObjectId (e.g., 507f1f77bcf86cd799439011)');
            
            // Check if we can extract the issue
            if (cleanFarmerId.length !== 24) {
              console.error(`ID LENGTH ISSUE: Expected 24 characters, got ${cleanFarmerId.length}`);
              console.error('This is likely why validation is failing');
            }
          }
        }

        if (results[1].status === 'fulfilled') {
          harvestRequestsResult = results[1].value || { data: [] };
        } else {
          console.error('=== Harvest Requests API Error ===');
          const error = results[1].reason;
          console.error('Error message:', error?.message);
          console.error('Error response:', error?.response?.data);
        }
        
        // Combine and format requests
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
            // Map harvest-specific fields - handle both old and new structure
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
        
        console.log('Successfully loaded requests:', allRequests.length);
        setRequests(allRequests);
        
        // Also update localStorage as backup
        localStorage.setItem('farmerServiceRequests', JSON.stringify(allRequests));
        
      } catch (apiError) {
        console.error('=== Critical API Error ===');
        console.error('Error details:', apiError);
        
        // Fallback to localStorage
        const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
        console.log('Using localStorage fallback:', localRequests.length, 'requests');
        setRequests(localRequests);
      }
      
    } catch (error) {
      console.error('=== Function Error ===');
      console.error('Error in loadRequests:', error);
      
      // Final fallback to localStorage
      const localRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
      setRequests(localRequests);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    // Load notifications from localStorage or initialize with empty array
    const savedNotifications = localStorage.getItem('farmerNotifications');
    const farmerNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
    setNotifications(farmerNotifications);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'postponed': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('farmerNotifications', JSON.stringify(updatedNotifications));
  };

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
  };

  // Computed values
  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus;
    const typeMatch = filterType === 'all' || request.type === filterType;
    return statusMatch && typeMatch;
  });

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const renderServiceDetails = (request) => {
    if (!request) return null;

    switch (request.type) {
      case 'Pest Management':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Pest Type:</span> {request.pestType || 'N/A'}</p>
            <p><span className="font-medium">Infestation Level:</span> {request.infestationLevel || 'N/A'}</p>
            <p><span className="font-medium">Crop Type:</span> {request.cropType || 'N/A'}</p>
            <p><span className="font-medium">Farm Size:</span> {request.farmSize || 'N/A'}</p>
            <p><span className="font-medium">Description:</span> {request.description || 'N/A'}</p>
          </div>
        );

      case 'Harvesting Day':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Workers Needed:</span> {request.workersNeeded || 'N/A'}</p>
            <p><span className="font-medium">Equipment:</span> {
              Array.isArray(request.equipmentNeeded) 
                ? request.equipmentNeeded.join(', ') 
                : request.equipmentNeeded || 'N/A'
            }</p>
            <p><span className="font-medium">Trees to Harvest:</span> {request.treesToHarvest || request.transportationNeeded || 'N/A'}</p>
            <p><span className="font-medium">Harvest Period:</span> {formatDate(request.harvestDateFrom)} to {formatDate(request.harvestDateTo)}</p>
            <p><span className="font-medium">Priority:</span> <span className="capitalize">{request.priority || 'N/A'}</span></p>
            {request.notes && (
              <p><span className="font-medium">Notes:</span> {request.notes}</p>
            )}
            {request.hassBreakdown && (
              <p><span className="font-medium">HASS Breakdown:</span> {
                request.hassBreakdown.selectedSizes 
                  ? request.hassBreakdown.selectedSizes.map(size => 
                      `${size.toUpperCase()}: ${request.hassBreakdown[size] || 0}%`
                    ).join(', ')
                  : Object.entries(request.hassBreakdown)
                      .filter(([key]) => key !== 'selectedSizes')
                      .map(([key, value]) => `${key.toUpperCase()}: ${value}%`)
                      .join(', ') || 'N/A'
              }</p>
            )}
          </div>
        );

      case 'Property Evaluation':
        return (
          <div className="space-y-2">
            <p><span className="font-medium">Irrigation:</span> {request.irrigationSource || 'N/A'}</p>
            <p><span className="font-medium">Soil Testing:</span> {request.soilTesting || 'N/A'}</p>
            <p><span className="font-medium">Visit Period:</span> {formatDate(request.visitStartDate)} to {formatDate(request.visitEndDate)}</p>
            <p><span className="font-medium">Evaluation Purpose:</span> {request.evaluationPurpose || 'N/A'}</p>
          </div>
        );

      default:
        return <p className="text-gray-500">No additional details available.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Service Requests</h1>
            <p className="text-gray-600">Track the status of your submitted service requests</p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bell className="w-6 h-6 mr-2" />
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={closeNotifications}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      <button
                        onClick={closeNotifications}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500">No notifications</p>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                              notification.read ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500">{formatDate(notification.timestamp)}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="Pest Management">Pest Management</option>
                <option value="Harvesting Day">Harvesting Day</option>
                <option value="Property Evaluation">Property Evaluation</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={loadRequests}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Service Requests ({filteredRequests.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading your service requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {requests.length === 0 
                  ? "You haven't submitted any service requests yet."
                  : "No requests match the current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.type}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {request.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openRequestModal(request)}
                          className="text-green-600 hover:text-green-900 flex items-center transition-colors"
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
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Service Request Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Request Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <ClipboardList className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Type:</span>
                        <span className="ml-2">{selectedRequest.type}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Submitted:</span>
                        <span className="ml-2">{formatDate(selectedRequest.submittedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                          {getStatusIcon(selectedRequest.status)}
                          <span className="ml-1 capitalize">{selectedRequest.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Farmer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Name:</span>
                        <span className="ml-2">{selectedRequest.farmerName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{selectedRequest.farmerLocation || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Specific Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                  <div className="text-sm text-gray-700">
                    {renderServiceDetails(selectedRequest)}
                  </div>
                </div>

                {/* Status Updates */}
                {selectedRequest.statusUpdates && selectedRequest.statusUpdates.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Status Updates</h4>
                    <div className="space-y-2">
                      {selectedRequest.statusUpdates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-900 capitalize">{update.status}</p>
                            <p className="text-gray-500">{formatDate(update.timestamp)}</p>
                            {update.note && <p className="text-gray-600 mt-1">{update.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}