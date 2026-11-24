import apiClient, { extractData } from './apiClient';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

/** Rwanda UPI shape: province/district/sector/cell/parcel (+ optional -unit). */
export const UPI_PATTERN = /^\s*\d\s*[/\\]\s*\d{1,2}\s*[/\\]\s*\d{1,2}\s*[/\\]\s*\d{1,2}\s*[/\\]\s*\d{1,7}(-\d{1,4})?\s*$/;
export const looksLikeUpi = (value) => UPI_PATTERN.test(String(value || ''));

export async function getLandRegistryStatus() {
  try {
    return extractData(await apiClient.get('/land/status'));
  } catch {
    return { registry_enabled: false };
  }
}

export async function checkUpi(upi) {
  if (!looksLikeUpi(upi)) throw new Error('Use the format province/district/sector/cell/parcel, e.g. 5/01/02/03/1234');
  try {
    return extractData(await apiClient.get('/land/upi', { params: { upi: upi.trim() } }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Could not check this UPI'));
  }
}

export async function getFarmLand(farmId) {
  try {
    return extractData(await apiClient.get(`/land/farms/${farmId}`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load land details'));
  }
}

export async function saveFarmLand(farmId, payload) {
  try {
    return extractData(await apiClient.put(`/land/farms/${farmId}`, payload));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to save land details'));
  }
}

export async function verifyFarmLand(farmId) {
  try {
    return extractData(await apiClient.post(`/land/farms/${farmId}/verify`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to verify land details'));
  }
}

export async function getFarmMap(filters = {}) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null));
  try {
    return extractData(await apiClient.get('/map/farms', { params }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load the farm map'));
  }
}

/** m² → readable hectares */
export const formatArea = (sqm) => (sqm ? `${(sqm / 10000).toLocaleString(undefined, { maximumFractionDigits: 3 })} ha` : '—');
