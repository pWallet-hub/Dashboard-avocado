import { describe, it, expect, vi } from 'vitest';
import * as authService from './authService';
import apiClient from './apiClient';

// Mock the apiClient
vi.mock('./apiClient');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key],
    clear: () => store = {}
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should register a user', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: '1',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'farmer',
            status: 'active'
          }
        },
        message: 'User registered successfully'
      }
    };

    apiClient.post.mockResolvedValue(mockResponse);

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User'
    };

    const result = await authService.register(userData);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle register error with message', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'User already exists'
        },
        status: 409
      }
    };

    apiClient.post.mockRejectedValue(errorResponse);

    const userData = {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User'
    };

    await expect(authService.register(userData)).rejects.toThrow('User already exists');
  });

  it('should login a user with valid credentials', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: '1',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'farmer',
            status: 'active'
          }
        },
        message: 'Login successful'
      }
    };

    apiClient.post.mockResolvedValue(mockResponse);

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await authService.login(credentials);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result).toEqual({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'farmer',
        status: 'active'
      }
    });
  });

  it('should handle login error with message', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Invalid credentials'
        },
        status: 401
      }
    };

    apiClient.post.mockRejectedValue(errorResponse);

    const credentials = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials. Please check your email and password.');
  });

  it('should handle network error during login', async () => {
    const errorResponse = {
      code: 'ERR_NETWORK'
    };

    apiClient.post.mockRejectedValue(errorResponse);

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Network error. Please check your internet connection.');
  });

  it('should handle server error during login', async () => {
    const errorResponse = {
      response: {
        status: 500
      }
    };

    apiClient.post.mockRejectedValue(errorResponse);

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Server error. Please try again later.');
  });

  it('should handle invalid response format during login', async () => {
    const mockResponse = {
      data: {
        success: true,
        // Missing data.token and data.user
      }
    };

    apiClient.post.mockResolvedValue(mockResponse);

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Invalid response format from server');
  });

  it('should validate credentials before sending request', async () => {
    const credentials = {
      email: '',
      password: 'password123'
    };

    await expect(authService.login(credentials)).rejects.toThrow('Email and password are required');
  });

  it('should logout a user and clear localStorage', async () => {
    // Set up localStorage with some data
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));
    localStorage.setItem('role', 'farmer');
    localStorage.setItem('id', '1');
    localStorage.setItem('username', 'test@example.com');

    const mockResponse = {
      data: {
        success: true,
        data: null,
        message: 'Logout successful'
      }
    };

    apiClient.post.mockResolvedValue(mockResponse);

    const result = await authService.logout();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    expect(result).toEqual(mockResponse.data);
    // Check that localStorage items are cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('id')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('should logout user and clear localStorage even if server request fails', async () => {
    // Set up localStorage with some data
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@example.com' }));
    localStorage.setItem('role', 'farmer');
    localStorage.setItem('id', '1');
    localStorage.setItem('username', 'test@example.com');

    const errorResponse = {
      response: {
        data: {
          message: 'Logout failed'
        },
        status: 500
      }
    };

    apiClient.post.mockRejectedValue(errorResponse);

    await expect(authService.logout()).rejects.toThrow('Logout failed');
    // Check that localStorage items are still cleared even when server request fails
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('id')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('should get user profile', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Test User',
          phone: '1234567890',
          role: 'farmer',
          status: 'active',
          profile: {},
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        },
        message: 'Profile retrieved successfully'
      }
    };

    apiClient.get.mockResolvedValue(mockResponse);

    const result = await authService.getProfile();

    expect(apiClient.get).toHaveBeenCalledWith('/auth/profile');
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle profile error with message', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Failed to fetch profile'
        },
        status: 500
      }
    };

    apiClient.get.mockRejectedValue(errorResponse);

    await expect(authService.getProfile()).rejects.toThrow('Failed to fetch profile. Please try again later.');
  });

  it('should update user profile', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          full_name: 'Updated User',
          phone: '1234567890',
          role: 'farmer',
          status: 'active',
          profile: {},
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-02T00:00:00.000Z'
        },
        message: 'Profile updated successfully'
      }
    };

    const profileData = {
      full_name: 'Updated User',
      phone: '1234567890'
    };

    apiClient.put.mockResolvedValue(mockResponse);

    const result = await authService.updateProfile(profileData);

    expect(apiClient.put).toHaveBeenCalledWith('/auth/profile', profileData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle update profile error with message', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Failed to update profile'
        },
        status: 500
      }
    };

    const profileData = {
      full_name: 'Updated User'
    };

    apiClient.put.mockRejectedValue(errorResponse);

    await expect(authService.updateProfile(profileData)).rejects.toThrow('Failed to update profile. Please try again later.');
  });

  it('should change user password', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: null,
        message: 'Password changed successfully'
      }
    };

    const passwordData = {
      current_password: 'oldpassword',
      new_password: 'newpassword123'
    };

    apiClient.put.mockResolvedValue(mockResponse);

    const result = await authService.changePassword(passwordData);

    expect(apiClient.put).toHaveBeenCalledWith('/auth/password', passwordData);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle change password error with message', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Current password is incorrect'
        },
        status: 400
      }
    };

    const passwordData = {
      current_password: 'wrongpassword',
      new_password: 'newpassword123'
    };

    apiClient.put.mockRejectedValue(errorResponse);

    await expect(authService.changePassword(passwordData)).rejects.toThrow('Current password is incorrect');
  });
});