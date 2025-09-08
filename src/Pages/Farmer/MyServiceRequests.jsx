import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, Eye, Calendar, User, MapPin, Bell } from 'lucide-react';
import DashboardHeader from '../../components/Header/DashboardHeader';
import { getServiceRequestsForFarmer } from '../../services/serviceRequestsService';

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
      // Get farmer ID from localStorage (in a real app, this would come from auth context)
      const user = JSON.parse(localStorage.getItem('user'));
      const farmerId = user?.id || 'farmer1'; // Fallback to 'farmer1' for demo
      
      const response = await getServiceRequestsForFarmer(farmerId);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading service requests:', error);
      // Fallback to localStorage if API fails
      const savedRequests = localStorage.getItem('farmerServiceRequests');
      if (savedRequests) {
        const allRequests = JSON.parse(savedRequests);
        // Assuming farmerId for filtering, default to 'farmer1' for demo
        const farmerRequests = allRequests.filter(request => request.farmerId === 'farmer1');
        setRequests(farmerRequests);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem('farmerNotifications');
    if (savedNotifications) {
      const allNotifications = JSON.parse(savedNotifications);
      // Filter notifications for the current farmer
      const farmerNotifications = allNotifications.filter(n => n.farmerId === 'farmer1');
      setNotifications(farmerNotifications);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('farmerNotifications', JSON.stringify(updatedNotifications));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus;
    const typeMatch = filterType === 'all' || request.type === filterType;
    return statusMatch && typeMatch;
  });

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

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
              className="flex items-center text-gray-600 hover:text-gray-900"
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 mb-2 rounded-md ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.timestamp)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
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
                    <tr key={request.id} className="hover:bg-gray-50">
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
                          className="text-green-600 hover:text-green-900 flex items-center"
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
                  className="text-gray-400 hover:text-gray-600"
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
                        <span className="ml-2">{selectedRequest.farmerName}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{selectedRequest.farmerLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Specific Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                  <div className="text-sm text-gray-700">
                    {selectedRequest.type === 'Pest Management' && (
                      <div className="space-y-2">
                        <p><span className="font-medium">Pest Type:</span> {selectedRequest.pestType || 'N/A'}</p>
                        <p><span className="font-medium">Infestation Level:</span> {selectedRequest.infestationLevel || 'N/A'}</p>
                        <p><span className="font-medium">Crop Type:</span> {selectedRequest.cropType || 'N/A'}</p>
                        <p><span className="font-medium">Farm Size:</span> {selectedRequest.farmSize || 'N/A'}</p>
                        <p><span className="font-medium">Description:</span> {selectedRequest.description || 'N/A'}</p>
                      </div>
                    )}
                    
                    {selectedRequest.type === 'Harvesting Day' && (
                      <div className="space-y-2">
                        <p><span className="font-medium">Workers Needed:</span> {selectedRequest.workersNeeded || 'N/A'}</p>
                        <p><span className="font-medium">Equipment:</span> {selectedRequest.equipmentNeeded || 'N/A'}</p>
                        <p><span className="font-medium">Transportation:</span> {selectedRequest.transportationNeeded || 'N/A'}</p>
                        <p><span className="font-medium">Harvest Period:</span> {selectedRequest.harvestDateFrom || 'N/A'} to {selectedRequest.harvestDateTo || 'N/A'}</p>
                      </div>
                    )}
                    
                    {selectedRequest.type === 'Property Evaluation' && (
                      <div className="space-y-2">
                        <p><span className="font-medium">Irrigation:</span> {selectedRequest.irrigationSource || 'N/A'}</p>
                        <p><span className="font-medium">Soil Testing:</span> {selectedRequest.soilTesting || 'N/A'}</p>
                        <p><span className="font-medium">Visit Period:</span> {selectedRequest.visitStartDate || 'N/A'} to {selectedRequest.visitEndDate || 'N/A'}</p>
                        <p><span className="font-medium">Evaluation Purpose:</span> {selectedRequest.evaluationPurpose || 'N/A'}</p>
                      </div>
                    )}
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
                            <p className="text-gray-900">{update.status}</p>
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