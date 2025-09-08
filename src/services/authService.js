import apiClient from './apiClient';

// Register a new user
export async function register(userData) {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    // Enhanced error handling to properly extract messages from API responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.data?.message) {
      throw new Error(error.response.data.data.message);
    } else if (error.response?.status === 409) {
      throw new Error('User with this email already exists');
    } else if (error.response?.status === 500) {
      throw new Error('Registration failed. Please try again later.');
    } else {
      throw new Error('Failed to register user');
    }
  }
}

// Login user
export async function login(credentials) {
  try {
    // Validate input credentials
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }
    
    // Log the credentials being sent (remove in production)
    console.log("Sending login credentials:", credentials);
    
    const response = await apiClient.post('/auth/login', credentials);
    
    // Log the response received (remove in production)
    console.log("Received login response:", response);
    
    // Validate response structure according to API documentation
    if (!response.data || !response.data.data || !response.data.data.token || !response.data.data.user) {
      throw new Error("Invalid response format from server");
    }
    
    // Standardize response format
    const userData = {
      token: response.data.data.token,
      user: {
        id: response.data.data.user.id,
        email: response.data.data.user.email,
        full_name: response.data.data.user.full_name,
        role: response.data.data.user.role, // Keep original role format
        status: response.data.data.user.status
      }
    };
    
    return userData;
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("Login error:", error);
    console.error("Error response:", error.response);
    
    // More specific error handling based on API documentation
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.data?.message) {
      throw new Error(error.response.data.data.message);
    } else if (error.response?.status === 401) {
      throw new Error("Invalid credentials. Please check your email and password.");
    } else if (error.response?.status === 500) {
      throw new Error("Server error. Please try again later.");
    } else if (error.code === "ERR_NETWORK") {
      throw new Error("Network error. Please check your internet connection.");
    } else {
      throw new Error("Login failed. Please try again.");
    }
  }
}

// Logout user
export async function logout() {
  try {
    const response = await apiClient.post('/auth/logout');
    // Clear all user-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    return response.data;
  } catch (error) {
    // Enhanced error handling to properly extract messages from API responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.data?.message) {
      throw new Error(error.response.data.data.message);
    } else if (error.response?.status === 500) {
      throw new Error('Logout failed. Please try again later.');
    } else {
      // Even if logout fails on the server, we should clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('username');
      throw new Error('Failed to logout');
    }
  }
}

// Get current user profile
export async function getProfile() {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    // Enhanced error handling to properly extract messages from API responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.data?.message) {
      throw new Error(error.response.data.data.message);
    } else if (error.response?.status === 500) {
      throw new Error('Failed to fetch profile. Please try again later.');
    } else {
      throw new Error('Failed to fetch profile');
    }
  }
}

// Update current user profile
export async function updateProfile(profileData) {
  try {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    // Enhanced error handling to properly extract messages from API responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.data?.message) {
      throw new Error(error.response.data.data.message);
    } else if (error.response?.status === 500) {
      throw new Error('Failed to update profile. Please try again later.');
    } else {
      throw new Error('Failed to update profile');
    }
  }
}

// Change user password
export async function changePassword(passwordData) {
  try {
    const response = await apiClient.put('/auth/password', passwordData);
    return response.data;
  } catch (error) {
    // Enhanced error handling to properly extract messages from API responses
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.data?.message) {
      throw new Error(error.response.data.data.message);
    } else if (error.response?.status === 500) {
      throw new Error('Failed to change password. Please try again later.');
    } else {
      throw new Error('Failed to change password');
    }
  }
}