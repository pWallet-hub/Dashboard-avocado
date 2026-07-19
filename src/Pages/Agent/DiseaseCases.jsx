import { useState, useEffect, useCallback } from 'react';
import { Bug, Plus, Filter, Edit, X, Leaf } from 'lucide-react';
import {
  listDiseaseCases,
  reportDiseaseCase,
  updateDiseaseCase,
  listDiseaseRegistry,
} from '../../services/diseasesService';
import { listFarms } from '../../services/farmsService';
import { useToast } from '../../components/Ui/Toast';

const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const CASE_STATUSES = ['open', 'in_treatment', 'resolved', 'closed'];

const EMPTY_CASE_FORM = {
  farm_id: '',
  disease_id: '',
  severity: 'medium',
  affected_trees: '',
  detected_at: '',
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

const statusColor = (status) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800 ring-red-400';
    case 'in_treatment': return 'bg-yellow-100 text-yellow-800 ring-yellow-400';
    case 'resolved': return 'bg-green-100 text-green-800 ring-green-400';
    case 'closed': return 'bg-gray-200 text-gray-800 ring-gray-400';
    default: return 'bg-gray-100 text-gray-800 ring-gray-400';
  }
};

const DiseaseCases = () => {
  const toast = useToast();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [diseases, setDiseases] = useState([]);
  const [farms, setFarms] = useState([]);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState(EMPTY_CASE_FORM);
  const [reportSaving, setReportSaving] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const options = statusFilter !== 'all' ? { status: statusFilter } : {};
      const data = await listDiseaseCases(options);
      setCases(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load disease cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    listDiseaseRegistry().then(setDiseases).catch((error) => {
      console.error('Error loading disease registry:', error);
      setDiseases([]);
    });
    listFarms().then((result) => setFarms(Array.isArray(result?.data) ? result.data : [])).catch((error) => {
      console.error('Error loading farms:', error);
      setFarms([]);
    });
  }, []);

  const diseaseName = (diseaseId) => diseases.find((d) => d.id === diseaseId)?.name || diseaseId || 'N/A';
  const farmLabel = (farmId) => {
    const farm = farms.find((f) => f.id === farmId);
    if (!farm) return farmId || 'N/A';
    return farm.farm_name || farm.name || farm.owner_name || farm.id;
  };

  const openReportModal = () => {
    setReportForm(EMPTY_CASE_FORM);
    setShowReportModal(true);
  };

  const handleReportCase = async () => {
    if (!reportForm.farm_id) {
      toast.error('Please select a farm');
      return;
    }
    if (!reportForm.disease_id) {
      toast.error('Please select a disease');
      return;
    }
    if (!reportForm.severity) {
      toast.error('Please select a severity');
      return;
    }

    setReportSaving(true);
    try {
      const payload = { ...reportForm };
      if (payload.affected_trees !== '') {
        payload.affected_trees = Number(payload.affected_trees);
      } else {
        delete payload.affected_trees;
      }
      if (!payload.detected_at) delete payload.detected_at;
      if (!payload.notes) delete payload.notes;

      await reportDiseaseCase(payload);
      toast.success('Disease case reported');
      setShowReportModal(false);
      await loadCases();
    } catch (error) {
      toast.error(error.message || 'Failed to report disease case');
    } finally {
      setReportSaving(false);
    }
  };

  const openStatusModal = (diseaseCase) => {
    setEditingCase({ id: diseaseCase.id, status: diseaseCase.status || 'open', notes: diseaseCase.notes || '' });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingCase?.id) return;
    setStatusSaving(true);
    try {
      await updateDiseaseCase(editingCase.id, { status: editingCase.status, notes: editingCase.notes });
      toast.success('Disease case updated');
      setShowStatusModal(false);
      setEditingCase(null);
      await loadCases();
    } catch (error) {
      toast.error(error.message || 'Failed to update disease case');
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Bug className="h-7 w-7 mr-3 text-green-600" />
              Disease Cases
            </h2>
            <p className="text-green-600 mt-1">Report and track disease cases on your assigned farms</p>
          </div>
          <button
            onClick={openReportModal}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Report Disease Case
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="relative max-w-xs">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none transition-all"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            {CASE_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading disease cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center">
            <Leaf className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No disease cases found</p>
            <p className="text-green-500 text-sm mb-4">Report a case to start tracking disease outbreaks on your farms.</p>
            <button
              onClick={openReportModal}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Report First Case
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Farm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Disease</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Affected Trees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Detected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {cases.map((diseaseCase) => (
                  <tr key={diseaseCase.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">{farmLabel(diseaseCase.farm_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">{diseaseName(diseaseCase.disease_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${severityColor(diseaseCase.severity)}`}>
                        {diseaseCase.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusColor(diseaseCase.status)}`}>
                        {(diseaseCase.status || 'open').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">{diseaseCase.affected_trees ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                      {diseaseCase.detected_at ? new Date(diseaseCase.detected_at).toISOString().split('T')[0] : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openStatusModal(diseaseCase)}
                        className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                        title="Update Status"
                        aria-label="Update case status"
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

      {/* Report Case Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Report Disease Case</h3>
              <button onClick={() => setShowReportModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Farm *</label>
                <select
                  value={reportForm.farm_id}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, farm_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select farm</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.farm_name || farm.name || farm.owner_name || farm.id}
                    </option>
                  ))}
                </select>
                {farms.length === 0 && (
                  <p className="text-xs text-green-500 mt-1">No farms available. Ensure farms are registered.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Disease *</label>
                <select
                  value={reportForm.disease_id}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, disease_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select disease</option>
                  {diseases.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Severity *</label>
                <select
                  value={reportForm.severity}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, severity: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Affected Trees</label>
                  <input
                    type="number"
                    min="0"
                    value={reportForm.affected_trees}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, affected_trees: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Detected On</label>
                  <input
                    type="date"
                    value={reportForm.detected_at}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, detected_at: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={reportForm.notes}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={reportSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleReportCase}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={reportSaving}
              >
                {reportSaving ? 'Reporting...' : 'Report Case'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && editingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Update Case Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Status</label>
                <select
                  value={editingCase.status}
                  onChange={(e) => setEditingCase((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {CASE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={editingCase.notes}
                  onChange={(e) => setEditingCase((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={statusSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={statusSaving}
              >
                {statusSaving ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseCases;
