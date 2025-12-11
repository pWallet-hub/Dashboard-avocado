import { describe, it, expect, beforeEach, vi } from 'vitest';
import authService from '../authService';

// Mock apiClient
vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'mock-token',
            user: { id: '1', email: 'test@example.com', role: 'farmer' }
          }
        }
      };

      const apiClient = await import('../apiClient');
      apiClient.default.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(localStorage.getItem('authToken')).toBe('mock-token');
    });

    it('should handle login failure', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };

      const apiClient = await import('../apiClient');
      apiClient.default.post.mockRejectedValue(mockError);

      const result = await authService.login('test@example.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear auth data on logout', async () => {
      // Set up initial auth data
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: '1' }));

      const apiClient = await import('../apiClient');
      apiClient.default.post.mockResolvedValue({ data: { success: true } });

      await authService.logout();

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('authToken', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      localStorage.setItem('currentUser', JSON.stringify({ role: 'admin' }));
      expect(authService.hasRole('admin')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      localStorage.setItem('currentUser', JSON.stringify({ role: 'farmer' }));
      expect(authService.hasRole('admin')).toBe(false);
    });
  });
});