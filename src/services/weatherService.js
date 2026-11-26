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

/**
 * Everything for the farmer weather page in one call: current, 48 h hourly,
 * 16-day daily, soil, water balance, rainfall vs the 10-year normal, advice,
 * alerts and `sources`. Pass one of: { farmId } | { lat, lng } | { district }.
 * With nothing, a farmer gets their first farm (or profile district).
 */
export async function getWeatherOverview({ farmId, lat, lng, district } = {}) {
  try {
    const params = {};
    if (lat != null && lng != null) {
      params.lat = lat;
      params.lng = lng;
    } else if (farmId) {
      params.farm_id = farmId;
    } else if (district) {
      params.district = district;
    }
    const response = await apiClient.get('/weather/overview', { params, timeout: 45000 });
    return extractData(response);
  } catch (error) {
    console.error('Error in getWeatherOverview:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load weather');
  }
}

/** Meaning of the rainfall-vs-normal status codes, for labels and colours. */
export const NORMAL_STATUS = {
  much_drier: { label: 'Much drier than normal', tone: 'rose' },
  drier: { label: 'Drier than normal', tone: 'amber' },
  normal: { label: 'About normal', tone: 'brand' },
  wetter: { label: 'Wetter than normal', tone: 'blue' },
  much_wetter: { label: 'Much wetter than normal', tone: 'blue' },
};
