import React, { useState, useEffect, useCallback } from 'react';
import {
  Trees, Search, Filter, Eye, Edit, Archive, Plus, X, MapPin,
  Bug, Info, BarChart2, History, Sprout
} from 'lucide-react';
import {
  listFarms, createFarm, updateFarm, archiveFarm,
  getFarmDetails, getFarmProductionStats, getFarmHistory
} from '../../services/farmsService';
import {
  getFarmTreeSummary, listFarmTrees, addTreeRecord,
  listFarmTreeDiseases, reportTreeDisease, updateTreeDisease
} from '../../services/treesService';
import { listProvinces, listDistricts, listSectors, listCells, listVillages } from '../../services/geographyService';
import { listFarmers } from '../../services/usersService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const STATUS_OPTIONS = ['preparing', 'planted', 'growing', 'producing', 'harvesting', 'dormant'];
const HEALTH_OPTIONS = ['healthy', 'stressed', 'diseased', 'dead'];
const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

const emptyLocation = { province: '', district: '', sector: '', cell: '', village: '' };

const emptyNewFarm = {
  farmer_id: '',
  farm_name: '',
  farm_size: '',
  tree_count: '',
  varieties: '',
  planting_date: '',
  expected_harvest: '',
  crop_type: 'avocado',
  status: '',
  notes: '',
  location: { ...emptyLocation }
};

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

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'low': return 'bg-green-200 text-green-800 ring-green-500';
    case 'medium': return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
    case 'high': return 'bg-orange-200 text-orange-800 ring-orange-500';
    case 'critical': return 'bg-red-200 text-red-800 ring-red-500';
    default: return 'bg-gray-200 text-gray-800 ring-gray-500';
  }
};

