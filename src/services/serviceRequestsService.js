import apiClient from './apiClient';

// Get all service requests
export async function listServiceRequests(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.farmer_id) params.farmer_id = options.farmer_id;
    if (options.agent_id) params.agent_id = options.agent_id;
    if (options.service_type) params.service_type = options.service_type;
    if (options.status) params.status = options.status;
    if (options.priority) params.priority = options.priority;
    if (options.province) params.province = options.province;
    if (options.city) params.city = options.city;
    if (options.date_from) params.date_from = options.date_from;
    if (options.date_to) params.date_to = options.date_to;
    if (options.search) params.search = options.search;
    
    const response = await apiClient.get('/service-requests', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service requests');
  }
}

// Get service request by ID
export async function getServiceRequest(requestId) {
  try {
    const response = await apiClient.get(`/service-requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service request');
  }
}

// Create new service request
export async function createServiceRequest(requestData) {
  try {
    const response = await apiClient.post('/service-requests', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create service request');
  }
}

// Update service request
export async function updateServiceRequest(requestId, requestData) {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}`, requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update service request');
  }
}

// Delete service request
export async function deleteServiceRequest(requestId) {
  try {
    const response = await apiClient.delete(`/service-requests/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete service request');
  }
}

// Assign agent to service request
export async function assignAgentToServiceRequest(requestId, agentData) {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}/assign`, agentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to assign agent to service request');
  }
}

// Update service request status
export async function updateServiceRequestStatus(requestId, statusData) {
  try {
    const response = await apiClient.put(`/service-requests/${requestId}/status`, statusData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update service request status');
  }
}

// Submit feedback for completed service request
export async function submitServiceRequestFeedback(requestId, feedbackData) {
  try {
    const response = await apiClient.post(`/service-requests/${requestId}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit feedback for service request');
  }
}

// Get service requests for a specific farmer
export async function getServiceRequestsForFarmer(farmerId, options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.service_type) params.service_type = options.service_type;
    
    const response = await apiClient.get(`/service-requests/farmer/${farmerId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service requests for farmer');
  }
}

// Get service requests assigned to a specific agent
export async function getServiceRequestsForAgent(agentId, options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.service_type) params.service_type = options.service_type;
    
    const response = await apiClient.get(`/service-requests/agent/${agentId}`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch service requests for agent');
  }
}