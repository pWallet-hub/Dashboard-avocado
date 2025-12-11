import apiClient from './apiClient';

// Pest Management Service Requests
export const createPestManagementRequest = async (requestData) => {
  try {
    const response = await apiClient.post('/service-requests/pest-management', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create pest management request');
  }
};

export const getPestManagementRequests = async (params = {}) => {
  try {
    const response = await apiClient.get('/service-requests/pest-management', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pest management requests');
  }
};

export const approvePestManagementRequest = async (requestId, approvalData) => {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}/approve-pest-management`, approvalData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve pest management request');
  }
};

// Property Evaluation Service Requests
export const createPropertyEvaluationRequest = async (requestData) => {
  try {
    const response = await apiClient.post('/service-requests/property-evaluation', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create property evaluation request');
  }
};

export const getPropertyEvaluationRequests = async (params = {}) => {
  try {
    const response = await apiClient.get('/service-requests/property-evaluation', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch property evaluation requests');
  }
};

export const approvePropertyEvaluationRequest = async (requestId, approvalData) => {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}/approve-property-evaluation`, approvalData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve property evaluation request');
  }
};

// Harvest Service Requests
export const createHarvestRequest = async (requestData) => {
  try {
    const response = await apiClient.post('/service-requests/harvest', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create harvest request');
  }
};

export const getHarvestRequests = async (params = {}) => {
  try {
    const response = await apiClient.get('/service-requests/harvest', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch harvest requests');
  }
};

export const getAgentHarvestRequests = async (params = {}) => {
  try {
    const response = await apiClient.get('/service-requests/harvest/agent/me', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch agent harvest requests');
  }
};

export const approveHarvestRequest = async (requestId, approvalData) => {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}/approve-harvest`, approvalData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve harvest request');
  }
};

export const completeHarvestRequest = async (requestId, completionData) => {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}/complete-harvest`, completionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to complete harvest request');
  }
};