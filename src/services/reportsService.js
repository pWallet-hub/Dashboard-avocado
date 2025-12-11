import apiClient from './apiClient';

// Get all reports with filters
export const getReports = async (params = {}) => {
  try {
    const response = await apiClient.get('/reports', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

// Get report by ID
export const getReportById = async (reportId) => {
  try {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch report');
  }
};

// Create new report
export const createReport = async (reportData) => {
  try {
    const response = await apiClient.post('/reports', reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create report');
  }
};

// Update report
export const updateReport = async (reportId, reportData) => {
  try {
    const response = await apiClient.put(`/reports/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update report');
  }
};

// Delete report
export const deleteReport = async (reportId) => {
  try {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete report');
  }
};

// Upload report attachments
export const uploadReportAttachments = async (reportId, files) => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`attachments`, file);
    });

    const response = await apiClient.post(`/reports/${reportId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload attachments');
  }
};

// Get reports by agent
export const getReportsByAgent = async (agentId, params = {}) => {
  try {
    const response = await apiClient.get('/reports', {
      params: { ...params, agent_id: agentId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch agent reports');
  }
};

// Get report statistics
export const getReportStatistics = async (params = {}) => {
  try {
    const response = await apiClient.get('/reports/statistics', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch report statistics');
  }
};