import { useState, useEffect, useCallback } from 'react';
import {
  Bug, Plus, Edit, Trash2, AlertTriangle, ShieldAlert, BarChart3, ListChecks, X,
} from 'lucide-react';
import {
  listDiseaseRegistry,
  createDiseaseRegistryEntry,
  updateDiseaseRegistryEntry,
  deleteDiseaseRegistryEntry,
  listDiseaseOutbreaks,
  declareDiseaseOutbreak,
  updateDiseaseOutbreak,
  getDiseaseStatistics,
} from '../../services/diseasesService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const OUTBREAK_STATUSES = ['active', 'contained', 'resolved', 'monitoring'];

const EMPTY_REGISTRY_FORM = {
  name: '',
  description: '',
  symptoms: '',
  treatment: '',
  prevention: '',
  severity_default: 'medium',
};

const EMPTY_OUTBREAK_FORM = {
  disease_id: '',
  location: '',
  started_at: '',
  notes: '',
};

const severityColor = (severity) => {
  switch (severity) {
    case 'low': return 'bg-green-100 text-green-800 ring-green-400';
    case 'medium': return 'bg-yellow-100 text-yellow-800 ring-yellow-400';
    case 'high': return 'bg-orange-100 text-orange-800 ring-orange-400';
    case 'critical': return 'bg-red-100 text-red-800 ring-red-400';
    default: return 'bg-gray-100 text-gray-800 ring-gray-400';
  }
};

const outbreakStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-red-100 text-red-800 ring-red-400';
    case 'contained': return 'bg-orange-100 text-orange-800 ring-orange-400';
    case 'monitoring': return 'bg-yellow-100 text-yellow-800 ring-yellow-400';
    case 'resolved': return 'bg-green-100 text-green-800 ring-green-400';
    default: return 'bg-gray-100 text-gray-800 ring-gray-400';
  }
};

const TABS = [
  { id: 'registry', label: 'Registry', icon: ListChecks },
  { id: 'outbreaks', label: 'Outbreaks', icon: ShieldAlert },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
];

