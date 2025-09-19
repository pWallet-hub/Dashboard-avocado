import apiClient, { extractData } from './apiClient';

// Register a new user
export async function register(userData) {
  // Validate input data
  if (!userData || !userData.email || !userData.password || !userData.full_name) {
    throw new Error("Email, password, and full name are required");
  }
  
  if (userData.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  
  const response = await apiClient.post('/auth/register', userData);
  return extractData(response);
}

// Login user
export async function login(credentials) {
  // Validate input credentials
  if (!credentials || !credentials.email || !credentials.password) {
    throw new Error("Email and password are required");
  }
  
  const response = await apiClient.post('/auth/login', credentials);
  const data = extractData(response);
  
  // Validate response structure according to API documentation
  if (!data || !data.token || !data.user) {
    throw new Error("Invalid response format from server");
  }
  
  // Store tokens and user data in localStorage
  localStorage.setItem('token', data.token);
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  
  // Store user information
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('role', data.user.role);
  localStorage.setItem('id', data.user.id);
  
  return data;
}

// Logout user
export async function logout() {
  try {
    const response = await apiClient.post('/auth/logout');
    
    // Clear all user-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    
    return extractData(response);
  } catch (error) {
    // Even if logout fails on the server, we should clear local data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    
    // If it's a network error, we still consider logout successful locally
    if (error.message.includes('Network error')) {
      return { success: true, message: 'Logged out successfully' };
    }
    
    throw error;
  }
}

// Get current user profile - role-based endpoint selection
export async function getProfile() {
  try {
    // Get user role from localStorage
    const userRole = localStorage.getItem('role');
    
    let endpoint;
    if (userRole === 'farmer') {
      // Farmers use the enhanced profile endpoint with flattened data
      endpoint = '/users/me';
      console.log('Fetching farmer profile from /users/me');
    } else {
      // Other roles use the standard auth profile endpoint
      endpoint = '/auth/profile';
      console.log('Fetching profile from /auth/profile for role:', userRole);
    }
    
    const response = await apiClient.get(endpoint);
    console.log('Profile response:', response);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

// Update current user profile - role-based endpoint selection
export async function updateProfile(profileData) {
  // Validate input data
  if (!profileData || typeof profileData !== 'object') {
    throw new Error("Valid profile data is required");
  }
  
  try {
    // Get user role from localStorage
    const userRole = localStorage.getItem('role');
    
    let endpoint;
    if (userRole === 'farmer') {
      // Farmers use the enhanced profile endpoint with flattened data structure
      endpoint = '/users/me';
      console.log('Updating farmer profile at /users/me with data:', profileData);
    } else {
      // Other roles use the standard auth profile endpoint
      endpoint = '/auth/profile';
      console.log('Updating profile at /auth/profile for role:', userRole, 'with data:', profileData);
    }
    
    const response = await apiClient.put(endpoint, profileData);
    console.log('Profile update response:', response);
    
    const updatedUser = extractData(response);
    
    // Update user data in localStorage
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Update role if it changed
      if (updatedUser.role) {
        localStorage.setItem('role', updatedUser.role);
      }
      // Update id if it changed
      if (updatedUser.id) {
        localStorage.setItem('id', updatedUser.id);
      }
    }
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

// Change user password
export async function changePassword(passwordData) {
  // Validate input data
  if (!passwordData || !passwordData.currentPassword || !passwordData.newPassword) {
    throw new Error("Current password and new password are required");
  }
  
  if (passwordData.newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long");
  }
  
  const response = await apiClient.put('/auth/password', passwordData);
  return extractData(response);
}

// Refresh token
export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  const data = extractData(response);
  
  if (data && data.token) {
    localStorage.setItem('token', data.token);
    // Update user data if provided
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('id', data.user.id);
    }
    return data;
  } else {
    throw new Error("Failed to refresh token");
  }
}