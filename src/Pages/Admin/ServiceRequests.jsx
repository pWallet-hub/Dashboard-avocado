import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Filter, Search, Calendar, User, MapPin, Phone, Mail, Database } from 'lucide-react';
import '../Styles/Admin.css';
import { populateDemoData, hasDemoData } from '../../utils/demoData';

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Load requests from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('farmerServiceRequests');
    if (savedRequests) {
      const parsedRequests = JSON.parse(savedRequests);
      setRequests(parsedRequests);
      setFilteredRequests(parsedRequests);
    }
  }, []);

  // Filter and search requests
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(request => request.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.farmerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.farmerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.type && request.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRequests(filtered);
  }, [requests, filterStatus, filterType, searchTerm]);

  const updateRequestStatus = (requestId, newStatus) => {
    const updatedRequests = requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus, updatedAt: new Date().toISOString() }
        : request
    );
    
    setRequests(updatedRequests);
    localStorage.setItem('farmerServiceRequests', JSON.stringify(updatedRequests));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
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

  const RequestModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Service Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farmer Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Farmer Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900">{request.farmerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {request.farmerPhone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {request.farmerEmail}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {request.farmerLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Request Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Request Information
            </h3>
            <div className="space-y-3">
                             <div>
                 <label className="text-sm font-medium text-gray-600">Service Type</label>
                 <p className="text-gray-900 font-semibold">{request.type}</p>
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
            </div>
          </div>
        </div>

        {/* Service Specific Details */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
          
                     {request.type === 'Pest Management' && (
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
               {request.images && request.images.length > 0 && (
                 <div>
                   <label className="text-sm font-medium text-gray-600">Images</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                     {request.images.map((image, index) => (
                       <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                         <span className="text-xs text-gray-500">Image {index + 1}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           )}

                                {request.type === 'Harvesting Day' && (
             <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium text-gray-600">Workers Needed</label>
                   <p className="text-gray-900">{request.workersNeeded || 'N/A'}</p>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-600">Equipment Needed</label>
                   <p className="text-gray-900">
                     {(request.equipmentNeeded || []).length > 0 
                       ? request.equipmentNeeded.join(', ') 
                       : 'No equipment needed'}
                   </p>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-600">Transportation</label>
                   <p className="text-gray-900">{request.transportationNeeded || 'N/A'}</p>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-600">Harvest Period</label>
                   <p className="text-gray-900">
                     {request.harvestDateFrom || 'N/A'} to {request.harvestDateTo || 'N/A'}
                   </p>
                 </div>
               </div>
               {request.harvestImages && request.harvestImages.length > 0 && (
                 <div>
                   <label className="text-sm font-medium text-gray-600">Crop Images</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                     {request.harvestImages.map((image, index) => (
                       <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                         <span className="text-xs text-gray-500">Image {index + 1}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           )}

                                {request.type === 'Property Evaluation' && (
             <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="text-sm font-medium text-gray-600">Irrigation Upgrade</label>
                   <p className="text-gray-900">{request.irrigationSource || 'N/A'}</p>
                 </div>
                 {request.irrigationTiming && (
                   <div>
                     <label className="text-sm font-medium text-gray-600">Upgrade Timing</label>
                     <p className="text-gray-900">{request.irrigationTiming}</p>
                   </div>
                 )}
                 <div>
                   <label className="text-sm font-medium text-gray-600">Soil Testing</label>
                   <p className="text-gray-900">{request.soilTesting || 'N/A'}</p>
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-600">Visit Period</label>
                   <p className="text-gray-900">
                     {request.visitStartDate || 'N/A'} to {request.visitEndDate || 'N/A'}
                   </p>
                 </div>
               </div>
               <div>
                 <label className="text-sm font-medium text-gray-600">Evaluation Purpose</label>
                 <p className="text-gray-900">{request.evaluationPurpose || 'N/A'}</p>
               </div>
             </div>
           )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          {request.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  updateRequestStatus(request.id, 'approved');
                  onClose();
                }}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  updateRequestStatus(request.id, 'rejected');
                  onClose();
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          {request.status === 'approved' && (
            <button
              onClick={() => {
                updateRequestStatus(request.id, 'completed');
                onClose();
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark as Completed
            </button>
          )}
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
            {!hasDemoData() && (
              <button
                onClick={() => {
                  populateDemoData();
                  window.location.reload();
                }}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="w-4 h-4 mr-2" />
                Load Demo Data
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, email..."
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
                <option value="Pest Management">Pest Management</option>
                <option value="Harvesting Day">Harvesting Day</option>
                <option value="Property Evaluation">Property Evaluation</option>
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

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
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
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.farmerName}</div>
                          <div className="text-sm text-gray-500">{request.farmerPhone}</div>
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                         <span className="text-sm text-gray-900">{request.type}</span>
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

      {/* Request Detail Modal */}
      {showModal && selectedRequest && (
        <RequestModal
          request={selectedRequest}
          onClose={() => {
            setShowModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
