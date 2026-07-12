import apiClient from './apiClient';

/**
 * Pending Farmers Service
 * Handles farmers registered without a login account yet, and their approval into real accounts
 * Base URL: /api/pending-farmers
 */

const BASE = '/pending-farmers';

export const getPendingFarmers = async (status = 'pending') => {
  const response = await apiClient.get(BASE, { params: { status } });
  return response.data;
};

export const addPendingFarmer = async ({ full_name, email, phone }) => {
  const response = await apiClient.post(BASE, { full_name, email, phone });
  return response.data;
};

export const approvePendingFarmer = async (id) => {
  const response = await apiClient.put(`${BASE}/${id}/approve`);
  return response.data;
};

export const rejectPendingFarmer = async (id) => {
  const response = await apiClient.put(`${BASE}/${id}/reject`);
  return response.data;
};

export const deletePendingFarmer = async (id) => {
  const response = await apiClient.delete(`${BASE}/${id}`);
  return response.data;
};
