import React, { useEffect, useMemo, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import {
  FileText, Clock, CheckCircle2, AlertTriangle,
  X, Eye, Pencil, Trash2, Download, Paperclip, RefreshCcw,
} from 'lucide-react';
import {
  listReports,
  getReportStatistics,
  createReport,
  updateReport,
  deleteReport,
  uploadReportAttachments,
  exportReports,
} from '../../services/reportsService';
import '../Styles/Report.css';

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
  priority: 'low',
  status: 'pending',
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null); // from /reports/statistics
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [viewReport, setViewReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Filters (mirror listReports' supported params)
  const [filters, setFilters] = useState({
    report_type: '',
    status: '',
    agent_id: '',
    date_from: '',
    date_to: '',
  });

  // Attachment upload (inside view modal)
  const [attachFiles, setAttachFiles] = useState([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  const fetchAll = async (activeFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const cleanFilters = {};
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v) cleanFilters[k] = v;
      });

      const [reportsData, statsData] = await Promise.all([
        listReports(cleanFilters),
        getReportStatistics().catch(() => null), // stats endpoint is a bonus, don't block the page if it fails
      ]);

      setReports(Array.isArray(reportsData) ? reportsData : []);
      setStats(statsData);

      if (Array.isArray(reportsData) && reportsData.length > 0) {
        setSelectedReport(prev => prev || reportsData[0]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'There was an error fetching reports.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchAll(filters);
  };

  const resetFilters = () => {
    const cleared = { report_type: '', status: '', agent_id: '', date_from: '', date_to: '' };
    setFilters(cleared);
    fetchAll(cleared);
  };

  const openAddModal = () => {
    setEditingReport(null);
    setForm(emptyForm);
    setIsFormModalOpen(true);
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setForm({
      title: report.title || '',
      description: report.description || '',
      report_type: report.report_type || 'inspection',
      agent_id: report.agent_id || '',
      farmer_id: report.farmer_id || '',
      scheduled_date: report.scheduled_date ? toDateTimeLocal(report.scheduled_date) : '',
      location: report.location || '',
      findings: report.findings || '',
      recommendations: report.recommendations || '',
      notes: report.notes || '',
      priority: report.priority || 'low',
      status: report.status || 'pending',
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingReport(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : undefined,
      };
      // status is only meaningful on update — creation defaults server-side to "pending"
      if (!editingReport) delete payload.status;

      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) delete payload[key];
      });

      if (editingReport) {
        const updated = await updateReport(editingReport.id, payload);
        setReports(prev => prev.map(r => (r.id === editingReport.id ? { ...r, ...updated } : r)));
      } else {
        const created = await createReport(payload);
        setReports(prev => [created, ...prev]);
      }
      closeFormModal();
      fetchAll(); // refresh stats too
    } catch (err) {
      console.error('Error saving report:', err);
      setError(err.message || 'There was an error saving the report.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Delete report "${report.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteReport(report.id);
      setReports(prev => prev.filter(r => r.id !== report.id));
      if (selectedReport?.id === report.id) setSelectedReport(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.message || 'There was an error deleting the report.');
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    setError(null);
    try {
      const cleanFilters = {};
      if (filters.report_type) cleanFilters.report_type = filters.report_type;
      if (filters.status) cleanFilters.status = filters.status;
      if (filters.agent_id) cleanFilters.agent_id = filters.agent_id;
      if (filters.date_from) cleanFilters.from = filters.date_from;
      if (filters.date_to) cleanFilters.to = filters.date_to;

      await exportReports({ ...cleanFilters, format });
    } catch (err) {
      console.error('Error exporting reports:', err);
      setError(err.message || 'There was an error exporting reports.');
    } finally {
      setExporting(false);
    }
  };

  const handleAttachmentUpload = async () => {
    if (!viewReport || attachFiles.length === 0) return;
    setUploadingAttachments(true);
    setError(null);
    try {
      await uploadReportAttachments(viewReport.id, attachFiles);
      setAttachFiles([]);
      alert('Attachments uploaded successfully.');
    } catch (err) {
      console.error('Error uploading attachments:', err);
      setError(err.message || 'There was an error uploading attachments.');
    } finally {
      setUploadingAttachments(false);
    }
  };

  // ---- Stats: prefer the backend /reports/statistics payload, fall back to client-derived ----
  const byStatus = stats?.by_status || {};
  const byPriority = stats?.by_priority || {};

  const totalReports = stats?.total ?? reports.length;
  const pendingCount = byStatus.pending ?? reports.filter(r => r.status === 'pending').length;
  const completedCount = byStatus.completed ?? reports.filter(r => r.status === 'completed').length;
  const highPriorityCount = (byPriority.high ?? reports.filter(r => r.priority === 'high').length)
    + (byPriority.urgent ?? reports.filter(r => r.priority === 'urgent').length);

  const inProgressCount = byStatus.in_progress ?? reports.filter(r => r.status === 'in_progress').length;
  const completionRate = totalReports > 0 ? Math.round((completedCount / totalReports) * 100) : 0;

  const priorityCounts = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, urgent: 0 };
    if (Object.keys(byPriority).length > 0) {
      PRIORITIES.forEach(p => { counts[p] = byPriority[p] || 0; });
    } else {
      reports.forEach(r => {
        if (counts[r.priority] !== undefined) counts[r.priority] += 1;
      });
    }
    return counts;
  }, [reports, byPriority]);
  const maxPriorityCount = Math.max(1, ...Object.values(priorityCounts));

  return (
    <div className="container">
      <div className="reports-wrapper">
        {/* Header */}
        <div className="header-section">
          <div className="header-content">
            <div>
              <h1>Field Reports</h1>
              <p className="header-subtitle">Inspections, audits, and assessments logged by field agents</p>
            </div>
            <div className="action-buttons">
              <button onClick={() => handleExport('csv')} disabled={exporting} className="btn btn-secondary">
                <Download size={16} style={{ marginRight: 6 }} />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <button onClick={openAddModal} className="btn btn-primary">
                + New Report
              </button>
            </div>
          </div>

          {/* Stat cards — sourced from /reports/statistics where available */}
          <div className="stats-grid stats-grid-4">
            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-indigo">
                <FileText size={22} />
              </div>
              <div className="stat-text">
                <p className="stat-value">{totalReports}</p>
                <p className="stat-label">Total Reports</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-amber">
                <Clock size={22} />
              </div>
              <div className="stat-text">
                <p className="stat-value">{pendingCount}</p>
                <p className="stat-label">Pending</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-blue">
                <AlertTriangle size={22} />
              </div>
              <div className="stat-text">
                <p className="stat-value">{highPriorityCount}</p>
                <p className="stat-label">High Priority</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap stat-icon-teal">
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-text">
                <p className="stat-value">{completedCount}</p>
                <p className="stat-label">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-wrap error-banner">{error}</div>}

        {/* Filter bar */}
        <div className="filter-bar">
          <select name="report_type" value={filters.report_type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            {REPORT_TYPES.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
          </select>
          <input
            type="text"
            name="agent_id"
            placeholder="Agent ID"
            value={filters.agent_id}
            onChange={handleFilterChange}
          />
          <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
          <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
          <button onClick={applyFilters} className="btn btn-primary btn-small">Apply</button>
          <button onClick={resetFilters} className="btn btn-cancel btn-small">
            <RefreshCcw size={14} style={{ marginRight: 4 }} />
            Reset
          </button>
        </div>

        {/* Middle row: snapshot + table */}
        <div className="dashboard-row">
          <div className="panel-card snapshot-card">
            <div className="panel-card-header">
              <h2>Report Snapshot</h2>
            </div>
            {selectedReport ? (
              <div className="snapshot-body">
                <h3 className="snapshot-title">{selectedReport.title}</h3>
                <div className="snapshot-badges">
                  <span className={`status-badge status-${selectedReport.status || 'pending'}`}>
                    {formatLabel(selectedReport.status || 'pending')}
                  </span>
                  <span className={`priority-badge priority-${selectedReport.priority || 'low'}`}>
                    {(selectedReport.priority || 'low').toUpperCase()}
                  </span>
                </div>

                <div className="snapshot-fields">
                  <div className="snapshot-field">
                    <span className="snapshot-label">Type</span>
                    <span className="snapshot-value">{formatLabel(selectedReport.report_type)}</span>
                  </div>
                  <div className="snapshot-field">
                    <span className="snapshot-label">Location</span>
                    <span className="snapshot-value">{selectedReport.location || 'N/A'}</span>
                  </div>
                  <div className="snapshot-field">
                    <span className="snapshot-label">Scheduled</span>
                    <span className="snapshot-value">{formatDate(selectedReport.scheduled_date)}</span>
                  </div>
                  <div className="snapshot-field">
                    <span className="snapshot-label">Agent ID</span>
                    <span className="snapshot-value">{selectedReport.agent_id || 'N/A'}</span>
                  </div>
                  <div className="snapshot-field">
                    <span className="snapshot-label">Farmer ID</span>
                    <span className="snapshot-value">{selectedReport.farmer_id || 'N/A'}</span>
                  </div>
                </div>

                {selectedReport.description && (
                  <div className="snapshot-description">
                    <span className="snapshot-label">Description</span>
                    <p>{selectedReport.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">Select a report to preview it here.</div>
            )}
          </div>

          {/* Reports table */}
          <div className="table-container">
            <div className="table-container-header">
              <h2>All Reports</h2>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="loading-wrap">
                  <ClipLoader color="#16a34a" loading={loading} size={44} />
                </div>
              ) : reports.length > 0 ? (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>No.</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Location</th>
                      <th>Scheduled</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, idx) => (
                      <tr
                        key={report.id || idx}
                        className={`table-row selectable-row ${selectedReport?.id === report.id ? 'row-selected' : ''}`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="table-cell cell-muted">{idx + 1}</td>
                        <td className="table-cell cell-name">{report.title}</td>
                        <td className="table-cell cell-muted">{formatLabel(report.report_type)}</td>
                        <td className="table-cell">
                          <span className={`status-badge status-${report.status || 'pending'}`}>
                            {formatLabel(report.status || 'pending')}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`priority-badge priority-${report.priority || 'low'}`}>
                            {(report.priority || 'low').toUpperCase()}
                          </span>
                        </td>
                        <td className="table-cell cell-muted">{report.location || 'N/A'}</td>
                        <td className="table-cell cell-muted">{formatDate(report.scheduled_date)}</td>
                        <td className="table-cell action-cell" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setViewReport(report)} className="icon-btn icon-btn-view" title="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(report)} className="icon-btn icon-btn-edit" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(report)} className="icon-btn icon-btn-delete" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">No reports match the current filters.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: chart + trend cards */}
        <div className="dashboard-row bottom-row">
          <div className="panel-card chart-card">
            <div className="panel-card-header">
              <h2>Reports by Priority</h2>
            </div>
            <div className="bar-chart">
              {PRIORITIES.map(p => (
                <div className="bar-chart-column" key={p}>
                  <div className="bar-chart-track">
                    <div
                      className={`bar-chart-fill bar-fill-${p}`}
                      style={{ height: `${(priorityCounts[p] / maxPriorityCount) * 100}%` }}
                    />
                  </div>
                  <span className="bar-chart-value">{priorityCounts[p]}</span>
                  <span className="bar-chart-label">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="trend-stack">
            <div className="trend-card">
              <span className="trend-label">IN PROGRESS</span>
              <div className="trend-value-row">
                <span className="trend-value">{inProgressCount}</span>
              </div>
              <span className="trend-sub">reports currently being worked</span>
            </div>

            <div className="trend-card">
              <span className="trend-label">COMPLETION RATE</span>
              <div className="trend-value-row">
                <span className="trend-value">{completionRate}%</span>
              </div>
              <span className="trend-sub">{completedCount} of {totalReports} reports completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Report Modal */}
      {isFormModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-wide">
            <div className="modal-header">
              <h2 className="modal-title">{editingReport ? 'Edit Report' : 'New Report'}</h2>
              <button onClick={closeFormModal} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleSubmitForm} className="report-form">
              <div className="form-grid">
                <div className="form-field form-field-full">
                  <label>Title *</label>
                  <input type="text" name="title" value={form.title} onChange={handleFormChange} required />
                </div>

                <div className="form-field form-field-full">
                  <label>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} required />
                </div>

                <div className="form-field">
                  <label>Report Type *</label>
                  <select name="report_type" value={form.report_type} onChange={handleFormChange} required>
                    {REPORT_TYPES.map(t => (
                      <option key={t} value={t}>{formatLabel(t)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Priority</label>
                  <select name="priority" value={form.priority} onChange={handleFormChange}>
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {editingReport && (
                  <div className="form-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleFormChange}>
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{formatLabel(s)}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-field">
                  <label>Agent ID {editingReport ? '' : '(admin only — leave blank to self-assign)'}</label>
                  <input type="text" name="agent_id" value={form.agent_id} onChange={handleFormChange} placeholder="Agent ID" />
                </div>

                <div className="form-field">
                  <label>Farmer ID</label>
                  <input type="text" name="farmer_id" value={form.farmer_id} onChange={handleFormChange} placeholder="Farmer ID" />
                </div>

                <div className="form-field">
                  <label>Scheduled Date *</label>
                  <input type="datetime-local" name="scheduled_date" value={form.scheduled_date} onChange={handleFormChange} required />
                </div>

                <div className="form-field">
                  <label>Location *</label>
                  <input type="text" name="location" value={form.location} onChange={handleFormChange} placeholder="Farm / site location" required />
                </div>

                <div className="form-field form-field-full">
                  <label>Findings</label>
                  <textarea name="findings" value={form.findings} onChange={handleFormChange} rows={3} />
                </div>

                <div className="form-field form-field-full">
                  <label>Recommendations</label>
                  <textarea name="recommendations" value={form.recommendations} onChange={handleFormChange} rows={3} />
                </div>

                <div className="form-field form-field-full">
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={2} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeFormModal} className="btn btn-cancel">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-confirm">
                  {saving ? 'Saving...' : editingReport ? 'Save Changes' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {viewReport && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-wide">
            <div className="modal-header">
              <h2 className="modal-title">{viewReport.title}</h2>
              <button onClick={() => { setViewReport(null); setAttachFiles([]); }} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="view-grid">
              <div className="view-field">
                <span className="snapshot-label">Type</span>
                <span className="snapshot-value">{formatLabel(viewReport.report_type)}</span>
              </div>
              <div className="view-field">
                <span className="snapshot-label">Status</span>
                <span className={`status-badge status-${viewReport.status || 'pending'}`}>
                  {formatLabel(viewReport.status || 'pending')}
                </span>
              </div>
              <div className="view-field">
                <span className="snapshot-label">Priority</span>
                <span className={`priority-badge priority-${viewReport.priority || 'low'}`}>
                  {(viewReport.priority || 'low').toUpperCase()}
                </span>
              </div>
              <div className="view-field">
                <span className="snapshot-label">Location</span>
                <span className="snapshot-value">{viewReport.location || 'N/A'}</span>
              </div>
              <div className="view-field">
                <span className="snapshot-label">Scheduled Date</span>
                <span className="snapshot-value">{formatDate(viewReport.scheduled_date)}</span>
              </div>
              <div className="view-field">
                <span className="snapshot-label">Agent ID</span>
                <span className="snapshot-value">{viewReport.agent_id || 'N/A'}</span>
              </div>
              <div className="view-field">
                <span className="snapshot-label">Farmer ID</span>
                <span className="snapshot-value">{viewReport.farmer_id || 'N/A'}</span>
              </div>
            </div>

            {viewReport.description && (
              <div className="view-block">
                <span className="snapshot-label">Description</span>
                <p>{viewReport.description}</p>
              </div>
            )}
            {viewReport.findings && (
              <div className="view-block">
                <span className="snapshot-label">Findings</span>
                <p>{viewReport.findings}</p>
              </div>
            )}
            {viewReport.recommendations && (
              <div className="view-block">
                <span className="snapshot-label">Recommendations</span>
                <p>{viewReport.recommendations}</p>
              </div>
            )}
            {viewReport.notes && (
              <div className="view-block">
                <span className="snapshot-label">Notes</span>
                <p>{viewReport.notes}</p>
              </div>
            )}

            {/* Attachment upload */}
            <div className="view-block attachment-block">
              <span className="snapshot-label">Attachments</span>
              <div className="attachment-row">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachFiles(Array.from(e.target.files || []))}
                />
                <button
                  onClick={handleAttachmentUpload}
                  disabled={uploadingAttachments || attachFiles.length === 0}
                  className="btn btn-confirm btn-small"
                >
                  <Paperclip size={14} style={{ marginRight: 4 }} />
                  {uploadingAttachments ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => { setViewReport(null); setAttachFiles([]); }} className="btn btn-cancel">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- helpers ----
function formatLabel(value) {
  if (!value) return 'N/A';
  return value
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateTimeLocal(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}