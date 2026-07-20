import apiClient, { extractData } from './apiClient';

// Current weather for a location
export async function getCurrentWeather(location) {
  try {
    if (!location || typeof location !== 'string') {
      throw new Error('Location is required');
    }

    const response = await apiClient.get('/weather/current', { params: { location } });
    return extractData(response);
  } catch (error) {
    console.error('Error in getCurrentWeather:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load current weather');
  }
}

// 7-day (or custom range, max 14) weather forecast for a location
export async function getForecast(location, days = 7) {
  try {
    if (!location || typeof location !== 'string') {
      throw new Error('Location is required');
    }

    const params = { location };
    if (days) params.days = days;

    const response = await apiClient.get('/weather/forecast', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error in getForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load forecast');
  }
}

// Weather conditions specific to a farm, including farming recommendations
export async function getFarmConditions(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get('/weather/farm-conditions', { params: { farm_id: farmId } });
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarmConditions:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load farm conditions');
  }
}

// Weather for multiple locations at once
export async function getMultiLocationWeather(locations) {
  try {
    if (!Array.isArray(locations) || locations.length === 0) {
      throw new Error('At least one location is required');
    }

    const response = await apiClient.post('/weather/multi-location', { locations });
    return extractData(response);
  } catch (error) {
    console.error('Error in getMultiLocationWeather:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load multi-location weather');
  }
}
