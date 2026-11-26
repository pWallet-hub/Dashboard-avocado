import apiClient, { extractData } from './apiClient';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;
const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** Activation counters (filters: batch_id, district, search). */
export async function getActivationSummary(filters = {}) {
  try {
    return extractData(await apiClient.get('/activation/summary', { params: clean(filters) }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load activation summary'));
  }
}

/** Farmers with their activation state. filters: status, invited, has_phone, batch_id, district, search, page, limit */
export async function listActivationFarmers(filters = {}) {
  try {
    const response = await apiClient.get('/activation/farmers', { params: clean(filters) });
    const body = response.data || {};
    return { data: Array.isArray(body.data) ? body.data : [], pagination: body.meta?.pagination || { page: 1, totalPages: 1, total: 0 } };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load farmers'));
  }
}

/** { farmer_ids?, batch_id?, district?, resend?, dry_run? } → { recipients, … } */
export async function sendActivationInvites(body) {
  try {
    return extractData(await apiClient.post('/activation/invites', body));
  } catch (error) {
    throw new Error(errorMessage(error, 'Could not send the invitations'));
  }
}

export async function getInviteStatus() {
  try {
    return extractData(await apiClient.get('/activation/invites/status'));
  } catch {
    return null;
  }
}

/** The signed-in farmer's profile completeness. */
export async function getMyProfileStatus() {
  try {
    return extractData(await apiClient.get('/activation/me'));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load your profile status'));
  }
}

/** Farms whose land data needs work: filters code, district, page, limit. */
export async function getLandIssues(filters = {}) {
  try {
    return extractData(await apiClient.get('/land/issues', { params: clean(filters) }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load land issues'));
  }
}
