import apiClient, { extractData } from './apiClient';

// Get all users (Admin only)
export async function listUsers(options = {}) {
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.role) params.role = options.role;
  if (options.status) params.status = options.status;
  if (options.search) params.search = options.search;
  
  const response = await apiClient.get('/users', { params });
  return extractData(response);
}

// Get user by ID
export async function getUser(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const response = await apiClient.get(`/users/${userId}`);
  return extractData(response);
}

// Update user
export async function updateUser(userId, userData) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (!userData || typeof userData !== 'object') {
    throw new Error("Valid user data is required");
  }
  
  const response = await apiClient.put(`/users/${userId}`, userData);
  return extractData(response);
}

// Delete user
export async function deleteUser(userId) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  const response = await apiClient.delete(`/users/${userId}`);
  return extractData(response);
}

// Get all farmers
export async function listFarmers(options = {}) {
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  if (options.search) params.search = options.search;
  
  const response = await apiClient.get('/users/farmers', { params });
  return extractData(response);
}

// Get all agents
export async function listAgents(options = {}) {
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  if (options.search) params.search = options.search;
  
  const response = await apiClient.get('/users/agents', { params });
  return extractData(response);
}

// Update user status
export async function updateUserStatus(userId, status) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (!status || typeof status !== 'string') {
    throw new Error("Valid status is required");
  }
  
  const response = await apiClient.put(`/users/${userId}/status`, { status });
  return extractData(response);
}

// Update user role
export async function updateUserRole(userId, role) {
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (!role || typeof role !== 'string') {
    throw new Error("Valid role is required");
  }
  
  const response = await apiClient.put(`/users/${userId}/role`, { role });
  return extractData(response);
}