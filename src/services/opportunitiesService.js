import apiClient, { extractData } from './apiClient';

export const OPPORTUNITY_TYPES = [
  { value: 'buyer_demand', label: 'Buyer demand' },
  { value: 'export_contract', label: 'Export contract' },
  { value: 'grant_funding', label: 'Grant / funding' },
  { value: 'loan_credit', label: 'Loan / credit' },
  { value: 'input_subsidy', label: 'Subsidised inputs' },
  { value: 'training', label: 'Training' },
  { value: 'certification', label: 'Certification support' },
  { value: 'job', label: 'Job' },
  { value: 'tender', label: 'Tender' },
  { value: 'other', label: 'Other' },
];

export const opportunityTypeLabel = (t) => OPPORTUNITY_TYPES.find((x) => x.value === t)?.label || t || 'Opportunity';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export async function listOpportunities(filters = {}) {
  try {
    const response = await apiClient.get('/opportunities', { params: cleanParams(filters) });
    const body = response.data || {};
    return {
      data: Array.isArray(body.data) ? body.data : [],
      pagination: body.meta?.pagination || { page: 1, totalPages: 1, total: 0 },
    };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load opportunities'));
  }
}

/** Price-based tips: districts paying noticeably more than the farmer's own. */
export async function getOpportunityInsights(params = {}) {
  try {
    const response = await apiClient.get('/opportunities/insights', { params: cleanParams(params) });
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load market tips'));
  }
}

export async function saveOpportunity(id, payload) {
  try {
    const response = id ? await apiClient.put(`/opportunities/${id}`, payload) : await apiClient.post('/opportunities', payload);
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to save opportunity'));
  }
}

export async function deleteOpportunity(id) {
  try {
    return extractData(await apiClient.delete(`/opportunities/${id}`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to delete opportunity'));
  }
}

export async function listInterests(id) {
  try {
    const data = extractData(await apiClient.get(`/opportunities/${id}/interests`));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load interested farmers'));
  }
}

export async function expressInterest(id, payload = {}) {
  try {
    return extractData(await apiClient.post(`/opportunities/${id}/interest`, payload));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to send your interest'));
  }
}

export async function withdrawInterest(id) {
  try {
    return extractData(await apiClient.delete(`/opportunities/${id}/interest`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to withdraw interest'));
  }
}

/** Matching engine: opportunities ranked by fit for a farmer (own, or ?farmer_id for staff). */
export async function getMatches(farmerId) {
  try {
    return extractData(await apiClient.get('/opportunities/matches', { params: cleanParams({ farmer_id: farmerId }) }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load your best matches'));
  }
}

/** Matching engine, reverse: best-fit farmers for one opportunity (staff). */
export async function getMatchingFarmers(id, limit = 25) {
  try {
    return extractData(await apiClient.get(`/opportunities/${id}/matching-farmers`, { params: { limit } }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to find matching farmers'));
  }
}

export const MATCH_LEVELS = {
  excellent: { label: 'Excellent match', tone: 'brand' },
  good: { label: 'Good match', tone: 'blue' },
  fair: { label: 'Fair match', tone: 'amber' },
  low: { label: 'Weak match', tone: 'slate' },
};
