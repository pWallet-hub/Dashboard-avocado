import { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  Download,
  BarChart3,
  Search,
  Filter,
} from 'lucide-react';
import {
  listReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  uploadReportAttachments,
  exportReports,
  getReportStatistics,
} from '../../services/reportsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const REPORT_TYPES = ['inspection', 'audit', 'assessment', 'survey', 'other'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const emptyForm = {
  title: '',
  description: '',
  report_type: 'inspection',
  agent_id: '',
  farmer_id: '',
  scheduled_date: '',
  location: '',
  findings: '',
  recommendations: '',
  notes: '',
  priority: 'medium',
  status: '',
};

const statusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 ring-green-500';
    case 'in_progress': return 'bg-blue-100 text-blue-800 ring-blue-500';
    case 'cancelled': return 'bg-red-100 text-red-800 ring-red-500';
    case 'pending':
    default: return 'bg-yellow-100 text-yellow-800 ring-yellow-500';
  }
};

const priorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium':
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const Report = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const options = {};
      if (typeFilter !== 'all') options.report_type = typeFilter;
      if (statusFilter !== 'all') options.status = statusFilter;

      const data = await listReports(options);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getReportStatistics();
      setStats(data);
    } catch (err) {
      console.error('Error loading report statistics:', err);
    }
  };

  useEffect(() => {
    loadReports();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  const filteredReports = reports.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.title || '').toLowerCase().includes(term) ||
      (r.location || '').toLowerCase().includes(term) ||
      (r.description || '').toLowerCase().includes(term)
    );
  });

  const openCreateModal = () => {
    setEditingReport(null);
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (r) => {
    setEditingReport(r);
    setFormData({
      title: r.title || '',
      description: r.description || '',
      report_type: r.report_type || 'inspection',
      agent_id: r.agent_id || '',
      farmer_id: r.farmer_id || '',
      scheduled_date: r.scheduled_date ? r.scheduled_date.slice(0, 16) : '',
      location: r.location || '',
      findings: r.findings || '',
      recommendations: r.recommendations || '',
      notes: r.notes || '',
      priority: r.priority || 'medium',
      status: r.status || '',
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingReport(null);
    setFormData(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      if (!formData.scheduled_date) {
        toast.error('Scheduled date is required');
        return;
      }
      if (!formData.location.trim()) {
        toast.error('Location is required');
        return;
      }
      if (isAdmin && !editingReport && !formData.agent_id.trim()) {
        toast.error('Agent is required when creating a report as admin');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        report_type: formData.report_type,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        location: formData.location.trim(),
        findings: formData.findings.trim(),
        recommendations: formData.recommendations.trim(),
        notes: formData.notes.trim(),
        priority: formData.priority,
      };
      if (formData.farmer_id.trim()) payload.farmer_id = formData.farmer_id.trim();
      if (isAdmin && formData.agent_id.trim()) payload.agent_id = formData.agent_id.trim();

      if (editingReport) {
        if (formData.status) payload.status = formData.status;
        await updateReport(editingReport.id, payload);
        toast.success('Report updated successfully');
      } else {
        await createReport(payload);
        toast.success('Report created successfully');
      }

      closeFormModal();
      await loadReports();
      await loadStats();
    } catch (err) {
      console.error('Error saving report:', err);
      toast.error(err.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    const ok = await confirm(`Delete report "${r.title}"? This cannot be undone.`, {
      title: 'Delete Report',
      confirmLabel: 'Delete',
    });
    if (!ok) return;

    try {
      await deleteReport(r.id);
      toast.success('Report deleted');
      await loadReports();
      await loadStats();
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error(err.message || 'Failed to delete report');
    }
  };

  const openViewModal = async (r) => {
    try {
      const detail = await getReport(r.id);
      setSelectedReport(detail || r);
    } catch (err) {
      console.error('Error loading report detail:', err);
      toast.error(err.message || 'Failed to load report');
      setSelectedReport(r);
    }
    setAttachmentFiles([]);
  };

  const closeViewModal = () => {
    setSelectedReport(null);
    setAttachmentFiles([]);
  };

  const handleUploadAttachments = async () => {
    if (!selectedReport || attachmentFiles.length === 0) {
      toast.error('Please choose at least one file to upload');
      return;
    }
    setUploading(true);
    try {
      await uploadReportAttachments(selectedReport.id, attachmentFiles);
      toast.success('Attachments uploaded successfully');
      const refreshed = await getReport(selectedReport.id);
      setSelectedReport(refreshed || selectedReport);
      setAttachmentFiles([]);
    } catch (err) {
      console.error('Error uploading attachments:', err);
      toast.error(err.message || 'Failed to upload attachments');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const options = { format: exportFormat };
      if (typeFilter !== 'all') options.report_type = typeFilter;
      if (statusFilter !== 'all') options.status = statusFilter;
      await exportReports(options);
      toast.success('Export downloaded');
    } catch (err) {
      console.error('Error exporting reports:', err);
      toast.error(err.message || 'Failed to export reports');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <FileText className="h-7 w-7 mr-3 text-green-600" />
              Field Reports
            </h2>
            <p className="text-green-600 mt-1">Create, track, and export your inspection and audit reports</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              aria-label="Export format"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center px-4 py-2 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-all disabled:opacity-50"
            >
              <Download className="h-5 w-5 mr-2" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <BarChart3 className="h-4 w-4" /> Total Reports
            </div>
            <p className="text-2xl font-bold text-green-800">{stats.total ?? reports.length}</p>
          </div>
          {stats.by_status && Object.entries(stats.by_status).slice(0, 3).map(([key, value]) => (
            <div key={key} className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
              <p className="text-sm text-green-600 mb-1 capitalize">{key.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-green-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none"
            >
              <option value="all">All Types</option>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No reports found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Report
            </button>
          </div>
        ) : (
          <div className="divide-y divide-green-100">
            {filteredReports.map((r) => (
              <div key={r.id} className="p-6 hover:bg-green-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-green-900">{r.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusColor(r.status)}`}>
                        {(r.status || 'pending').replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColor(r.priority)}`}>
                        {(r.priority || 'medium')} priority
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                        {r.report_type}
                      </span>
                    </div>
                    <p className="text-sm text-green-700 line-clamp-2">{r.description}</p>
                    <div className="mt-2 text-xs text-green-600 flex flex-wrap gap-4">
                      <span>Location: {r.location}</span>
                      {r.scheduled_date && (
                        <span>Scheduled: {new Date(r.scheduled_date).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openViewModal(r)}
                      className="text-green-600 hover:text-green-800 transform hover:scale-110 transition"
                      title="View"
                      aria-label="View report"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(r)}
                      className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                      title="Edit"
                      aria-label="Edit report"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(r)}
                        className="text-red-600 hover:text-red-800 transform hover:scale-110 transition"
                        title="Delete"
                        aria-label="Delete report"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">
                {editingReport ? 'Edit Report' : 'New Report'}
              </h3>
              <button onClick={closeFormModal} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter report title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows="3"
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the purpose and scope of this report"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Report Type *</label>
                <select
                  value={formData.report_type}
                  onChange={(e) => setFormData((p) => ({ ...p, report_type: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Scheduled Date *</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData((p) => ({ ...p, scheduled_date: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Musanze District, Sector 3"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Agent ID {!editingReport && '*'}
                  </label>
                  <input
                    type="text"
                    value={formData.agent_id}
                    onChange={(e) => setFormData((p) => ({ ...p, agent_id: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Agent user ID"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Farmer ID (optional)</label>
                <input
                  type="text"
                  value={formData.farmer_id}
                  onChange={(e) => setFormData((p) => ({ ...p, farmer_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Farmer user ID"
                />
              </div>

              {editingReport && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                    className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Unchanged</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2">Findings</label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => setFormData((p) => ({ ...p, findings: e.target.value }))}
                  rows="2"
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="What did you find during this inspection?"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2">Recommendations</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData((p) => ({ ...p, recommendations: e.target.value }))}
                  rows="2"
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Recommended next steps"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  rows="2"
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Additional notes"
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
                {saving ? 'Saving...' : editingReport ? 'Update Report' : 'Create Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View / Attachments Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">{selectedReport.title}</h3>
              <button onClick={closeViewModal} className="text-green-400 hover:text-green-600" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusColor(selectedReport.status)}`}>
                    {(selectedReport.status || 'pending').replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColor(selectedReport.priority)}`}>
                    {selectedReport.priority} priority
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                    {selectedReport.report_type}
                  </span>
                </div>
                <p className="text-sm text-green-700"><span className="font-medium">Description:</span> {selectedReport.description}</p>
                <p className="text-sm text-green-700"><span className="font-medium">Location:</span> {selectedReport.location}</p>
                {selectedReport.scheduled_date && (
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Scheduled:</span> {new Date(selectedReport.scheduled_date).toLocaleString()}
                  </p>
                )}
                {selectedReport.findings && (
                  <p className="text-sm text-green-700"><span className="font-medium">Findings:</span> {selectedReport.findings}</p>
                )}
                {selectedReport.recommendations && (
                  <p className="text-sm text-green-700"><span className="font-medium">Recommendations:</span> {selectedReport.recommendations}</p>
                )}
                {selectedReport.notes && (
                  <p className="text-sm text-green-700"><span className="font-medium">Notes:</span> {selectedReport.notes}</p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Attachments</h4>
                  {selectedReport.attachments && selectedReport.attachments.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedReport.attachments.map((att, idx) => (
                        <li key={att.id || idx} className="text-sm text-green-700 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {att.url ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">
                              {att.filename || att.name || `Attachment ${idx + 1}`}
                            </a>
                          ) : (
                            <span>{att.filename || att.name || `Attachment ${idx + 1}`}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-green-500">No attachments yet.</p>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-green-700 mb-2">Upload New Attachments</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setAttachmentFiles(Array.from(e.target.files || []))}
                    className="block w-full text-sm text-green-700 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700"
                  />
                  <button
                    onClick={handleUploadAttachments}
                    disabled={uploading || attachmentFiles.length === 0}
                    className="mt-3 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={closeViewModal}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
