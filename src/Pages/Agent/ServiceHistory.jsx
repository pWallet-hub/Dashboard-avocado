import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Calendar, Filter, Eye, 
  CheckCircle, Clock, XCircle, AlertCircle, 
  User, Phone, Mail, MapPin, Package, Leaf,
  TrendingUp, FileText, RefreshCw
} from 'lucide-react';
import { listHarvestRequests } from '../../services/serviceRequestsService';
import { getAgentInformation } from '../../services/agent-information';
import apiClient from '../../services/apiClient';

export default function ServiceHistory() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // Helper function to get agent ID from multiple sources
  const getAgentId = () => {
    const sources = [
      agentInfo?.agent_profile?.id,
      agentInfo?.user_info?.id,
      agentInfo?.id,
      localStorage.getItem('userId'),
      localStorage.getItem('agentId')
    ];

    for (const source of sources) {
      if (source) {
        console.log('✅ Found agent ID:', source);
        return source;
      }
    }

    console.warn('⚠️ No agent ID found');
    return null;
  };

  // Fetch agent info
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const data = await getAgentInformation();
        console.log('📋 Agent Info Response:', data);
        setAgentInfo(data);
      } catch (error) {
        console.error('❌ Error fetching agent info:', error);
        const fallbackInfo = {
          agent_profile: { id: localStorage.getItem('userId') }
        };
        setAgentInfo(fallbackInfo);
      }
    };
    fetchAgentInfo();
  }, []);

  // Fetch service requests
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const currentAgentId = getAgentId();
        
        if (!currentAgentId) {
          console.error('❌ No agent ID available');
          setRequests([]);
          setFilteredRequests([]);
          setLoading(false);
          return;
        }
        
        console.log('🔍 Fetching requests for agent ID:', currentAgentId);
        
        // USE NEW ENDPOINT: /service-requests/harvest/agent/me
        // This endpoint automatically filters by the authenticated agent's ID from JWT
        console.log('📤 Calling new agent-specific endpoint...');
        
        const response = await apiClient.get('/service-requests/harvest/agent/me', {
          params: { limit: 100 }
        });
        
        console.log('📥 API Response:', response.data);
        
        const requestsData = response.data?.data || [];
        console.log(`✅ Received ${requestsData.length} requests for current agent`);
        
        setRequests(requestsData);
        setFilteredRequests(requestsData);
      } catch (error) {
        console.error('❌ Error fetching history:', error);
        setRequests([]);
        setFilteredRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (agentInfo) {
      fetchRequests();
    }
  }, [agentInfo]);

  // Filter requests
  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(req =>
        req.request_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.farmer_info?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: TrendingUp },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };

    const c = config[status] || config.pending;
    const Icon = c.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600" />
            Service Request History
          </h1>
          <p className="text-gray-600 mt-2">
            Track all service requests you've created on behalf of farmers
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by request # or farmer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading service history...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No service requests found</p>
            
            {/* Simplified message while waiting for backend */}
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-300 max-w-3xl mx-auto">
              <p className="text-sm font-bold text-blue-900 mb-4">ℹ️ Backend Endpoint Required</p>
              
              <div className="text-left space-y-3 text-sm text-blue-800">
                <p>The agent service history feature requires a new backend endpoint:</p>
                <code className="block bg-white px-3 py-2 rounded border border-blue-200 text-xs">
                  GET /service-requests/harvest/agent/me
                </code>
                
                <div className="bg-white p-4 rounded border border-blue-200 mt-4">
                  <p className="font-semibold mb-2">📋 Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Share <code className="bg-gray-100 px-1">AGENT_ENDPOINT_GUIDE.md</code> with backend team</li>
                    <li>Backend team implements the endpoint</li>
                    <li>Test with Postman/cURL</li>
                    <li>Frontend will automatically work once endpoint is live</li>
                  </ol>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mt-4">
                  <p className="font-semibold text-yellow-900 mb-1">⚠️ Important:</p>
                  <p className="text-xs text-yellow-800">
                    The backend must also save <code className="bg-white px-1">agent_id</code> when creating harvest requests via POST endpoint.
                  </p>
                </div>
                
                <p className="text-xs text-gray-600 mt-4">
                  Your Agent ID: <code className="bg-white px-2 py-1 rounded border">{getAgentId()}</code>
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                to="/dashboard/agent/HarvestingPlan"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                <Package className="w-5 h-5" />
                Create Harvest Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Request #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Farmer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Service Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium">{request.request_number || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{request.farmer_info?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{request.farmer_info?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Harvest Request</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(request.requested_date || request.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Basic version */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Request Details</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Request Number</label>
                  <p className="text-base mt-1">{selectedRequest.request_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Farmer Name</label>
                  <p className="text-base mt-1">{selectedRequest.farmer_info?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-base mt-1">{selectedRequest.farmer_info?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
