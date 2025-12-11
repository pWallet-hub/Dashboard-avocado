import apiClient from './apiClient';

class AuthService {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'currentUser';
  }

  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        this.setAuthData(response.data.data.token, response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error occurred' 
      };
    }
  }

  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success) {
        this.setAuthData(response.data.data.token, response.data.data.user);
        return { success: true, user: response.data.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Network error occurred' 
      };
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData);
      if (response.data.success) {
        const updatedUser = response.data.data;
        localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error(response.data.message);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      if (response.data.success) {
        this.setAuthData(response.data.data.token, response.data.data.user);
        return response.data.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      this.clearAuthData();
      throw new Error('Session expired');
    }
  }

  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/verify');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  setAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return roles.includes(user?.role);
  }
}

export default new AuthService();