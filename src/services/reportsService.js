import apiClient, { extractData } from './apiClient';

/**
 * Reports Service
 * Implements endpoints from API documentation:
 * Base Path: /reports
 * - GET    /reports                List reports (admin sees all, agent sees only their own)
 * - POST   /reports                Create report (agent auto-assigned; admin must supply agent_id)
 * - GET    /reports/export         Export reports as CSV/JSON file download
 * - GET    /reports/statistics     Report statistics — counts by status, type, priority
 * - GET    /reports/{id}           Get report by ID
 * - PUT    /reports/{id}           Update report
 * - DELETE /reports/{id}           Delete report (admin)
 * - POST   /reports/{id}/attachments  Upload file attachments to a report
 */

const REPORT_TYPES = ['inspection', 'audit', 'assessment', 'survey', 'other'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// List reports. Agents only see their own reports; admins may filter by agent_id.
export async function listReports(options = {}) {
  try {
    const params = {};
    if (options.report_type) params.report_type = options.report_type;
    if (options.status) params.status = options.status;
    if (options.agent_id) params.agent_id = options.agent_id;
    if (options.date_from) params.date_from = options.date_from;
    if (options.date_to) params.date_to = options.date_to;

    const response = await apiClient.get('/reports', { params });
    const extractedData = extractData(response);

    if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    } else if (Array.isArray(extractedData)) {
      return extractedData;
    }
    return [];
  } catch (error) {
    console.error('Error in listReports:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load reports');
  }
}

// Get report statistics — counts by status, type and priority
export async function getReportStatistics() {
  try {
    const response = await apiClient.get('/reports/statistics');
    return extractData(response);
  } catch (error) {
    console.error('Error in getReportStatistics:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load report statistics');
  }
}

// Get a single report by id
export async function getReport(reportId) {
  if (!reportId) {
    throw new Error('Report ID is required');
  }

  try {
    const response = await apiClient.get(`/reports/${reportId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getReport:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get report');
  }
}

// Create a report (agent is auto-assigned; admin must supply agent_id)
export async function createReport(reportData) {
  if (!reportData || typeof reportData !== 'object') {
    throw new Error('Report data is required');
  }
  if (!reportData.title || !reportData.title.trim()) {
    throw new Error('Title is required');
  }
  if (!reportData.description || !reportData.description.trim()) {
    throw new Error('Description is required');
  }
  if (!reportData.report_type) {
    throw new Error('Report type is required');
  }
  if (!REPORT_TYPES.includes(reportData.report_type)) {
    throw new Error(`Invalid report type. Must be one of: ${REPORT_TYPES.join(', ')}`);
  }
  if (!reportData.scheduled_date) {
    throw new Error('Scheduled date is required');
  }
  if (!reportData.location || !reportData.location.trim()) {
    throw new Error('Location is required');
  }

  try {
    const response = await apiClient.post('/reports', reportData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createReport:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create report');
  }
}

// Update a report
export async function updateReport(reportId, reportData) {
  if (!reportId) {
    throw new Error('Report ID is required');
  }
  if (!reportData || typeof reportData !== 'object') {
    throw new Error('Valid report data is required');
  }
  if (reportData.report_type && !REPORT_TYPES.includes(reportData.report_type)) {
    throw new Error(`Invalid report type. Must be one of: ${REPORT_TYPES.join(', ')}`);
  }
  if (reportData.status && !STATUSES.includes(reportData.status)) {
    throw new Error(`Invalid status. Must be one of: ${STATUSES.join(', ')}`);
  }
  if (reportData.priority && !PRIORITIES.includes(reportData.priority)) {
    throw new Error(`Invalid priority. Must be one of: ${PRIORITIES.join(', ')}`);
  }

  try {
    const response = await apiClient.put(`/reports/${reportId}`, reportData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateReport:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update report');
  }
}

// Delete a report (admin)
export async function deleteReport(reportId) {
  if (!reportId) {
    throw new Error('Report ID is required');
  }

  try {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteReport:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete report');
  }
}

// Upload file attachments to a report (agents may only upload to reports they own)
export async function uploadReportAttachments(reportId, files) {
  if (!reportId) {
    throw new Error('Report ID is required');
  }
  const fileList = Array.isArray(files) ? files : [files];
  if (!fileList || fileList.length === 0 || !fileList[0]) {
    throw new Error('At least one file is required');
  }

  const formData = new FormData();
  for (const f of fileList) formData.append('files', f);

  try {
    const response = await apiClient.post(`/reports/${reportId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response);
  } catch (error) {
    console.error('Error in uploadReportAttachments:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload attachments');
  }
}

// Export reports as a CSV or JSON file download
export async function exportReports(options = {}) {
  try {
    const params = {};
    params.format = options.format === 'json' ? 'json' : 'csv';
    if (options.report_type) params.report_type = options.report_type;
    if (options.status) params.status = options.status;
    if (options.agent_id) params.agent_id = options.agent_id;
    if (options.from) params.from = options.from;
    if (options.to) params.to = options.to;

    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `reports-export-${new Date().toISOString().slice(0, 10)}.${params.format}`;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error in exportReports:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to export reports');
  }
}

export default {
  listReports,
  getReportStatistics,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  uploadReportAttachments,
  exportReports,
};
