import React, { useState, useEffect, useCallback } from 'react';
import { Trees, Search, Filter, UserCheck, MapPin, X, Layers, TrendingUp, CheckCircle } from 'lucide-react';
import { listFarms, getFarmsOverview, assignFarmAgent } from '../../services/farmsService';
import { listAgents } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';

const STATUS_OPTIONS = ['preparing', 'planted', 'growing', 'producing', 'harvesting', 'dormant'];

const getStatusColor = (status) => {
  switch (status) {
    case 'preparing': return 'bg-gray-200 text-gray-800 ring-gray-500';
    case 'planted': return 'bg-blue-200 text-blue-800 ring-blue-500';
    case 'growing': return 'bg-teal-200 text-teal-800 ring-teal-500';
    case 'producing': return 'bg-green-200 text-green-800 ring-green-500';
    case 'harvesting': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
    case 'dormant': return 'bg-orange-200 text-orange-800 ring-orange-500';
    default: return 'bg-gray-200 text-gray-800 ring-gray-500';
  }
};

const AdminFarms = () => {
  const toast = useToast();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });

  const [agents, setAgents] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const data = await getFarmsOverview();
      setOverview(data);
    } catch (err) {
      console.error('Error loading farms overview:', err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadFarms = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        page,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const response = await listFarms(options);
      setFarms(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error loading farms:', err);
      setError(err.message || 'Failed to load farms');
      setFarms([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadFarms(1);
  }, [loadFarms]);

  useEffect(() => {
    listAgents().then(data => setAgents(Array.isArray(data) ? data : [])).catch(() => setAgents([]));
  }, []);

  const safeFarms = Array.isArray(farms) ? farms : [];
  const filteredFarms = safeFarms.filter(farm => {
    if (!farm) return false;
    const name = (farm.farmName || farm.farm_name || '').toLowerCase();
    const farmerName = (farm.farmerName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return term === '' || name.includes(term) || farmerName.includes(term);
  });

  const openAssignModal = (farm) => {
    setAssignTarget(farm);
    setSelectedAgentId('');
  };

  const handleAssignAgent = async () => {
    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }
    setAssigning(true);
    try {
      await assignFarmAgent(assignTarget.id, selectedAgentId);
      setAssignTarget(null);
      await loadFarms(pagination.currentPage);
      toast.success('Agent assigned to farm');
    } catch (err) {
      console.error('Error assigning agent:', err);
      toast.error(err.message || 'Failed to assign agent');
    } finally {
      setAssigning(false);
    }
  };

  const overviewCards = [
    { label: 'Total Farms', value: overview?.total_farms ?? overview?.totalFarms ?? pagination.totalItems, icon: Trees, color: 'bg-green-100 text-green-700' },
    { label: 'Total Hectares', value: overview?.total_farm_size ?? overview?.totalFarmSize ?? overview?.total_hectares ?? 'N/A', icon: Layers, color: 'bg-blue-100 text-blue-700' },
    { label: 'Total Trees', value: overview?.total_trees ?? overview?.totalTrees ?? overview?.tree_count ?? 'N/A', icon: TrendingUp, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Producing Farms', value: overview?.producing_farms ?? overview?.producingFarms ?? 'N/A', icon: CheckCircle, color: 'bg-purple-100 text-purple-700' }
  ];

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <Trees className="h-7 w-7 mr-3 text-green-600" />
          Farms Oversight
        </h2>
        <p className="text-green-600 mt-1">Aggregate view of all registered farms across the platform</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-lg p-5 ring-1 ring-green-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{overviewLoading ? '...' : card.value}</p>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Search / Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search by farm or farmer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none transition-all"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-green-600">
              Total Farms: <span className="font-semibold">{pagination.totalItems}</span>
            </span>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">{error}</div>
        )}
      </div>

      {/* Farms Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading farms...</p>
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="p-8 text-center">
            <Trees className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium">No farms found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {filteredFarms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">{farm.farmName || farm.farm_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">{farm.farmerName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                        <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1 text-green-400" />{[farm.location?.district, farm.location?.province].filter(Boolean).join(', ') || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(farm.status)}`}>
                          {farm.status ? farm.status.charAt(0).toUpperCase() + farm.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openAssignModal(farm)}
                          className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
                          title="Assign Agent"
                        >
                          <UserCheck className="h-4 w-4 mr-1.5" />
                          Assign Agent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="bg-green-50 px-6 py-3 flex items-center justify-between border-t border-green-100">
                <div className="text-sm text-green-600">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} farms)
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => loadFarms(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => loadFarms(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Assign Agent Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Assign Agent</h3>
              <button onClick={() => setAssignTarget(null)} className="text-green-400 hover:text-green-600" aria-label="Close"><X className="h-6 w-6" /></button>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Farm: <span className="font-medium">{assignTarget.farmName || assignTarget.farm_name}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">Agent *</label>
              <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Select agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.full_name} ({a.email})</option>)}
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={() => setAssignTarget(null)} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all" disabled={assigning}>Cancel</button>
              <button onClick={handleAssignAgent} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all" disabled={assigning}>
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFarms;
