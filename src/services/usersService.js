import apiClient from './apiClient';

// Get all users (Admin only)
export const getUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

// Get all farmers
export const getFarmers = async (params = {}) => {
  try {
    const response = await apiClient.get('/users/farmers', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farmers');
  }
};

// Get all agents
export const getAgents = async (params = {}) => {
  try {
    const response = await apiClient.get('/users/agents', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch agents');
  }
};

// Get all shop managers
export const getShopManagers = async (params = {}) => {
  try {
    const response = await apiClient.get('/users/shop-managers', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch shop managers');
  }
};

// Create farmer
export const createFarmer = async (farmerData) => {
  try {
    const response = await apiClient.post('/users/farmers', farmerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create farmer');
  }
};

// Create agent
export const createAgent = async (agentData) => {
  try {
    const response = await apiClient.post('/users/agents', agentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create agent');
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

// Update current user profile
export const updateCurrentUser = async (userData) => {
  try {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

// Update user by ID
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

// Update user status
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await apiClient.put(`/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
};

// Update user role
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.put(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};