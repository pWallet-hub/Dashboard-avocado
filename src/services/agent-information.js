import apiClient, { extractData } from './apiClient';

/**
 * Get agent profile information
 * @returns {Promise<Object>} Agent profile data with user_info and agent_profile
 */
export async function getAgentInformation() {
  try {
    const response = await apiClient.get('/agent-information');
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
    const response = await apiClient.post('/agent-information/create', profileData);
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

    const response = await apiClient.put('/agent-information', updateData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating agent information:', error);
    throw error;
  }
}

/**
 * Update agent performance metrics
 * @param {Object} metricsData - Performance metrics to update
 * @param {number} metricsData.farmersAssisted - Number of farmers assisted
 * @param {number} metricsData.totalTransactions - Total transactions completed
 * @param {string} metricsData.performance - Performance percentage (e.g., "85%")
 * @returns {Promise<Object>} Updated agent profile with new metrics
 */
export async function updateAgentPerformance(metricsData) {
  try {
    // Validate metrics data
    if (!metricsData || typeof metricsData !== 'object') {
      throw new Error('Metrics data is required');
    }

    const response = await apiClient.put('/agent-information/performance', metricsData);
    return extractData(response);
  } catch (error) {
    console.error('Error updating agent performance:', error);
    throw error;
  }
}
