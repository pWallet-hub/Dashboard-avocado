import apiClient, { extractData } from './apiClient';

export const PRICE_TYPES = [
  { value: 'farm_gate', label: 'Farm gate' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'retail', label: 'Retail' },
  { value: 'export', label: 'Export' },
];

export const GRADES = [
  { value: 'export', label: 'Export' },
  { value: 'grade_a', label: 'Grade A' },
  { value: 'grade_b', label: 'Grade B' },
  { value: 'processing', label: 'Processing' },
  { value: 'reject', label: 'Reject' },
];

export const labelFor = (list, value) => list.find((i) => i.value === value)?.label || value || '—';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

/** Drop empty filter values so they are not sent as `?district=`. */
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** List price observations. Returns { data, pagination }. */
export async function listMarketPrices(filters = {}) {
  try {
    const response = await apiClient.get('/market-prices', { params: cleanParams(filters) });
    const body = response.data || {};
    return {
      data: Array.isArray(body.data) ? body.data : [],
      pagination: body.meta?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load market prices'));
  }
}

/** Most recent price per district / variety / grade / price type. */
export async function getLatestPrices(filters = {}) {
  try {
    const response = await apiClient.get('/market-prices/latest', { params: cleanParams(filters) });
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load latest prices'));
  }
}

/** National averages per price type with % change vs the previous period. */
export async function getPriceSummary(filters = {}) {
  try {
    const response = await apiClient.get('/market-prices/summary', { params: cleanParams(filters) });
    return extractData(response) || { summary: [] };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load price summary'));
  }
}

/** Day/week price series: { interval, days, series: [{ period, price_type, average_price, ... }] } */
export async function getPriceTrends(filters = {}) {
  try {
    const response = await apiClient.get('/market-prices/trends', { params: cleanParams(filters) });
    return extractData(response) || { series: [] };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load price trends'));
  }
}

export async function createMarketPrice(payload) {
  if (!payload?.price_per_kg || Number(payload.price_per_kg) <= 0) throw new Error('Price per kg must be greater than 0');
  if (!payload.province || !payload.district) throw new Error('Province and district are required');
  try {
    const response = await apiClient.post('/market-prices', { ...payload, price_per_kg: Number(payload.price_per_kg) });
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to record price'));
  }
}

export async function updateMarketPrice(id, payload) {
  if (!id) throw new Error('Price ID is required');
  try {
    const response = await apiClient.put(`/market-prices/${id}`, payload);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to update price'));
  }
}

export async function deleteMarketPrice(id) {
  if (!id) throw new Error('Price ID is required');
  try {
    const response = await apiClient.delete(`/market-prices/${id}`);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to delete price'));
  }
}

/**
 * Pivot the trends series into chart rows: [{ period, farm_gate, wholesale, ... }].
 */
export function pivotTrendSeries(series = []) {
  const rows = new Map();
  for (const point of series) {
    const row = rows.get(point.period) || { period: point.period };
    row[point.price_type] = point.average_price;
    rows.set(point.period, row);
  }
  return [...rows.values()].sort((a, b) => a.period.localeCompare(b.period));
}
