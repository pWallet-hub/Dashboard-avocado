import apiClient, { extractData } from './apiClient';

// Normalize a variety of response shapes into a plain array
const toArray = (extractedData) => {
  if (Array.isArray(extractedData)) return extractedData;
  if (Array.isArray(extractedData?.data)) return extractedData.data;
  return [];
};

// List farm visits (admin sees all, agents see their own)
export async function listVisits(options = {}) {
  try {
    const params = {};
    if (options.status) params.status = options.status;
    if (options.farm_id) params.farm_id = options.farm_id;
    if (options.agent_id) params.agent_id = options.agent_id;

    const response = await apiClient.get('/visits', { params });
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listVisits:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load visits');
  }
}

// List all visits for a specific farm
export async function listFarmVisits(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/visits/farm/${farmId}`);
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listFarmVisits:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farm visits');
  }
}

// Get a single farm visit
export async function getVisit(visitId) {
  try {
    if (!visitId) {
      throw new Error('Visit ID is required');
    }

    const response = await apiClient.get(`/visits/${visitId}`);
    const extractedData = extractData(response);
    return extractedData?.data || extractedData;
  } catch (error) {
    console.error('Error in getVisit:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get visit');
  }
}

// Schedule a farm visit
export async function scheduleVisit(visitData) {
  try {
    if (!visitData || typeof visitData !== 'object') {
      throw new Error('Visit data is required');
    }

    if (!visitData.farm_id) {
      throw new Error('Farm is required');
    }

    if (!visitData.scheduled_at) {
      throw new Error('Scheduled date/time is required');
    }

    const response = await apiClient.post('/visits', visitData);
    return extractData(response);
  } catch (error) {
    console.error('Error in scheduleVisit:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to schedule visit');
  }
}

// Update visit details
export async function updateVisit(visitId, visitData) {
  try {
    if (!visitId) {
      throw new Error('Visit ID is required');
    }

    if (!visitData || typeof visitData !== 'object') {
      throw new Error('Valid visit data is required');
    }

    const response = await apiClient.put(`/visits/${visitId}`, visitData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateVisit:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update visit');
  }
}

// Cancel a scheduled visit
export async function cancelVisit(visitId, reason) {
  try {
    if (!visitId) {
      throw new Error('Visit ID is required');
    }

    const response = await apiClient.put(`/visits/${visitId}/cancel`, reason ? { reason } : {});
    return extractData(response);
  } catch (error) {
    console.error('Error in cancelVisit:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to cancel visit');
  }
}

// Mark a visit as completed with notes
export async function completeVisit(visitId, notes) {
  try {
    if (!visitId) {
      throw new Error('Visit ID is required');
    }

    const response = await apiClient.put(`/visits/${visitId}/complete`, notes ? { notes } : {});
    return extractData(response);
  } catch (error) {
    console.error('Error in completeVisit:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to complete visit');
  }
}

// Mark a scheduled visit as in-progress
export async function startVisit(visitId) {
  try {
    if (!visitId) {
      throw new Error('Visit ID is required');
    }

    const response = await apiClient.put(`/visits/${visitId}/start`);
    return extractData(response);
  } catch (error) {
    console.error('Error in startVisit:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to start visit');
  }
}
