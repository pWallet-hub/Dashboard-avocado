import apiClient, { extractData } from './apiClient';

/**
 * Get agent profile information
 * @returns {Promise<Object>} Agent profile data with user_info and agent_profile
 */
export async function getAgentInformation() {
  try {
    const response = await apiClient.get('/agent-information/me');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching agent information:', error);
    throw error;
  }
}

/**
 * Create agent profile (first-time setup)
 * @param {Object} profileData - Agent profile data
 * @returns {Promise<Object>} Created agent profile
 */
export async function createAgentProfile(profileData) {
  try {
    const response = await apiClient.post('/agent-information', profileData);
    return extractData(response);
  } catch (error) {
    console.error('Error creating agent profile:', error);
    throw error;
  }
}

/**
 * Update agent profile information
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated agent profile
 */
export async function updateAgentInformation(updateData) {
  try {
    // Validate that at least one field is being updated
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data is required');
    }

    const response = await apiClient.put('/agent-information/me', updateData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating agent information:', error);
    throw error;
  }
}

/**
 * List agents with extended profiles (admin)
 * @param {Object} options - Optional query options (page, limit, search)
 * @returns {Promise<Object>} List of agents with their extended profiles
 */
export async function listAgentProfiles(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.search) params.search = options.search;

    const response = await apiClient.get('/agent-information', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching agent profiles:', error);
    throw error;
  }
}

/**
 * Get a single agent's extended profile by ID (admin/agent)
 * @param {string} agentId - The user id of the agent
 * @returns {Promise<Object>} Agent profile data with user_info and agent_profile
 */
export async function getAgentProfileById(agentId) {
  try {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    const response = await apiClient.get(`/agent-information/${agentId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    throw error;
  }
}

/**
 * Update an agent's extended profile by ID (admin/agent)
 * @param {string} agentId - The user id of the agent
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated agent profile
 */
export async function updateAgentProfileById(agentId, updateData) {
  try {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required');
    }

    const response = await apiClient.put(`/agent-information/${agentId}`, updateData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating agent profile:', error);
    throw error;
  }
}

/**
 * Update an agent's performance metrics (admin only)
 * @param {string} agentUserId - The user id of the agent being updated
 * @param {Object} metricsData - Performance metrics to update
 * @param {number} metricsData.farmersAssisted - Number of farmers assisted
 * @param {number} metricsData.totalTransactions - Total transactions completed
 * @param {string} metricsData.performance - Performance percentage (e.g., "85%")
 * @returns {Promise<Object>} Updated agent profile with new metrics
 */
export async function updateAgentPerformance(agentUserId, metricsData) {
  try {
    if (!agentUserId) {
      throw new Error('Agent user id is required');
    }
    if (!metricsData || typeof metricsData !== 'object') {
      throw new Error('Metrics data is required');
    }

    const response = await apiClient.put(`/agent-information/${agentUserId}/performance`, metricsData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating agent performance:', error);
    throw error;
  }
}