const Diseases = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState('registry');

  // Registry state
  const [registry, setRegistry] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [registryForm, setRegistryForm] = useState(EMPTY_REGISTRY_FORM);
  const [editingRegistryId, setEditingRegistryId] = useState(null);
  const [registrySaving, setRegistrySaving] = useState(false);

  // Outbreaks state
  const [outbreaks, setOutbreaks] = useState([]);
  const [outbreaksLoading, setOutbreaksLoading] = useState(false);
  const [showOutbreakModal, setShowOutbreakModal] = useState(false);
  const [outbreakForm, setOutbreakForm] = useState(EMPTY_OUTBREAK_FORM);
  const [outbreakSaving, setOutbreakSaving] = useState(false);
  const [editingOutbreak, setEditingOutbreak] = useState(null);
  const [showOutbreakStatusModal, setShowOutbreakStatusModal] = useState(false);

  // Statistics state
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadRegistry = useCallback(async () => {
    setRegistryLoading(true);
    try {
      const data = await listDiseaseRegistry();
      setRegistry(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load disease registry');
      setRegistry([]);
    } finally {
      setRegistryLoading(false);
    }
  }, [toast]);

  const loadOutbreaks = useCallback(async () => {
    setOutbreaksLoading(true);
    try {
      const data = await listDiseaseOutbreaks();
      setOutbreaks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load disease outbreaks');
      setOutbreaks([]);
    } finally {
      setOutbreaksLoading(false);
    }
  }, [toast]);

  const loadStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getDiseaseStatistics();
      setStatistics(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load disease statistics');
      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRegistry();
    loadOutbreaks();
    loadStatistics();
  }, [loadRegistry, loadOutbreaks, loadStatistics]);

  // ---------------- Registry handlers ----------------

  const openCreateRegistryModal = () => {
    setEditingRegistryId(null);
    setRegistryForm(EMPTY_REGISTRY_FORM);
    setShowRegistryModal(true);
  };

  const openEditRegistryModal = (entry) => {
    setEditingRegistryId(entry.id);
    setRegistryForm({
      name: entry.name || '',
      description: entry.description || '',
      symptoms: entry.symptoms || '',
      treatment: entry.treatment || '',
      prevention: entry.prevention || '',
      severity_default: entry.severity_default || 'medium',
    });
    setShowRegistryModal(true);
  };

  const handleSaveRegistry = async () => {
    if (!registryForm.name.trim()) {
      toast.error('Disease name is required');
      return;
    }
    setRegistrySaving(true);
    try {
      if (editingRegistryId) {
        await updateDiseaseRegistryEntry(editingRegistryId, registryForm);
        toast.success('Disease updated successfully');
      } else {
        await createDiseaseRegistryEntry(registryForm);
        toast.success('Disease added to registry');
      }
      setShowRegistryModal(false);
      await loadRegistry();
    } catch (error) {
      toast.error(error.message || 'Failed to save disease');
    } finally {
      setRegistrySaving(false);
    }
  };

  const handleDeleteRegistry = async (entry) => {
    const ok = await confirm(`Delete "${entry.name}" from the disease registry? This cannot be undone.`, {
      title: 'Delete Disease',
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    try {
      await deleteDiseaseRegistryEntry(entry.id);
      toast.success('Disease deleted');
      await loadRegistry();
    } catch (error) {
      toast.error(error.message || 'Failed to delete disease');
    }
  };

  // ---------------- Outbreak handlers ----------------

  const openDeclareOutbreakModal = () => {
    setOutbreakForm(EMPTY_OUTBREAK_FORM);
    setShowOutbreakModal(true);
  };

  const handleDeclareOutbreak = async () => {
    if (!outbreakForm.disease_id) {
      toast.error('Please select a disease');
      return;
    }
    if (!outbreakForm.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!outbreakForm.started_at) {
      toast.error('Start date is required');
      return;
    }
    setOutbreakSaving(true);
    try {
      await declareDiseaseOutbreak(outbreakForm);
      toast.success('Outbreak declared');
      setShowOutbreakModal(false);
      await loadOutbreaks();
    } catch (error) {
      toast.error(error.message || 'Failed to declare outbreak');
    } finally {
      setOutbreakSaving(false);
    }
  };

  const openOutbreakStatusModal = (outbreak) => {
    setEditingOutbreak({
      id: outbreak.id,
      status: outbreak.status || 'active',
      response_plan: outbreak.response_plan || '',
      affected_farms: outbreak.affected_farms ?? '',
      description: outbreak.description || '',
    });
    setShowOutbreakStatusModal(true);
  };

  const handleUpdateOutbreak = async () => {
    if (!editingOutbreak?.id) return;
    setOutbreakSaving(true);
    try {
      const payload = {
        status: editingOutbreak.status,
        response_plan: editingOutbreak.response_plan,
        description: editingOutbreak.description,
      };
      if (editingOutbreak.affected_farms !== '') {
        payload.affected_farms = Number(editingOutbreak.affected_farms);
      }
      await updateDiseaseOutbreak(editingOutbreak.id, payload);
      toast.success('Outbreak updated');
      setShowOutbreakStatusModal(false);
      setEditingOutbreak(null);
      await loadOutbreaks();
    } catch (error) {
      toast.error(error.message || 'Failed to update outbreak');
    } finally {
      setOutbreakSaving(false);
    }
  };

  const diseaseName = (diseaseId) => registry.find((d) => d.id === diseaseId)?.name || diseaseId || 'N/A';

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <Bug className="h-7 w-7 mr-3 text-green-600" />
          Disease Management
        </h2>
        <p className="text-green-600 mt-1">Manage the disease registry, monitor outbreaks, and review statistics</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg ring-1 ring-green-100 overflow-hidden">
        <div className="flex border-b border-green-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* ---------------- Registry Tab ---------------- */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-green-800">Known Diseases</h3>
                <button
                  onClick={openCreateRegistryModal}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Disease
                </button>
              </div>

              {registryLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-green-600">Loading registry...</p>
                </div>
              ) : registry.length === 0 ? (
                <div className="p-8 text-center text-green-600">No diseases registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-100">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Default Severity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Symptoms</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Treatment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {registry.map((entry) => (
                        <tr key={entry.id} className="hover:bg-green-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-green-900">{entry.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${severityColor(entry.severity_default)}`}>
                              {entry.severity_default || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700 max-w-xs truncate">{entry.symptoms || '-'}</td>
                          <td className="px-4 py-3 text-sm text-green-700 max-w-xs truncate">{entry.treatment || '-'}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openEditRegistryModal(entry)}
                                className="text-blue-600 hover:text-blue-800 transition"
                                title="Edit"
                                aria-label="Edit disease"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRegistry(entry)}
                                className="text-red-600 hover:text-red-800 transition"
                                title="Delete"
                                aria-label="Delete disease"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---------------- Outbreaks Tab ---------------- */}
          {activeTab === 'outbreaks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-green-800">Disease Outbreaks</h3>
                <button
                  onClick={openDeclareOutbreakModal}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Declare Outbreak
                </button>
              </div>

              {outbreaksLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-green-600">Loading outbreaks...</p>
                </div>
              ) : outbreaks.length === 0 ? (
                <div className="p-8 text-center text-green-600">No outbreaks recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-100">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Disease</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Started</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Affected Farms</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {outbreaks.map((outbreak) => (
                        <tr key={outbreak.id} className="hover:bg-green-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-green-900">{outbreak.disease_name || diseaseName(outbreak.disease_id)}</td>
                          <td className="px-4 py-3 text-sm text-green-700">{outbreak.location}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${outbreakStatusColor(outbreak.status)}`}>
                              {outbreak.status || 'active'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">
                            {outbreak.started_at ? new Date(outbreak.started_at).toISOString().split('T')[0] : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">{outbreak.affected_farms ?? '-'}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <button
                              onClick={() => openOutbreakStatusModal(outbreak)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Update Outbreak"
                              aria-label="Update outbreak"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---------------- Statistics Tab ---------------- */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-green-800">Disease Case Statistics</h3>
              {statsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-green-600">Loading statistics...</p>
                </div>
              ) : !statistics ? (
                <div className="p-8 text-center text-green-600">No statistics available.</div>
              ) : (
                <div className="space-y-8">
                  {statistics.by_status && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 uppercase mb-3">By Status</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(statistics.by_status).map(([status, count]) => (
                          <div key={status} className="bg-green-50 rounded-xl p-4 ring-1 ring-green-100 text-center">
                            <p className="text-2xl font-bold text-green-800">{count}</p>
                            <p className="text-sm text-green-600 capitalize mt-1">{status.replace('_', ' ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {statistics.by_severity && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 uppercase mb-3">By Severity</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(statistics.by_severity).map(([severity, count]) => (
                          <div key={severity} className={`rounded-xl p-4 ring-1 text-center ${severityColor(severity)}`}>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm capitalize mt-1">{severity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!statistics.by_status && !statistics.by_severity && (
                    <pre className="bg-green-50 p-4 rounded-lg text-sm text-green-700 overflow-x-auto">
                      {JSON.stringify(statistics, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registry Modal */}
      {showRegistryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">
                {editingRegistryId ? 'Edit Disease' : 'Add Disease'}
              </h3>
              <button onClick={() => setShowRegistryModal(false)} className="text-green-400 hover:text-green-600 text-2xl" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={registryForm.name}
                  onChange={(e) => setRegistryForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Anthracnose"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Default Severity</label>
                <select
                  value={registryForm.severity_default}
                  onChange={(e) => setRegistryForm((prev) => ({ ...prev, severity_default: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  value={registryForm.description}
                  onChange={(e) => setRegistryForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Symptoms</label>
                <textarea
                  value={registryForm.symptoms}
                  onChange={(e) => setRegistryForm((prev) => ({ ...prev, symptoms: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Treatment</label>
                <textarea
                  value={registryForm.treatment}
                  onChange={(e) => setRegistryForm((prev) => ({ ...prev, treatment: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Prevention</label>
                <textarea
                  value={registryForm.prevention}
                  onChange={(e) => setRegistryForm((prev) => ({ ...prev, prevention: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowRegistryModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={registrySaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRegistry}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={registrySaving}
              >
                {registrySaving ? 'Saving...' : editingRegistryId ? 'Update Disease' : 'Add Disease'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Declare Outbreak Modal */}
      {showOutbreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Declare Outbreak</h3>
              <button onClick={() => setShowOutbreakModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Disease *</label>
                <select
                  value={outbreakForm.disease_id}
                  onChange={(e) => setOutbreakForm((prev) => ({ ...prev, disease_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select disease</option>
                  {registry.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={outbreakForm.location}
                  onChange={(e) => setOutbreakForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Nyamagabe District"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={outbreakForm.started_at}
                  onChange={(e) => setOutbreakForm((prev) => ({ ...prev, started_at: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={outbreakForm.notes}
                  onChange={(e) => setOutbreakForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowOutbreakModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={outbreakSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareOutbreak}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                disabled={outbreakSaving}
              >
                {outbreakSaving ? 'Declaring...' : 'Declare Outbreak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Outbreak Status Modal */}
      {showOutbreakStatusModal && editingOutbreak && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Update Outbreak</h3>
              <button onClick={() => setShowOutbreakStatusModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Status</label>
                <select
                  value={editingOutbreak.status}
                  onChange={(e) => setEditingOutbreak((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {OUTBREAK_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                {editingOutbreak.status === 'resolved' && (
                  <p className="text-xs text-green-600 mt-1">End date will be set automatically by the server.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Affected Farms</label>
                <input
                  type="number"
                  min="0"
                  value={editingOutbreak.affected_farms}
                  onChange={(e) => setEditingOutbreak((prev) => ({ ...prev, affected_farms: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Response Plan</label>
                <textarea
                  value={editingOutbreak.response_plan}
                  onChange={(e) => setEditingOutbreak((prev) => ({ ...prev, response_plan: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  value={editingOutbreak.description}
                  onChange={(e) => setEditingOutbreak((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowOutbreakStatusModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={outbreakSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOutbreak}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={outbreakSaving}
              >
                {outbreakSaving ? 'Saving...' : 'Update Outbreak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diseases;
