import apiClient, { extractData } from './apiClient';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

/** The signed-in farmer's membership card (issued on first view). */
export async function getMyCard() {
  try {
    return extractData(await apiClient.get('/membership/me'));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load your membership card'));
  }
}

/** A farmer's card, for staff to print. */
export async function getFarmerCard(userId) {
  try {
    return extractData(await apiClient.get(`/membership/${userId}/card`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load the membership card'));
  }
}

export async function renewMembership(userId) {
  try {
    return extractData(await apiClient.post(`/membership/${userId}/renew`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to renew membership'));
  }
}

/** Public check of a card from its QR code (no login). */
export async function verifyCard(token) {
  try {
    return extractData(await apiClient.get(`/membership/verify/${encodeURIComponent(token)}`));
  } catch (error) {
    if (error.response?.status === 404) throw new Error(error.response.data?.message || 'This card is not recognised.');
    throw new Error(errorMessage(error, 'Could not check this card right now'));
  }
}

export const MEMBERSHIP_STATUS = {
  active: { label: 'Active', tone: 'brand' },
  expiring: { label: 'Expiring soon', tone: 'amber' },
  expired: { label: 'Expired', tone: 'rose' },
  suspended: { label: 'Suspended', tone: 'slate' },
};
