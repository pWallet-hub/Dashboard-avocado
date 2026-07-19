import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, Edit, Trash2, X, BarChart3, ListChecks } from 'lucide-react';
import {
  listForecasts,
  createForecast,
  updateForecast,
  deleteForecast,
  compareForecast,
} from '../../services/forecastingService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const EMPTY_FORECAST_FORM = {
  farm_id: '',
  province: '',
  district: '',
  forecast_year: new Date().getFullYear(),
  forecast_season: '',
  predicted_kg: '',
  confidence_pct: 70,
  basis: '',
  notes: '',
};

const accuracyColor = (rating) => {
  const value = typeof rating === 'string' ? rating.toLowerCase() : rating;
  if (typeof value === 'number') {
    if (value >= 90) return 'bg-green-100 text-green-800 ring-green-400';
    if (value >= 70) return 'bg-yellow-100 text-yellow-800 ring-yellow-400';
    return 'bg-red-100 text-red-800 ring-red-400';
  }
  switch (value) {
    case 'excellent':
    case 'high':
    case 'good': return 'bg-green-100 text-green-800 ring-green-400';
    case 'fair':
    case 'medium': return 'bg-yellow-100 text-yellow-800 ring-yellow-400';
    case 'poor':
    case 'low': return 'bg-red-100 text-red-800 ring-red-400';
    default: return 'bg-gray-100 text-gray-800 ring-gray-400';
  }
};

