import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Edit, Trash2, Archive, CheckCircle, X, FileText, Video, File, HelpCircle } from 'lucide-react';
import {
  listAllTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  publishTraining,
  archiveTraining,
} from '../../services/trainingService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const CONTENT_TYPES = ['article', 'video', 'pdf', 'quiz'];

const emptyForm = {
  title: '',
  description: '',
  content_type: 'article',
  content_url: '',
  thumbnail_url: '',
  tags: '',
};

const contentTypeIcon = (type) => {
  switch (type) {
    case 'video': return Video;
    case 'pdf': return File;
    case 'quiz': return HelpCircle;
    default: return FileText;
  }
};

const statusBadge = (status) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800 ring-green-500';
    case 'archived': return 'bg-gray-200 text-gray-700 ring-gray-400';
    case 'draft':
    default: return 'bg-yellow-100 text-yellow-800 ring-yellow-500';
  }
};

const Training = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllTraining();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading training content:', err);
      setError(err.message || 'Failed to load training content');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => statusFilter === 'all' || item.status === statusFilter);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      content_type: item.content_type || 'article',
      content_url: item.content_url || '',
      thumbnail_url: item.thumbnail_url || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingItem(null);
    setFormData(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content_type: formData.content_type,
        content_url: formData.content_url.trim(),
        thumbnail_url: formData.thumbnail_url.trim(),
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingItem) {
        await updateTraining(editingItem.id, payload);
        toast.success('Training content updated successfully');
      } else {
        await createTraining(payload);
        toast.success('Training content created successfully');
      }

      closeFormModal();
      await loadItems();
    } catch (err) {
      console.error('Error saving training content:', err);
      toast.error(err.message || 'Failed to save training content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`Delete "${item.title}"? This cannot be undone.`, {
      title: 'Delete Training Content',
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    try {
      await deleteTraining(item.id);
      toast.success('Training content deleted');
      await loadItems();
    } catch (err) {
      console.error('Error deleting training content:', err);
      toast.error(err.message || 'Failed to delete training content');
    }
  };

  const handlePublish = async (item) => {
    try {
      await publishTraining(item.id);
      toast.success('Training content published');
      await loadItems();
    } catch (err) {
      console.error('Error publishing training content:', err);
      toast.error(err.message || 'Failed to publish training content');
    }
  };

  const handleArchive = async (item) => {
    try {
      await archiveTraining(item.id);
      toast.success('Training content archived');
      await loadItems();
    } catch (err) {
      console.error('Error archiving training content:', err);
      toast.error(err.message || 'Failed to archive training content');
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <GraduationCap className="h-7 w-7 mr-3 text-green-600" />
              Training Content Management
            </h2>
            <p className="text-green-600 mt-1">Create and manage training material for farmers</p>
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
            New Training Content
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-green-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <span className="text-sm text-green-600 ml-auto">
            Total: <span className="font-semibold">{filteredItems.length}</span>
          </span>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading training content...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <GraduationCap className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No training content found</p>
            <p className="text-green-500 text-sm">Create your first training item to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {filteredItems.map((item) => {
                  const Icon = contentTypeIcon(item.content_type);
                  return (
                    <tr key={item.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-green-900">{item.title}</div>
                        <div className="text-xs text-green-600 line-clamp-1">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-sm text-green-800">
                          <Icon className="h-4 w-4" /> {item.content_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusBadge(item.status)}`}>
                          {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(item.tags || []).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                            title="Edit"
                            aria-label="Edit training content"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          {item.status !== 'published' && (
                            <button
                              onClick={() => handlePublish(item)}
                              className="text-green-600 hover:text-green-800 transform hover:scale-110 transition"
                              title="Publish"
                              aria-label="Publish training content"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          {item.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(item)}
                              className="text-gray-600 hover:text-gray-800 transform hover:scale-110 transition"
                              title="Archive"
                              aria-label="Archive training content"
                            >
                              <Archive className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-800 transform hover:scale-110 transition"
                            title="Delete"
                            aria-label="Delete training content"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">
                {editingItem ? 'Edit Training Content' : 'New Training Content'}
              </h3>
              <button onClick={closeFormModal} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter training title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Describe the training content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Content Type *</label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content_type: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="pest-control, irrigation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Content URL</label>
                <input
                  type="text"
                  value={formData.content_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content_url: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Thumbnail URL</label>
                <input
                  type="text"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={closeFormModal}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={saving}
              >
                {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