// Cascading province -> district -> sector -> cell -> village selector.
// Stores the *names* on `location`, using ids only to fetch the next level's options.
const LocationCascadeFields = ({ location, onChange }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);

  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [cellId, setCellId] = useState('');

  useEffect(() => {
    listProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  const handleProvinceChange = async (e) => {
    const id = e.target.value;
    const province = provinces.find(p => p.id === id);
    setProvinceId(id);
    setDistrictId('');
    setSectorId('');
    setCellId('');
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
    onChange({ province: province?.name || '', district: '', sector: '', cell: '', village: '' });
    if (id) {
      try {
        setDistricts(await listDistricts(id));
      } catch {
        setDistricts([]);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const id = e.target.value;
    const district = districts.find(d => d.id === id);
    setDistrictId(id);
    setSectorId('');
    setCellId('');
    setSectors([]);
    setCells([]);
    setVillages([]);
    onChange({ ...location, district: district?.name || '', sector: '', cell: '', village: '' });
    if (id) {
      try {
        setSectors(await listSectors(id));
      } catch {
        setSectors([]);
      }
    }
  };

  const handleSectorChange = async (e) => {
    const id = e.target.value;
    const sector = sectors.find(s => s.id === id);
    setSectorId(id);
    setCellId('');
    setCells([]);
    setVillages([]);
    onChange({ ...location, sector: sector?.name || '', cell: '', village: '' });
    if (id) {
      try {
        setCells(await listCells(id));
      } catch {
        setCells([]);
      }
    }
  };

  const handleCellChange = async (e) => {
    const id = e.target.value;
    const cell = cells.find(c => c.id === id);
    setCellId(id);
    setVillages([]);
    onChange({ ...location, cell: cell?.name || '', village: '' });
    if (id) {
      try {
        setVillages(await listVillages(id));
      } catch {
        setVillages([]);
      }
    }
  };

  const handleVillageChange = (e) => {
    const village = villages.find(v => v.id === e.target.value);
    onChange({ ...location, village: village?.name || '' });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-green-700 mb-1">Province</label>
        <select value={provinceId} onChange={handleProvinceChange} className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
          <option value="">Select province</option>
          {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700 mb-1">District</label>
        <select value={districtId} onChange={handleDistrictChange} disabled={!provinceId} className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100">
          <option value="">Select district</option>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700 mb-1">Sector</label>
        <select value={sectorId} onChange={handleSectorChange} disabled={!districtId} className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100">
          <option value="">Select sector</option>
          {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700 mb-1">Cell</label>
        <select value={cellId} onChange={handleCellChange} disabled={!sectorId} className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100">
          <option value="">Select cell</option>
          {cells.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-green-700 mb-1">Village</label>
        <select value={villages.find(v => v.name === location.village)?.id || ''} onChange={handleVillageChange} disabled={!cellId} className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100">
          <option value="">Select village</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>
    </div>
  );
};

const AgentFarms = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });

  const [farmers, setFarmers] = useState([]);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newFarm, setNewFarm] = useState(emptyNewFarm);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFarm, setEditFarm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Detail modal
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [farmDetails, setFarmDetails] = useState(null);
  const [productionStats, setProductionStats] = useState(null);
  const [farmHistory, setFarmHistory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Trees tab state
  const [treeSummary, setTreeSummary] = useState(null);
  const [treeRecords, setTreeRecords] = useState([]);
  const [treeDiseases, setTreeDiseases] = useState([]);
  const [treesLoaded, setTreesLoaded] = useState(false);
  const [treesLoading, setTreesLoading] = useState(false);
  const [showAddTreeModal, setShowAddTreeModal] = useState(false);
  const [newTree, setNewTree] = useState({ tree_number: '', variety: '', planted_at: '', age_years: '', height_m: '', canopy_m: '', health_status: '', notes: '' });
  const [treeSaving, setTreeSaving] = useState(false);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [newDisease, setNewDisease] = useState({ tree_id: '', disease_name: '', severity: '', detected_at: '', treatment_notes: '' });
  const [diseaseSaving, setDiseaseSaving] = useState(false);
  const [resolvingDisease, setResolvingDisease] = useState(null);
  const [resolveForm, setResolveForm] = useState({ treated_at: '', treatment_notes: '', resolved: true });

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
    loadFarms(1);
  }, [loadFarms]);

  useEffect(() => {
    listFarmers({ limit: 100 }).then(res => setFarmers(res?.data || [])).catch(() => setFarmers([]));
  }, []);

  const safeFarms = Array.isArray(farms) ? farms : [];
  const filteredFarms = safeFarms.filter(farm => {
    if (!farm) return false;
    const name = (farm.farmName || farm.farm_name || '').toLowerCase();
    const farmerName = (farm.farmerName || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return term === '' || name.includes(term) || farmerName.includes(term);
  });

  const handlePageChange = (page) => loadFarms(page);

  // ---- Create farm ----
  const openCreateModal = () => {
    setNewFarm(emptyNewFarm);
    setShowCreateModal(true);
  };

  const handleCreateFarm = async () => {
    if (!newFarm.farmer_id) {
      toast.error('Please select a farmer');
      return;
    }
    if (!newFarm.farm_name.trim()) {
      toast.error('Farm name is required');
      return;
    }
    setCreateLoading(true);
    try {
      const payload = {
        farmer_id: newFarm.farmer_id,
        farm_name: newFarm.farm_name.trim(),
        crop_type: newFarm.crop_type || 'avocado'
      };
      if (newFarm.farm_size !== '') payload.farm_size = parseFloat(newFarm.farm_size);
      if (newFarm.tree_count !== '') payload.tree_count = parseInt(newFarm.tree_count, 10);
      if (newFarm.varieties.trim()) payload.varieties = newFarm.varieties.split(',').map(v => v.trim()).filter(Boolean);
      if (newFarm.planting_date) payload.planting_date = newFarm.planting_date;
      if (newFarm.expected_harvest) payload.expected_harvest = newFarm.expected_harvest;
      if (newFarm.status) payload.status = newFarm.status;
      if (newFarm.notes.trim()) payload.notes = newFarm.notes.trim();
      const hasLocation = Object.values(newFarm.location).some(Boolean);
      if (hasLocation) payload.location = newFarm.location;

      await createFarm(payload);
      setShowCreateModal(false);
      setNewFarm(emptyNewFarm);
      await loadFarms(1);
      toast.success('Farm created successfully');
    } catch (err) {
      console.error('Error creating farm:', err);
      toast.error(err.message || 'Failed to create farm');
    } finally {
      setCreateLoading(false);
    }
  };

  // ---- Edit farm ----
  const openEditModal = (farm) => {
    setEditFarm({
      id: farm.id,
      farm_name: farm.farmName || farm.farm_name || '',
      farm_size: farm.farm_size ?? '',
      tree_count: farm.tree_count ?? '',
      status: farm.status || '',
      expected_harvest: farm.expected_harvest ? farm.expected_harvest.split('T')[0] : '',
      notes: farm.notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditFarm = async () => {
    if (!editFarm?.id) return;
    setEditLoading(true);
    try {
      const payload = {
        farm_name: editFarm.farm_name,
        status: editFarm.status,
        notes: editFarm.notes
      };
      if (editFarm.farm_size !== '') payload.farm_size = parseFloat(editFarm.farm_size);
      if (editFarm.tree_count !== '') payload.tree_count = parseInt(editFarm.tree_count, 10);
      if (editFarm.expected_harvest) payload.expected_harvest = editFarm.expected_harvest;

      await updateFarm(editFarm.id, payload);
      setShowEditModal(false);
      setEditFarm(null);
      await loadFarms(pagination.currentPage);
      toast.success('Farm updated successfully');
    } catch (err) {
      console.error('Error updating farm:', err);
      toast.error(err.message || 'Failed to update farm');
    } finally {
      setEditLoading(false);
    }
  };

  // ---- Archive farm ----
  const handleArchive = async (farm) => {
    const ok = await confirm(`Archive farm "${farm.farmName || farm.farm_name}"? It will be soft-deleted.`, { title: 'Archive Farm' });
    if (!ok) return;
    try {
      await archiveFarm(farm.id);
      await loadFarms(pagination.currentPage);
      toast.success('Farm archived');
    } catch (err) {
      console.error('Error archiving farm:', err);
      toast.error(err.message || 'Failed to archive farm');
    }
  };

  // ---- Detail modal ----
  const openDetail = async (farm) => {
    setSelectedFarm(farm);
    setDetailTab('overview');
    setFarmDetails(null);
    setProductionStats(null);
    setFarmHistory(null);
    setTreeSummary(null);
    setTreeRecords([]);
    setTreeDiseases([]);
    setTreesLoaded(false);
    setDetailLoading(true);
    try {
      const details = await getFarmDetails(farm.id);
      setFarmDetails(details);
    } catch (err) {
      console.error('Error loading farm details:', err);
      toast.error(err.message || 'Failed to load farm details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedFarm(null);
  };

  const handleTabChange = async (tab) => {
    setDetailTab(tab);
    if (!selectedFarm) return;

    if (tab === 'production' && !productionStats) {
      try {
        setProductionStats(await getFarmProductionStats(selectedFarm.id));
      } catch (err) {
        toast.error(err.message || 'Failed to load production stats');
      }
    }
    if (tab === 'history' && !farmHistory) {
      try {
        setFarmHistory(await getFarmHistory(selectedFarm.id));
      } catch (err) {
        toast.error(err.message || 'Failed to load farm history');
      }
    }
    if (tab === 'trees' && !treesLoaded) {
      setTreesLoading(true);
      try {
        const [summary, records, diseases] = await Promise.all([
          getFarmTreeSummary(selectedFarm.id).catch(() => null),
          listFarmTrees(selectedFarm.id).catch(() => []),
          listFarmTreeDiseases(selectedFarm.id).catch(() => [])
        ]);
        setTreeSummary(summary);
        setTreeRecords(Array.isArray(records) ? records : []);
        setTreeDiseases(Array.isArray(diseases) ? diseases : []);
        setTreesLoaded(true);
      } catch (err) {
        toast.error(err.message || 'Failed to load tree data');
      } finally {
        setTreesLoading(false);
      }
    }
  };

  const refreshTrees = async () => {
    if (!selectedFarm) return;
    try {
      const [summary, records, diseases] = await Promise.all([
        getFarmTreeSummary(selectedFarm.id).catch(() => null),
        listFarmTrees(selectedFarm.id).catch(() => []),
        listFarmTreeDiseases(selectedFarm.id).catch(() => [])
      ]);
      setTreeSummary(summary);
      setTreeRecords(Array.isArray(records) ? records : []);
      setTreeDiseases(Array.isArray(diseases) ? diseases : []);
    } catch {
      // silent - individual actions already surface errors
    }
  };

  const handleAddTree = async () => {
    if (!newTree.tree_number.trim()) {
      toast.error('Tree number is required');
      return;
    }
    setTreeSaving(true);
    try {
      const payload = { tree_number: newTree.tree_number.trim() };
      if (newTree.variety.trim()) payload.variety = newTree.variety.trim();
      if (newTree.planted_at) payload.planted_at = newTree.planted_at;
      if (newTree.age_years !== '') payload.age_years = parseFloat(newTree.age_years);
      if (newTree.height_m !== '') payload.height_m = parseFloat(newTree.height_m);
      if (newTree.canopy_m !== '') payload.canopy_m = parseFloat(newTree.canopy_m);
      if (newTree.health_status) payload.health_status = newTree.health_status;
      if (newTree.notes.trim()) payload.notes = newTree.notes.trim();

      await addTreeRecord(selectedFarm.id, payload);
      setShowAddTreeModal(false);
      setNewTree({ tree_number: '', variety: '', planted_at: '', age_years: '', height_m: '', canopy_m: '', health_status: '', notes: '' });
      await refreshTrees();
      toast.success('Tree record added');
    } catch (err) {
      console.error('Error adding tree record:', err);
      toast.error(err.message || 'Failed to add tree record');
    } finally {
      setTreeSaving(false);
    }
  };

  const handleReportDisease = async () => {
    if (!newDisease.tree_id) {
      toast.error('Please select a tree');
      return;
    }
    if (!newDisease.disease_name.trim()) {
      toast.error('Disease name is required');
      return;
    }
    if (!newDisease.severity) {
      toast.error('Severity is required');
      return;
    }
    setDiseaseSaving(true);
    try {
      const payload = {
        tree_id: newDisease.tree_id,
        disease_name: newDisease.disease_name.trim(),
        severity: newDisease.severity
      };
      if (newDisease.detected_at) payload.detected_at = newDisease.detected_at;
      if (newDisease.treatment_notes.trim()) payload.treatment_notes = newDisease.treatment_notes.trim();

      await reportTreeDisease(selectedFarm.id, payload);
      setShowDiseaseModal(false);
      setNewDisease({ tree_id: '', disease_name: '', severity: '', detected_at: '', treatment_notes: '' });
      await refreshTrees();
      toast.success('Disease reported');
    } catch (err) {
      console.error('Error reporting disease:', err);
      toast.error(err.message || 'Failed to report disease');
    } finally {
      setDiseaseSaving(false);
    }
  };

  const openResolveModal = (disease) => {
    setResolvingDisease(disease);
    setResolveForm({
      treated_at: new Date().toISOString().split('T')[0],
      treatment_notes: disease.treatment_notes || '',
      resolved: true
    });
  };

  const handleResolveDisease = async () => {
    if (!resolvingDisease?.id) return;
    try {
      await updateTreeDisease(resolvingDisease.id, {
        treated_at: resolveForm.treated_at || undefined,
        treatment_notes: resolveForm.treatment_notes,
        resolved: resolveForm.resolved
      });
      setResolvingDisease(null);
      await refreshTrees();
      toast.success('Disease record updated');
    } catch (err) {
      console.error('Error updating disease record:', err);
      toast.error(err.message || 'Failed to update disease record');
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Trees className="h-7 w-7 mr-3 text-green-600" />
              Farm Management
            </h2>
            <p className="text-green-600 mt-1">Register, track and manage avocado farms under your care</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Farm
          </button>
        </div>
      </div>

      {/* Search and Filter */}
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Total Farms: <span className="font-semibold">{pagination.totalItems}</span>
            </span>
            <button
              onClick={() => loadFarms(pagination.currentPage)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
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
            <p className="text-green-600 text-lg font-medium mb-2">No farms found</p>
            <p className="text-green-500 text-sm mb-4">Farms you register will appear here.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Farm
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Size (ha)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Trees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {filteredFarms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-900">{farm.farmName || farm.farm_name || 'N/A'}</div>
                        <div className="text-xs text-green-600">{farm.farmerName || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-900 flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-green-400" />
                          {[farm.location?.district, farm.location?.province].filter(Boolean).join(', ') || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">{farm.farm_size ?? 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">{farm.tree_count ?? 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${getStatusColor(farm.status)}`}>
                          {farm.status ? farm.status.charAt(0).toUpperCase() + farm.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button onClick={() => openDetail(farm)} className="text-green-600 hover:text-green-800 transform hover:scale-110 transition" title="View Details">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button onClick={() => openEditModal(farm)} className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition" title="Edit Farm">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleArchive(farm)} className="text-orange-600 hover:text-orange-800 transform hover:scale-110 transition" title="Archive Farm">
                            <Archive className="h-5 w-5" />
                          </button>
                        </div>
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
                  <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="px-3 py-1 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Farm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Create New Farm</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Farmer *</label>
                <select
                  value={newFarm.farmer_id}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, farmer_id: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select farmer</option>
                  {farmers.map(f => <option key={f.id} value={f.id}>{f.full_name} ({f.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Farm Name *</label>
                <input
                  type="text"
                  value={newFarm.farm_name}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, farm_name: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter farm name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Farm Size (hectares)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={newFarm.farm_size}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, farm_size: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Tree Count</label>
                <input
                  type="number" min="0"
                  value={newFarm.tree_count}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, tree_count: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Varieties (comma-separated)</label>
                <input
                  type="text"
                  value={newFarm.varieties}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, varieties: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Hass, Fuerte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Status</label>
                <select
                  value={newFarm.status}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Planting Date</label>
                <input
                  type="date"
                  value={newFarm.planting_date}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, planting_date: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Expected Harvest</label>
                <input
                  type="date"
                  value={newFarm.expected_harvest}
                  onChange={(e) => setNewFarm(prev => ({ ...prev, expected_harvest: e.target.value }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-green-700 mb-3">Location</h4>
              <LocationCascadeFields
                location={newFarm.location}
                onChange={(loc) => setNewFarm(prev => ({ ...prev, location: loc }))}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-green-700 mb-1">Notes</label>
              <textarea
                value={newFarm.notes}
                onChange={(e) => setNewFarm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all" disabled={createLoading}>Cancel</button>
              <button onClick={handleCreateFarm} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Farm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Farm Modal */}
      {showEditModal && editFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Edit Farm</h3>
              <button onClick={() => setShowEditModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Farm Name</label>
                <input type="text" value={editFarm.farm_name} onChange={(e) => setEditFarm(prev => ({ ...prev, farm_name: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Farm Size (hectares)</label>
                <input type="number" min="0" step="0.01" value={editFarm.farm_size} onChange={(e) => setEditFarm(prev => ({ ...prev, farm_size: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Tree Count</label>
                <input type="number" min="0" value={editFarm.tree_count} onChange={(e) => setEditFarm(prev => ({ ...prev, tree_count: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Status</label>
                <select value={editFarm.status} onChange={(e) => setEditFarm(prev => ({ ...prev, status: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Expected Harvest</label>
                <input type="date" value={editFarm.expected_harvest} onChange={(e) => setEditFarm(prev => ({ ...prev, expected_harvest: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Notes</label>
                <textarea value={editFarm.notes} onChange={(e) => setEditFarm(prev => ({ ...prev, notes: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="3" />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={() => setShowEditModal(false)} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all" disabled={editLoading}>Cancel</button>
              <button onClick={handleEditFarm} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farm Detail Modal */}
      {selectedFarm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-800">
                {selectedFarm.farmName || selectedFarm.farm_name}
              </h3>
              <button onClick={closeDetail} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-green-100 mb-4 overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview', icon: Info },
                { key: 'production', label: 'Production Stats', icon: BarChart2 },
                { key: 'history', label: 'History', icon: History },
                { key: 'trees', label: 'Trees', icon: Sprout }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    detailTab === tab.key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-green-600'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-1.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              detailLoading ? (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>
              ) : farmDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-sm text-green-800">
                    <p><span className="font-medium">Farmer:</span> {farmDetails.farmerName || selectedFarm.farmerName || 'N/A'}</p>
                    <p><span className="font-medium">Crop Type:</span> {farmDetails.crop_type || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> {farmDetails.status || 'N/A'}</p>
                    <p><span className="font-medium">Farm Size:</span> {farmDetails.farm_size ?? 'N/A'} ha</p>
                    <p><span className="font-medium">Tree Count:</span> {farmDetails.tree_count ?? 'N/A'}</p>
                    <p><span className="font-medium">Varieties:</span> {(farmDetails.varieties || []).join(', ') || 'N/A'}</p>
                    <p><span className="font-medium">Organic Certified:</span> {farmDetails.organic_certified ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Irrigation System:</span> {farmDetails.irrigation_system || 'N/A'}</p>
                    <p><span className="font-medium">Soil Type:</span> {farmDetails.soil_type || 'N/A'}</p>
                  </div>
                  <div className="space-y-2 text-sm text-green-800">
                    <p className="font-medium">Location</p>
                    <p>{[farmDetails.location?.village, farmDetails.location?.cell, farmDetails.location?.sector, farmDetails.location?.district, farmDetails.location?.province].filter(Boolean).join(', ') || 'N/A'}</p>
                    {farmDetails.yield_estimate !== undefined && (
                      <p className="mt-4"><span className="font-medium">Yield Estimate:</span> {JSON.stringify(farmDetails.yield_estimate)}</p>
                    )}
                    {farmDetails.notes && (
                      <div className="mt-4">
                        <p className="font-medium">Notes</p>
                        <p className="bg-green-50 p-3 rounded-lg">{farmDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-4">No details available.</p>
              )
            )}

            {/* Production Stats Tab */}
            {detailTab === 'production' && (
              productionStats ? (
                <pre className="bg-green-50 p-4 rounded-lg text-xs text-green-900 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(productionStats, null, 2)}
                </pre>
              ) : (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>
              )
            )}

            {/* History Tab */}
            {detailTab === 'history' && (
              farmHistory ? (
                <pre className="bg-green-50 p-4 rounded-lg text-xs text-green-900 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(farmHistory, null, 2)}
                </pre>
              ) : (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>
              )
            )}

            {/* Trees Tab */}
            {detailTab === 'trees' && (
              treesLoading ? (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  {treeSummary && (
                    <div className="bg-green-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-green-600 uppercase font-medium">Latest Record</p>
                        <p className="text-sm text-green-900">{treeSummary.latest_tree_record?.tree_number || treeSummary.latestTreeRecord?.tree_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 uppercase font-medium">Untreated Diseases</p>
                        <p className="text-sm text-green-900">{treeSummary.untreated_disease_count ?? treeSummary.untreatedDiseaseCount ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 uppercase font-medium">Reported Diseases</p>
                        <p className="text-sm text-green-900">{(treeSummary.disease_names || treeSummary.diseaseNames || []).join(', ') || 'None'}</p>
                      </div>
                    </div>
                  )}

                  {/* Tree Records */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-green-700 flex items-center"><Trees className="h-4 w-4 mr-1.5" /> Tree Records ({treeRecords.length})</h4>
                      <button onClick={() => setShowAddTreeModal(true)} className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
                        <Plus className="h-4 w-4 mr-1" /> Add Tree Record
                      </button>
                    </div>
                    {treeRecords.length === 0 ? (
                      <p className="text-sm text-gray-500">No tree records yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-green-100 text-sm">
                          <thead className="bg-green-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Tree #</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Variety</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Age (yrs)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Height (m)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase">Health</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-green-50">
                            {treeRecords.map((t, idx) => (
                              <tr key={t.id || idx}>
                                <td className="px-3 py-2 text-green-900">{t.tree_number}</td>
                                <td className="px-3 py-2 text-green-900">{t.variety || 'N/A'}</td>
                                <td className="px-3 py-2 text-green-900">{t.age_years ?? 'N/A'}</td>
                                <td className="px-3 py-2 text-green-900">{t.height_m ?? 'N/A'}</td>
                                <td className="px-3 py-2 text-green-900">{t.health_status || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Disease Reports */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold text-green-700 flex items-center"><Bug className="h-4 w-4 mr-1.5" /> Disease Reports ({treeDiseases.length})</h4>
                      <button onClick={() => setShowDiseaseModal(true)} className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm" disabled={treeRecords.length === 0}>
                        <Plus className="h-4 w-4 mr-1" /> Report Disease
                      </button>
                    </div>
                    {treeDiseases.length === 0 ? (
                      <p className="text-sm text-gray-500">No disease reports.</p>
                    ) : (
                      <div className="space-y-2">
                        {treeDiseases.map((d, idx) => (
                          <div key={d.id || idx} className="bg-white ring-1 ring-green-100 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-900">{d.disease_name} <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ring-1 ${getSeverityColor(d.severity)}`}>{d.severity}</span></p>
                              <p className="text-xs text-green-600">Tree: {d.tree_id} · Detected: {d.detected_at ? new Date(d.detected_at).toLocaleDateString() : 'N/A'}</p>
                              {d.treatment_notes && <p className="text-xs text-gray-500 mt-1">{d.treatment_notes}</p>}
                            </div>
                            <div>
                              {d.resolved ? (
                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800 ring-1 ring-green-500">Resolved</span>
                              ) : (
                                <button onClick={() => openResolveModal(d)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs">
                                  Mark Treated
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Add Tree Record Modal */}
      {showAddTreeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Add Tree Record</h3>
              <button onClick={() => setShowAddTreeModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close"><X className="h-6 w-6" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-1">Tree Number *</label>
                <input type="text" value={newTree.tree_number} onChange={(e) => setNewTree(prev => ({ ...prev, tree_number: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Variety</label>
                <input type="text" value={newTree.variety} onChange={(e) => setNewTree(prev => ({ ...prev, variety: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Planted At</label>
                <input type="date" value={newTree.planted_at} onChange={(e) => setNewTree(prev => ({ ...prev, planted_at: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Age (years)</label>
                <input type="number" min="0" step="0.1" value={newTree.age_years} onChange={(e) => setNewTree(prev => ({ ...prev, age_years: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Height (m)</label>
                <input type="number" min="0" step="0.1" value={newTree.height_m} onChange={(e) => setNewTree(prev => ({ ...prev, height_m: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Canopy (m)</label>
                <input type="number" min="0" step="0.1" value={newTree.canopy_m} onChange={(e) => setNewTree(prev => ({ ...prev, canopy_m: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Health Status</label>
                <select value={newTree.health_status} onChange={(e) => setNewTree(prev => ({ ...prev, health_status: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Select</option>
                  {HEALTH_OPTIONS.map(h => <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-1">Notes</label>
                <textarea value={newTree.notes} onChange={(e) => setNewTree(prev => ({ ...prev, notes: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="2" />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setShowAddTreeModal(false)} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all" disabled={treeSaving}>Cancel</button>
              <button onClick={handleAddTree} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all" disabled={treeSaving}>
                {treeSaving ? 'Saving...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Disease Modal */}
      {showDiseaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Report Tree Disease</h3>
              <button onClick={() => setShowDiseaseModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Tree *</label>
                <select value={newDisease.tree_id} onChange={(e) => setNewDisease(prev => ({ ...prev, tree_id: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Select tree</option>
                  {treeRecords.map((t, idx) => <option key={t.id || idx} value={t.id}>{t.tree_number}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Disease Name *</label>
                <input type="text" value={newDisease.disease_name} onChange={(e) => setNewDisease(prev => ({ ...prev, disease_name: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Severity *</label>
                <select value={newDisease.severity} onChange={(e) => setNewDisease(prev => ({ ...prev, severity: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="">Select severity</option>
                  {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Detected At</label>
                <input type="date" value={newDisease.detected_at} onChange={(e) => setNewDisease(prev => ({ ...prev, detected_at: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Treatment Notes</label>
                <textarea value={newDisease.treatment_notes} onChange={(e) => setNewDisease(prev => ({ ...prev, treatment_notes: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="2" />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setShowDiseaseModal(false)} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all" disabled={diseaseSaving}>Cancel</button>
              <button onClick={handleReportDisease} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all" disabled={diseaseSaving}>
                {diseaseSaving ? 'Reporting...' : 'Report Disease'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Disease Modal */}
      {resolvingDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Update Disease Record</h3>
              <button onClick={() => setResolvingDisease(null)} className="text-green-400 hover:text-green-600" aria-label="Close"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-green-700">{resolvingDisease.disease_name}</p>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Treated At</label>
                <input type="date" value={resolveForm.treated_at} onChange={(e) => setResolveForm(prev => ({ ...prev, treated_at: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Treatment Notes</label>
                <textarea value={resolveForm.treatment_notes} onChange={(e) => setResolveForm(prev => ({ ...prev, treatment_notes: e.target.value }))} className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" rows="3" />
              </div>
              <label className="flex items-center gap-2 text-sm text-green-700">
                <input type="checkbox" checked={resolveForm.resolved} onChange={(e) => setResolveForm(prev => ({ ...prev, resolved: e.target.checked }))} />
                Mark as resolved
              </label>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button onClick={() => setResolvingDisease(null)} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all">Cancel</button>
              <button onClick={handleResolveDisease} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentFarms;