const Forecasting = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState('forecasts');

  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORECAST_FORM);
  const [creating, setCreating] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForecast, setEditForecast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [compareData, setCompareData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  const loadForecasts = useCallback(async () => {
    setLoading(true);
    try {
      const options = yearFilter ? { forecast_year: Number(yearFilter) } : {};
      const data = await listForecasts(options);
      setForecasts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load forecasts');
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  }, [yearFilter, toast]);

  const loadCompare = useCallback(async () => {
    setCompareLoading(true);
    try {
      const data = await compareForecast();
      setCompareData(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load forecast comparison');
      setCompareData([]);
    } finally {
      setCompareLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadForecasts();
  }, [loadForecasts]);

  useEffect(() => {
    if (activeTab === 'compare') {
      loadCompare();
    }
  }, [activeTab, loadCompare]);

  const openCreateModal = () => {
    setCreateForm(EMPTY_FORECAST_FORM);
    setShowCreateModal(true);
  };

  const handleCreateForecast = async () => {
    if (!createForm.forecast_year) {
      toast.error('Forecast year is required');
      return;
    }
    if (createForm.predicted_kg === '' || Number(createForm.predicted_kg) <= 0) {
      toast.error('Please enter a valid predicted kg');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...createForm,
        forecast_year: Number(createForm.forecast_year),
        predicted_kg: Number(createForm.predicted_kg),
        confidence_pct: createForm.confidence_pct !== '' ? Number(createForm.confidence_pct) : undefined,
      };
      if (!payload.farm_id) delete payload.farm_id;
      if (!payload.province) delete payload.province;
      if (!payload.district) delete payload.district;
      if (!payload.forecast_season) delete payload.forecast_season;
      if (!payload.basis) delete payload.basis;
      if (!payload.notes) delete payload.notes;

      await createForecast(payload);
      toast.success('Forecast created successfully');
      setShowCreateModal(false);
      await loadForecasts();
    } catch (error) {
      toast.error(error.message || 'Failed to create forecast');
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (forecast) => {
    setEditForecast({
      id: forecast.id,
      actual_kg: forecast.actual_kg ?? '',
      notes: forecast.notes || '',
      basis: forecast.basis || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateForecast = async () => {
    if (!editForecast?.id) return;
    setSaving(true);
    try {
      const payload = { notes: editForecast.notes, basis: editForecast.basis };
      if (editForecast.actual_kg !== '') {
        payload.actual_kg = Number(editForecast.actual_kg);
      }
      await updateForecast(editForecast.id, payload);
      toast.success('Forecast updated successfully');
      setShowEditModal(false);
      setEditForecast(null);
      await loadForecasts();
    } catch (error) {
      toast.error(error.message || 'Failed to update forecast');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteForecast = async (forecast) => {
    const ok = await confirm(`Delete forecast ${forecast.forecast_number || forecast.id}? This cannot be undone.`, {
      title: 'Delete Forecast',
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    try {
      await deleteForecast(forecast.id);
      toast.success('Forecast deleted');
      await loadForecasts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete forecast');
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <TrendingUp className="h-7 w-7 mr-3 text-green-600" />
              Harvest Forecasting
            </h2>
            <p className="text-green-600 mt-1">Predict avocado harvest yields and track accuracy against actual results</p>
          </div>
          {activeTab === 'forecasts' && (
            <button
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Forecast
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg ring-1 ring-green-100 overflow-hidden">
        <div className="flex border-b border-green-100">
          <button
            onClick={() => setActiveTab('forecasts')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'forecasts' ? 'text-green-700 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <ListChecks className="h-4 w-4 mr-2" />
            Forecasts
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-all ${
              activeTab === 'compare' ? 'text-green-700 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare Accuracy
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'forecasts' && (
            <div className="space-y-4">
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-green-700 mb-2">Filter by Year</label>
                <input
                  type="number"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. 2026"
                />
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-green-600">Loading forecasts...</p>
                </div>
              ) : forecasts.length === 0 ? (
                <div className="p-8 text-center text-green-600">No forecasts found. Create one to get started.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-100">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Forecast #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Year / Season</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Predicted (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Actual (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Confidence</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {forecasts.map((forecast) => (
                        <tr key={forecast.id} className="hover:bg-green-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-green-900">{forecast.forecast_number || forecast.id}</td>
                          <td className="px-4 py-3 text-sm text-green-700">
                            {forecast.forecast_year}{forecast.forecast_season ? ` / ${forecast.forecast_season}` : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">
                            {[forecast.district, forecast.province].filter(Boolean).join(', ') || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">{Number(forecast.predicted_kg || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-700">
                            {forecast.actual_kg != null ? Number(forecast.actual_kg).toLocaleString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">{forecast.confidence_pct != null ? `${forecast.confidence_pct}%` : '-'}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openEditModal(forecast)}
                                className="text-blue-600 hover:text-blue-800 transition"
                                title="Record Actual / Edit"
                                aria-label="Edit forecast"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteForecast(forecast)}
                                className="text-red-600 hover:text-red-800 transition"
                                title="Delete"
                                aria-label="Delete forecast"
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

          {activeTab === 'compare' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">Forecast Accuracy</h3>
              {compareLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-green-600">Loading comparison...</p>
                </div>
              ) : compareData.length === 0 ? (
                <div className="p-8 text-center text-green-600">No forecasts with recorded actual harvests yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-green-100">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Forecast #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Predicted (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Actual (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Variance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase">Accuracy Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {compareData.map((row) => (
                        <tr key={row.id} className="hover:bg-green-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-green-900">{row.forecast_number || row.id}</td>
                          <td className="px-4 py-3 text-sm text-green-700">{row.forecast_year}</td>
                          <td className="px-4 py-3 text-sm text-green-700">{Number(row.predicted_kg || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-700">{Number(row.actual_kg || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-700">{row.variance_pct != null ? `${row.variance_pct}%` : '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${accuracyColor(row.accuracy_rating)}`}>
                              {row.accuracy_rating ?? 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Forecast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Create Forecast</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Forecast Year *</label>
                  <input
                    type="number"
                    value={createForm.forecast_year}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, forecast_year: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Season</label>
                  <input
                    type="text"
                    value={createForm.forecast_season}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, forecast_season: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Season A"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Farm ID</label>
                <input
                  type="text"
                  value={createForm.farm_id}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, farm_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Optional - specific farm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Province</label>
                  <select
                    value={createForm.province}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, province: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Province</option>
                    <option value="Kigali">Kigali</option>
                    <option value="Eastern">Eastern</option>
                    <option value="Northern">Northern</option>
                    <option value="Southern">Southern</option>
                    <option value="Western">Western</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">District</label>
                  <input
                    type="text"
                    value={createForm.district}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, district: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Predicted (kg) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.predicted_kg}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, predicted_kg: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Confidence %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={createForm.confidence_pct}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, confidence_pct: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Basis</label>
                <input
                  type="text"
                  value={createForm.basis}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, basis: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Historical yield trend, tree count"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForecast}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Forecast'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Record Actual Modal */}
      {showEditModal && editForecast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Record Actual Harvest</h3>
              <button onClick={() => setShowEditModal(false)} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Actual Harvest (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForecast.actual_kg}
                  onChange={(e) => setEditForecast((prev) => ({ ...prev, actual_kg: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Basis</label>
                <input
                  type="text"
                  value={editForecast.basis}
                  onChange={(e) => setEditForecast((prev) => ({ ...prev, basis: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={editForecast.notes}
                  onChange={(e) => setEditForecast((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateForecast}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecasting;
