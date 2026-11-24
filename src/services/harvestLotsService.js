import apiClient, { extractData } from './apiClient';

export const LOT_STATUSES = [
  { value: 'recorded', label: 'Recorded', className: 'bg-gray-100 text-gray-700' },
  { value: 'verified', label: 'Verified', className: 'bg-blue-100 text-blue-700' },
  { value: 'sold', label: 'Sold', className: 'bg-amber-100 text-amber-800' },
  { value: 'delivered', label: 'Delivered', className: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', className: 'bg-red-100 text-red-700' },
];

export const statusMeta = (status) => LOT_STATUSES.find((s) => s.value === status) || LOT_STATUSES[0];

/** Which workflow actions a role may take on a lot in its current status. */
export function allowedLotActions(lot, role) {
  if (!lot) return [];
  const staff = role === 'admin' || role === 'agent';
  const actions = [];
  if (staff && lot.status === 'recorded') actions.push('verify');
  if (staff && ['recorded', 'verified'].includes(lot.status)) actions.push('reject');
  if (lot.status === 'verified') actions.push('sell');
  if (lot.status === 'sold') actions.push('deliver');
  if (lot.status === 'recorded' && (role === 'farmer' || role === 'admin')) actions.push('delete');
  return actions;
}

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export async function listHarvestLots(filters = {}) {
  try {
    const response = await apiClient.get('/harvest-lots', { params: cleanParams(filters) });
    const body = response.data || {};
    return {
      data: Array.isArray(body.data) ? body.data : [],
      pagination: body.meta?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load harvest lots'));
  }
}

/** Farms the current user can record a lot against (farmers: own farms only). */
export async function getFarmOptions(search = '') {
  try {
    const response = await apiClient.get('/harvest-lots/farm-options', { params: search ? { search } : {} });
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load farms'));
  }
}

export async function getHarvestLotSummary(filters = {}) {
  try {
    const response = await apiClient.get('/harvest-lots/summary', { params: cleanParams(filters) });
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load harvest summary'));
  }
}

export async function createHarvestLot(payload) {
  if (!payload?.farm_id) throw new Error('Please choose a farm');
  if (!payload.harvest_date) throw new Error('Harvest date is required');
  if (!payload.quantity_kg || Number(payload.quantity_kg) <= 0) throw new Error('Quantity must be greater than 0');
  try {
    const response = await apiClient.post('/harvest-lots', payload);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to record harvest lot'));
  }
}

const lotAction = (action, fallback) => async (id, payload = {}) => {
  if (!id) throw new Error('Lot ID is required');
  try {
    const response = await apiClient.post(`/harvest-lots/${id}/${action}`, payload);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, fallback));
  }
};

export const verifyHarvestLot = lotAction('verify', 'Failed to verify lot');
export const rejectHarvestLot = lotAction('reject', 'Failed to reject lot');
export const sellHarvestLot = lotAction('sell', 'Failed to record sale');
export const deliverHarvestLot = lotAction('deliver', 'Failed to mark lot as delivered');

export async function updateHarvestLot(id, payload) {
  try {
    const response = await apiClient.put(`/harvest-lots/${id}`, payload);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to update lot'));
  }
}

export async function deleteHarvestLot(id) {
  try {
    const response = await apiClient.delete(`/harvest-lots/${id}`);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to delete lot'));
  }
}

export async function getHarvestLotQr(id) {
  try {
    const response = await apiClient.get(`/harvest-lots/${id}/qr`);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to generate QR code'));
  }
}

/** Public (no login) trace lookup used by the /trace/:lotCode page. */
export async function traceLot(lotCode) {
  if (!lotCode) throw new Error('Lot code is required');
  try {
    const response = await apiClient.get(`/traceability/${encodeURIComponent(lotCode.trim())}`);
    return extractData(response);
  } catch (error) {
    if (error.response?.status === 404) throw new Error('No harvest lot found with this code.');
    throw new Error(errorMessage(error, 'Failed to look up lot'));
  }
}
