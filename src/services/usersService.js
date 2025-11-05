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

// UPDATED: Create user - now handles agents correctly
export async function createUser(userData) {
  if (!userData || typeof userData !== 'object') {
    throw new Error("Valid user data is required");
  }
  
  // Validate required fields
  if (!userData.email || !userData.full_name) {
    throw new Error("Email and full name are required");
  }
  
  // Check if this is agent data (has location fields)
  const isAgentData = userData.province || userData.district || userData.sector;
  
  if (isAgentData) {
    console.log('Creating agent with data:', userData);
    // Use the agent-specific endpoint
    const response = await apiClient.post('/users/agents', userData);
    return extractData(response);
  }
  
  // For regular users, use the standard endpoint
  const response = await apiClient.post('/users', userData);
  return extractData(response);
}

// NEW: Dedicated function for creating farmers
export async function createFarmer(farmerData) {
  if (!farmerData || typeof farmerData !== 'object') {
    throw new Error("Valid farmer data is required");
  }
  
  // Validate required fields for farmer creation
  if (!farmerData.email || !farmerData.full_name || !farmerData.gender) {
    throw new Error("Email, full name, and gender are required");
  }
  
  console.log('Creating farmer with endpoint /users/farmers and data:', farmerData);
  
  try {
    const response = await apiClient.post('/users/farmers', farmerData);
    console.log('Farmer creation response:', response);
    return extractData(response);
  } catch (error) {
    console.error('Farmer creation error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

// NEW: Dedicated function for creating agents
export async function createAgent(agentData) {
  if (!agentData || typeof agentData !== 'object') {
    throw new Error("Valid agent data is required");
  }
  
  // Validate required fields for agent creation
  if (!agentData.email || !agentData.full_name) {
    throw new Error("Email and full name are required");
  }
  
  console.log('Creating agent with endpoint /users/agents and data:', agentData);
  
  try {
    const response = await apiClient.post('/users/agents', agentData);
    console.log('Agent creation response:', response);
    return extractData(response);
  } catch (error) {
    console.error('Agent creation error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
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
  // Return the full response.data to preserve meta.pagination
  return response.data;
}

// UPDATED: Get all agents with better error handling
export async function listAgents(options = {}) {
  try {
    console.log('Fetching agents from /users/agents');
    const response = await apiClient.get('/users/agents');
    console.log('Agents response:', response);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching agents:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
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