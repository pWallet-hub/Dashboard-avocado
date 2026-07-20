import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Plus, Edit, Trash2, RefreshCw, Filter } from 'lucide-react';
import {
  listSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  initializeSettings,
} from '../../services/settingsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const emptySetting = () => ({ key: '', value: '', description: '', category: '', data_type: 'string', is_editable: true });

const Settings = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [initializing, setInitializing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newSetting, setNewSetting] = useState(emptySetting());

  const [editSetting, setEditSetting] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const loadSettings = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSettings(category && category !== 'all' ? category : undefined);
      setSettings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings(categoryFilter);
  }, [categoryFilter]);

  const categories = Array.from(new Set(settings.map((s) => s.category).filter(Boolean)));

  const handleInitializeDefaults = async () => {
    setInitializing(true);
    try {
      await initializeSettings();
      toast.success('Default settings initialized (safe no-op if already present)');
      await loadSettings(categoryFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to initialize default settings');
    } finally {
      setInitializing(false);
    }
  };

  const handleCreateSetting = async () => {
    if (!newSetting.key.trim()) {
      toast.error('Setting key is required');
      return;
    }
    if (newSetting.value === '') {
      toast.error('Setting value is required');
      return;
    }
    setCreateLoading(true);
    try {
      await createSetting({
        key: newSetting.key.trim(),
        value: newSetting.value,
        description: newSetting.description || undefined,
        category: newSetting.category || undefined,
        data_type: newSetting.data_type || 'string',
        is_editable: newSetting.is_editable,
      });
      toast.success('Setting created successfully');
      setNewSetting(emptySetting());
      setShowCreateModal(false);
      await loadSettings(categoryFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to create setting');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (setting) => {
    setEditSetting({ key: setting.key, value: setting.value ?? '', description: setting.description || '' });
  };

  const handleUpdateSetting = async () => {
    if (!editSetting?.key) return;
    if (editSetting.value === '') {
      toast.error('Setting value is required');
      return;
    }
    setEditLoading(true);
    try {
      await updateSetting(editSetting.key, {
        value: editSetting.value,
        description: editSetting.description || undefined,
      });
      toast.success('Setting updated successfully');
      setEditSetting(null);
      await loadSettings(categoryFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to update setting');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSetting = async (key) => {
    const ok = await confirm(`Delete setting "${key}"? This cannot be undone.`, { title: 'Delete Setting' });
    if (!ok) return;
    try {
      await deleteSetting(key);
      toast.success('Setting deleted');
      await loadSettings(categoryFilter);
    } catch (err) {
      toast.error(err.message || 'Failed to delete setting');
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <SettingsIcon className="h-7 w-7 mr-3 text-green-600" />
              System Settings
            </h2>
            <p className="text-green-600 mt-1">Manage global configuration key/value settings</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">{error}</div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleInitializeDefaults}
              disabled={initializing}
              title="Safe to run even if settings already exist — it is a no-op in that case"
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${initializing ? 'animate-spin' : ''}`} />
              Initialize Defaults
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Setting
            </button>
          </div>
        </div>
        <p className="text-xs text-green-500 mt-3">
          &quot;Initialize Defaults&quot; seeds the default system settings only if none exist yet — safe to click at any time.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Total Settings: <span className="font-semibold">{settings.length}</span>
            </span>
            <button
              onClick={() => loadSettings(categoryFilter)}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading settings...</p>
          </div>
        ) : settings.length === 0 ? (
          <div className="p-8 text-center">
            <SettingsIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No settings found</p>
            <p className="text-green-500 text-sm mb-4">Initialize defaults or add your first setting.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {settings.map((setting) => (
                  <tr key={setting.key || setting.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">{setting.key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 max-w-xs truncate">{String(setting.value)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        {setting.category || 'general'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 max-w-sm truncate">{setting.description || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openEditModal(setting)}
                          className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                          title="Edit Setting"
                          aria-label="Edit Setting"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting.key)}
                          className="text-red-600 hover:text-red-800 transform hover:scale-110 transition"
                          title="Delete Setting"
                          aria-label="Delete Setting"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Add Setting</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-green-400 hover:text-green-600 text-2xl" aria-label="Close">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Key *</label>
                <input
                  type="text"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, key: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. site_name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Value *</label>
                <input
                  type="text"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Category</label>
                <input
                  type="text"
                  value={newSetting.category}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. general"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Data Type</label>
                <select
                  value={newSetting.data_type}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, data_type: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  value={newSetting.description}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_editable"
                  checked={newSetting.is_editable}
                  onChange={(e) => setNewSetting((prev) => ({ ...prev, is_editable: e.target.checked }))}
                  className="h-4 w-4 text-green-600 border-green-300 rounded"
                />
                <label htmlFor="is_editable" className="text-sm text-green-700">Editable</label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSetting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Setting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Edit Setting - {editSetting.key}</h3>
              <button onClick={() => setEditSetting(null)} className="text-green-400 hover:text-green-600 text-2xl" aria-label="Close">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Value *</label>
                <input
                  type="text"
                  value={editSetting.value}
                  onChange={(e) => setEditSetting((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  value={editSetting.description}
                  onChange={(e) => setEditSetting((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setEditSetting(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSetting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
