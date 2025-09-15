import apiClient, { extractData } from './apiClient';

// Get all service requests
export async function listServiceRequests(options = {}) {
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
  return extractData(response);
}

// Get service request by ID
export async function getServiceRequest(requestId) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  const response = await apiClient.get(`/service-requests/${requestId}`);
  return extractData(response);
}

// Create new service request
export async function createServiceRequest(requestData) {
  // Validate required fields
  if (!requestData || typeof requestData !== 'object') {
    throw new Error("Service request data is required");
  }
  
  if (!requestData.service_type) {
    throw new Error("Service type is required");
  }
  
  if (!requestData.title) {
    throw new Error("Title is required");
  }
  
  if (!requestData.description) {
    throw new Error("Description is required");
  }
  
  if (!requestData.location) {
    throw new Error("Location is required");
  }
  
  // Validate location required fields
  if (!requestData.location.street_address) {
    throw new Error("Location street address is required");
  }
  
  if (!requestData.location.city) {
    throw new Error("Location city is required");
  }
  
  if (!requestData.location.province) {
    throw new Error("Location province is required");
  }
  
  const response = await apiClient.post('/service-requests', requestData);
  return extractData(response);
}

// Update service request
export async function updateServiceRequest(requestId, requestData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!requestData || typeof requestData !== 'object') {
    throw new Error("Valid service request data is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}`, requestData);
  return extractData(response);
}

// Delete service request
export async function deleteServiceRequest(requestId) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  const response = await apiClient.delete(`/service-requests/${requestId}`);
  return extractData(response);
}

// Assign agent to service request
export async function assignAgentToServiceRequest(requestId, agentData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!agentData || typeof agentData !== 'object') {
    throw new Error("Agent data is required");
  }
  
  if (!agentData.agent_id) {
    throw new Error("Agent ID is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/assign`, agentData);
  return extractData(response);
}

// Update service request status
export async function updateServiceRequestStatus(requestId, statusData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!statusData || typeof statusData !== 'object') {
    throw new Error("Status data is required");
  }
  
  if (!statusData.status) {
    throw new Error("Status is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/status`, statusData);
  return extractData(response);
}

// Submit feedback for completed service request
export async function submitServiceRequestFeedback(requestId, feedbackData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!feedbackData || typeof feedbackData !== 'object') {
    throw new Error("Feedback data is required");
  }
  
  if (feedbackData.rating === undefined || feedbackData.rating === null) {
    throw new Error("Rating is required");
  }
  
  if (feedbackData.farmer_satisfaction === undefined || feedbackData.farmer_satisfaction === null) {
    throw new Error("Farmer satisfaction rating is required");
  }
  
  if (feedbackData.agent_professionalism === undefined || feedbackData.agent_professionalism === null) {
    throw new Error("Agent professionalism rating is required");
  }
  
  if (feedbackData.service_quality === undefined || feedbackData.service_quality === null) {
    throw new Error("Service quality rating is required");
  }
  
  if (feedbackData.would_recommend === undefined) {
    throw new Error("Would recommend field is required");
  }
  
  const response = await apiClient.post(`/service-requests/${requestId}/feedback`, feedbackData);
  return extractData(response);
}

// Get service requests for a specific farmer
export async function getServiceRequestsForFarmer(farmerId, options = {}) {
  if (!farmerId) {
    throw new Error("Farmer ID is required");
  }
  
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  if (options.service_type) params.service_type = options.service_type;
  
  const response = await apiClient.get(`/service-requests/farmer/${farmerId}`, { params });
  return extractData(response);
}

// Get service requests assigned to a specific agent
export async function getServiceRequestsForAgent(agentId, options = {}) {
  if (!agentId) {
    throw new Error("Agent ID is required");
  }
  
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  if (options.service_type) params.service_type = options.service_type;
  
  const response = await apiClient.get(`/service-requests/agent/${agentId}`, { params });
  return extractData(response);
}