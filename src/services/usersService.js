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

// Create user
export async function createUser(userData) {
  if (!userData || typeof userData !== 'object') {
    throw new Error("Valid user data is required");
  }
  
  // Validate required fields
  if (!userData.email || !userData.full_name) {
    throw new Error("Email and full name are required");
  }
  
  const response = await apiClient.post('/users', userData);
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
  const updatedUser = extractData(response);
  
  // If this is the current user, update localStorage
  const currentUserId = localStorage.getItem('id');
  if (currentUserId === userId && updatedUser) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Update role if it changed
    if (updatedUser.role) {
      localStorage.setItem('role', updatedUser.role);
    }
  }
  
  return updatedUser;
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
  // Only send parameters if they are required by the backend
  // If you know which params are valid, add them below. Otherwise, send no params.
  const validParams = {};
  // Example: if backend supports 'status' and 'search', uncomment below
  // if (options.status) validParams.status = options.status;
  // if (options.search) validParams.search = options.search;
  const response = Object.keys(validParams).length > 0
    ? await apiClient.get('/users/agents', { params: validParams })
    : await apiClient.get('/users/agents');
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
  const updatedUser = extractData(response);
  
  // If this is the current user, update localStorage
  const currentUserId = localStorage.getItem('id');
  if (currentUserId === userId && updatedUser) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.status = status;
    localStorage.setItem('user', JSON.stringify(currentUser));
  }
  
  return updatedUser;
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
  const updatedUser = extractData(response);
  
  // If this is the current user, update localStorage
  const currentUserId = localStorage.getItem('id');
  if (currentUserId === userId && updatedUser) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.role = role;
    localStorage.setItem('user', JSON.stringify(currentUser));
    localStorage.setItem('role', role);
  }
  
  return updatedUser;
}