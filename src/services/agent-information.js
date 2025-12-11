import apiClient from './apiClient';

// Get agent information and profile
export const getAgentInformation = async () => {
  try {
    const response = await apiClient.get('/agent-information');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch agent information');
  }
};

// Update agent profile information
export const updateAgentInformation = async (agentData) => {
  try {
    const response = await apiClient.put('/agent-information', agentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update agent information');
  }
};

// Create agent profile
export const createAgentProfile = async (agentData) => {
  try {
    const response = await apiClient.post('/agent-information/create', agentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create agent profile');
  }
};

// Update agent performance metrics
export const updateAgentPerformance = async (performanceData) => {
  try {
    const response = await apiClient.put('/agent-information/performance', performanceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update agent performance');
  }
};

// Create agent profile with full territory (Admin only)
export const createAgentProfileAdmin = async (agentData) => {
  try {
    const response = await apiClient.post('/agent-information/admin/create', agentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create agent profile');
  }
};

// Get agent profile with full territory details (Admin only)
export const getAgentProfileAdmin = async (userId) => {
  try {
    const response = await apiClient.get(`/agent-information/admin/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch agent profile');
  }
};