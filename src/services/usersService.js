import apiClient from './apiClient';

// Get all users (Admin only)
export async function listUsers(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.role) params.role = options.role;
    if (options.status) params.status = options.status;
    if (options.search) params.search = options.search;
    
    const response = await apiClient.get('/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
}

// Get user by ID
export async function getUser(userId) {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
}

// Update user
export async function updateUser(userId, userData) {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
}

// Delete user
export async function deleteUser(userId) {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
}

// Get all farmers
export async function listFarmers(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.search) params.search = options.search;
    
    const response = await apiClient.get('/users/farmers', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch farmers');
  }
}

// Get all agents
export async function listAgents(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.search) params.search = options.search;
    
    const response = await apiClient.get('/users/agents', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch agents');
  }
}

// Update user status
export async function updateUserStatus(userId, status) {
  try {
    const response = await apiClient.put(`/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
}

// Update user role
export async function updateUserRole(userId, role) {
  try {
    const response = await apiClient.put(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
}