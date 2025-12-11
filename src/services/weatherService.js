import apiClient from './apiClient';

// Get current weather for a location
export const getCurrentWeather = async (location) => {
  try {
    const response = await apiClient.get('/weather/current', {
      params: { location }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch current weather');
  }
};

// Get weather forecast for a location
export const getWeatherForecast = async (location, days = 7) => {
  try {
    const response = await apiClient.get('/weather/forecast', {
      params: { location, days }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch weather forecast');
  }
};

// Get farm-specific weather conditions
export const getFarmConditions = async (farmId) => {
  try {
    const response = await apiClient.get('/weather/farm-conditions', {
      params: { farm_id: farmId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farm conditions');
  }
};

// Get weather data for multiple locations
export const getMultiLocationWeather = async (locations) => {
  try {
    const response = await apiClient.post('/weather/multi-location', {
      locations
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch multi-location weather');
  }
};