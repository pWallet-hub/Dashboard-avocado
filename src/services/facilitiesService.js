import apiClient, { extractData } from './apiClient';

export const FACILITY_TYPES = [
  { value: 'market', label: 'Market', plural: 'Markets' },
  { value: 'collection_center', label: 'Collection centre', plural: 'Collection centres' },
  { value: 'cold_storage', label: 'Cold storage', plural: 'Cold storage' },
  { value: 'packhouse', label: 'Pack house', plural: 'Pack houses' },
  { value: 'processing_plant', label: 'Processing plant', plural: 'Processing plants' },
  { value: 'airport', label: 'Airport', plural: 'Airports' },
  { value: 'nursery', label: 'Seedling nursery', plural: 'Seedling nurseries' },
  { value: 'demo_farm', label: 'Demonstration farm', plural: 'Demonstration farms' },
  { value: 'input_supplier', label: 'Input supplier', plural: 'Input suppliers' },
  { value: 'sacco_bank', label: 'SACCO / bank', plural: 'SACCOs & banks' },
  { value: 'government_office', label: 'Government / RAB office', plural: 'Government & RAB offices' },
  { value: 'other', label: 'Other', plural: 'Other places' },
];

export const facilityTypeLabel = (t) => FACILITY_TYPES.find((x) => x.value === t)?.label || t || 'Place';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** Agents, shops and facilities closest to the farm (or to { lat, lng }). */
export async function getNearby(params = {}) {
  try {
    const response = await apiClient.get('/facilities/nearby', { params: cleanParams(params) });
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load nearby services'));
  }
}

export async function listFacilities(filters = {}) {
  try {
    const response = await apiClient.get('/facilities', { params: cleanParams(filters) });
    const body = response.data || {};
    return {
      data: Array.isArray(body.data) ? body.data : [],
      pagination: body.meta?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load facilities'));
  }
}

export async function saveFacility(id, payload) {
  try {
    const response = id ? await apiClient.put(`/facilities/${id}`, payload) : await apiClient.post('/facilities', payload);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to save facility'));
  }
}

export async function deleteFacility(id) {
  try {
    const response = await apiClient.delete(`/facilities/${id}`);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to delete facility'));
  }
}

/** Google Maps directions link to a point (opens the maps app on phones). */
export const directionsUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/** Browser GPS as a promise of { lat, lng }. */
export const currentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('This device cannot share its location'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: Number(p.coords.latitude.toFixed(6)), lng: Number(p.coords.longitude.toFixed(6)) }),
      (e) => reject(new Error(e.code === 1 ? 'Location permission was denied' : 'Could not get your location')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
