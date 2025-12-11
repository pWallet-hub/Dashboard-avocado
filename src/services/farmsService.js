import apiClient from './apiClient';

// Get all farms with filters
export const getFarms = async (params = {}) => {
  try {
    const response = await apiClient.get('/farms', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farms');
  }
};

// Get avocado farms specifically
export const getAvocadoFarms = async (params = {}) => {
  try {
    const response = await apiClient.get('/farms', {
      params: { ...params, crop_type: 'avocado' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch avocado farms');
  }
};

// Get farm by ID
export const getFarmById = async (farmId) => {
  try {
    const response = await apiClient.get(`/farms/${farmId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farm');
  }
};

// Get farm details with full information
export const getFarmDetails = async (farmId) => {
  try {
    const response = await apiClient.get(`/farms/${farmId}/details`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farm details');
  }
};

// Get farm harvest schedule
export const getFarmHarvestSchedule = async (farmId) => {
  try {
    const response = await apiClient.get(`/farms/${farmId}/harvest-schedule`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch harvest schedule');
  }
};

// Create purchase order from farm
export const purchaseFromFarm = async (farmId, orderData) => {
  try {
    const response = await apiClient.post(`/farms/${farmId}/purchase-orders`, orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create purchase order');
  }
};

// Get farms by location
export const getFarmsByLocation = async (province, district = null, sector = null) => {
  try {
    const params = { province };
    if (district) params.district = district;
    if (sector) params.sector = sector;
    
    const response = await apiClient.get('/farms/by-location', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farms by location');
  }
};

// Get farms ready for harvest
export const getHarvestReadyFarms = async (params = {}) => {
  try {
    const response = await apiClient.get('/farms/harvest-ready', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch harvest-ready farms');
  }
};

// Get farm production statistics
export const getFarmProductionStats = async (farmId, period = '30d') => {
  try {
    const response = await apiClient.get(`/farms/${farmId}/production-stats`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch production statistics');
  }
};

// Get farms overview/summary
export const getFarmsOverview = async () => {
  try {
    const response = await apiClient.get('/farms/overview');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farms overview');
  }
};