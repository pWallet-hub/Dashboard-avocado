import apiClient, { extractData } from './apiClient';

// List farms (admin/agent) with optional filters
export async function listFarms(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.farmer_id) params.farmer_id = options.farmer_id;
    if (options.status) params.status = options.status;
    if (options.province) params.province = options.province;
    if (options.district) params.district = options.district;
    if (options.search) params.search = options.search;

    const response = await apiClient.get('/farms', { params });
    const extractedData = extractData(response);

    if (extractedData && extractedData.data) {
      return {
        data: Array.isArray(extractedData.data) ? extractedData.data : [],
        pagination: extractedData.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.data ? extractedData.data.length : 0,
          itemsPerPage: options.limit || 10
        }
      };
    } else if (Array.isArray(extractedData)) {
      return {
        data: extractedData,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: extractedData.length,
          itemsPerPage: options.limit || 10
        }
      };
    } else {
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: options.limit || 10
        }
      };
    }
  } catch (error) {
    console.error('Error in listFarms:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farms');
  }
}

// Register a new farm (admin/agent)
export async function createFarm(farmData) {
  try {
    if (!farmData || typeof farmData !== 'object') {
      throw new Error('Farm data is required');
    }
    if (!farmData.farmer_id) {
      throw new Error('Farmer is required');
    }
    if (!farmData.farm_name) {
      throw new Error('Farm name is required');
    }

    const response = await apiClient.post('/farms', farmData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createFarm:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create farm');
  }
}

// Aggregate farm statistics (admin/agent)
export async function getFarmsOverview() {
  try {
    const response = await apiClient.get('/farms/overview');
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarmsOverview:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farms overview');
  }
}

// Get farm by ID
export async function getFarm(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/farms/${farmId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarm:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farm');
  }
}

// Update farm
export async function updateFarm(farmId, farmData) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!farmData || typeof farmData !== 'object') {
      throw new Error('Valid farm data is required');
    }

    const response = await apiClient.put(`/farms/${farmId}`, farmData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateFarm:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update farm');
  }
}

// Delete farm (admin)
export async function deleteFarm(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.delete(`/farms/${farmId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteFarm:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete farm');
  }
}

// Archive (soft-delete) a farm
export async function archiveFarm(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.put(`/farms/${farmId}/archive`);
    return extractData(response);
  } catch (error) {
    console.error('Error in archiveFarm:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to archive farm');
  }
}

// Assign an agent to a farm
export async function assignFarmAgent(farmId, agentId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    const response = await apiClient.put(`/farms/${farmId}/assign-agent`, { agent_id: agentId });
    return extractData(response);
  } catch (error) {
    console.error('Error in assignFarmAgent:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to assign agent to farm');
  }
}

// Extended farm information including yield estimate
export async function getFarmDetails(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/farms/${farmId}/details`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarmDetails:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farm details');
  }
}

// Farm change history (service requests, visits, forecasts)
export async function getFarmHistory(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/farms/${farmId}/history`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarmHistory:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farm history');
  }
}

// Farm production statistics
export async function getFarmProductionStats(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/farms/${farmId}/production-stats`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarmProductionStats:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farm production stats');
  }
}
