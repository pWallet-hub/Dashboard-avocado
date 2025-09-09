import * as analyticsService from './analyticsService';
import apiClient from './apiClient';

// Mock the apiClient
jest.mock('./apiClient', () => ({
  ...jest.requireActual('./apiClient'),
  get: jest.fn(),
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getDashboardStatistics', () => {
    it('should fetch dashboard statistics', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          success: true,
          data: {
            totalUsers: 100,
            totalProducts: 50,
            totalOrders: 200,
            totalRevenue: 5000,
          },
          message: 'Dashboard statistics retrieved successfully',
        },
      };

      // Mock the apiClient.get method
      apiClient.get.mockResolvedValue(mockResponse);

      // Call the function
      const result = await analyticsService.getDashboardStatistics();

      // Assertions
      expect(apiClient.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getSalesAnalytics', () => {
    it('should fetch sales analytics without date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            totalSales: 1000,
            salesByMonth: [],
          },
          message: 'Sales analytics retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await analyticsService.getSalesAnalytics();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/sales', { params: {} });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should fetch sales analytics with date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            totalSales: 1000,
            salesByMonth: [],
          },
          message: 'Sales analytics retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const options = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      };

      const result = await analyticsService.getSalesAnalytics(options);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/sales', { 
        params: {
          start_date: '2023-01-01',
          end_date: '2023-12-31',
        } 
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getProductAnalytics', () => {
    it('should fetch product analytics without date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            topSellingProducts: [],
            lowStockProducts: [],
          },
          message: 'Product analytics retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await analyticsService.getProductAnalytics();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/products', { params: {} });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should fetch product analytics with date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            topSellingProducts: [],
            lowStockProducts: [],
          },
          message: 'Product analytics retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const options = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      };

      const result = await analyticsService.getProductAnalytics(options);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/products', { 
        params: {
          start_date: '2023-01-01',
          end_date: '2023-12-31',
        } 
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getUserAnalytics', () => {
    it('should fetch user analytics without date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            newUserRegistrations: 50,
            activeUsers: 80,
          },
          message: 'User analytics retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await analyticsService.getUserAnalytics();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/users', { params: {} });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should fetch user analytics with date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            newUserRegistrations: 50,
            activeUsers: 80,
          },
          message: 'User analytics retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const options = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      };

      const result = await analyticsService.getUserAnalytics(options);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/users', { 
        params: {
          start_date: '2023-01-01',
          end_date: '2023-12-31',
        } 
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getMonthlyOrderTrends', () => {
    it('should fetch monthly order trends without date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            monthlyTrends: [],
          },
          message: 'Monthly order trends retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const result = await analyticsService.getMonthlyOrderTrends();

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/orders/monthly', { params: {} });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should fetch monthly order trends with date range', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            monthlyTrends: [],
          },
          message: 'Monthly order trends retrieved successfully',
        },
      };

      apiClient.get.mockResolvedValue(mockResponse);

      const options = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
      };

      const result = await analyticsService.getMonthlyOrderTrends(options);

      expect(apiClient.get).toHaveBeenCalledWith('/analytics/orders/monthly', { 
        params: {
          start_date: '2023-01-01',
          end_date: '2023-12-31',
        } 
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });
});