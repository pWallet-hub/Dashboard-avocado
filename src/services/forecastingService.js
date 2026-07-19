import apiClient, { extractData } from './apiClient';

// List harvest forecasts (optionally filtered)
export async function listForecasts(options = {}) {
  try {
    const params = {};
    if (options.farm_id) params.farm_id = options.farm_id;
    if (options.province) params.province = options.province;
    if (options.district) params.district = options.district;
    if (options.forecast_year) params.forecast_year = options.forecast_year;

    const response = await apiClient.get('/forecasting', { params });
    const extractedData = extractData(response);
    return Array.isArray(extractedData) ? extractedData : (extractedData?.data || []);
  } catch (error) {
    console.error('Error in listForecasts:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load harvest forecasts');
  }
}

// Get a single harvest forecast by ID
export async function getForecast(forecastId) {
  try {
    if (!forecastId) {
      throw new Error('Forecast ID is required');
    }

    const response = await apiClient.get(`/forecasting/${forecastId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get harvest forecast');
  }
}

// Create a harvest forecast
export async function createForecast(forecastData) {
  try {
    if (!forecastData || typeof forecastData !== 'object') {
      throw new Error('Forecast data is required');
    }
    if (!forecastData.forecast_year) {
      throw new Error('Forecast year is required');
    }
    if (forecastData.predicted_kg === undefined || forecastData.predicted_kg === null || forecastData.predicted_kg === '') {
      throw new Error('Predicted kg is required');
    }

    const response = await apiClient.post('/forecasting', forecastData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create harvest forecast');
  }
}

// Update a forecast (including actual kg when harvested)
export async function updateForecast(forecastId, forecastData) {
  try {
    if (!forecastId) {
      throw new Error('Forecast ID is required');
    }
    if (!forecastData || typeof forecastData !== 'object') {
      throw new Error('Valid forecast data is required');
    }

    const response = await apiClient.put(`/forecasting/${forecastId}`, forecastData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update harvest forecast');
  }
}

// Delete a forecast
export async function deleteForecast(forecastId) {
  try {
    if (!forecastId) {
      throw new Error('Forecast ID is required');
    }

    const response = await apiClient.delete(`/forecasting/${forecastId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete harvest forecast');
  }
}

// List forecasts that have actual_kg recorded, with a computed accuracy_rating (admin/agent)
export async function compareForecast(options = {}) {
  try {
    const params = {};
    if (options.forecast_year) params.forecast_year = options.forecast_year;
    if (options.province) params.province = options.province;

    const response = await apiClient.get('/forecasting/compare', { params });
    const extractedData = extractData(response);
    return Array.isArray(extractedData) ? extractedData : (extractedData?.data || []);
  } catch (error) {
    console.error('Error in compareForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load forecast comparison');
  }
}

// Aggregated forecast vs actual by district/province (admin/agent)
export async function getRegionalForecast() {
  try {
    const response = await apiClient.get('/forecasting/regional');
    const extractedData = extractData(response);
    return Array.isArray(extractedData) ? extractedData : (extractedData?.data || []);
  } catch (error) {
    console.error('Error in getRegionalForecast:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load regional forecast data');
  }
}
