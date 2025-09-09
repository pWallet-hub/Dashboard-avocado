import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as marketStorageService from './marketStorageService';

// Mock the apiClient
vi.mock('./apiClient', () => {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  
  return {
    default: mockApiClient,
    extractData: (response) => response.data,
  };
});

// Import the mocked apiClient
import apiClient from './apiClient';

describe('marketStorageService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('getSuppliers', () => {
    it('should fetch suppliers from the API', async () => {
      // Arrange
      const mockSuppliers = [{ id: '1', name: 'Test Supplier' }];
      apiClient.get.mockResolvedValue({ data: mockSuppliers });

      // Act
      const result = await marketStorageService.getSuppliers();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/market/suppliers');
      expect(result).toEqual(mockSuppliers);
    });

    it('should handle errors when fetching suppliers', async () => {
      // Arrange
      const errorMessage = 'Network error';
      apiClient.get.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(marketStorageService.getSuppliers()).rejects.toThrow(errorMessage);
    });
  });

  describe('createSupplier', () => {
    it('should create a new supplier', async () => {
      // Arrange
      const newSupplier = { name: 'New Supplier' };
      const createdSupplier = { id: '1', ...newSupplier };
      apiClient.post.mockResolvedValue({ data: createdSupplier });

      // Act
      const result = await marketStorageService.createSupplier(newSupplier);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/market/suppliers', newSupplier);
      expect(result).toEqual(createdSupplier);
    });

    it('should throw an error if supplier data is invalid', async () => {
      // Act & Assert
      await expect(marketStorageService.createSupplier(null)).rejects.toThrow('Valid supplier data is required');
      await expect(marketStorageService.createSupplier('invalid')).rejects.toThrow('Valid supplier data is required');
    });
  });

  describe('getShopInventory', () => {
    it('should fetch shop inventory from the API', async () => {
      // Arrange
      const mockInventory = [{ id: '1', productName: 'Test Product' }];
      apiClient.get.mockResolvedValue({ data: mockInventory });

      // Act
      const result = await marketStorageService.getShopInventory();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/market/inventory');
      expect(result).toEqual(mockInventory);
    });
  });

  describe('addToShopInventory', () => {
    it('should add an item to shop inventory', async () => {
      // Arrange
      const newItem = { productName: 'New Product' };
      const addedItem = { id: '1', ...newItem };
      apiClient.post.mockResolvedValue({ data: addedItem });

      // Act
      const result = await marketStorageService.addToShopInventory(newItem);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/market/inventory', newItem);
      expect(result).toEqual(addedItem);
    });

    it('should throw an error if item data is invalid', async () => {
      // Act & Assert
      await expect(marketStorageService.addToShopInventory(null)).rejects.toThrow('Valid inventory item data is required');
      await expect(marketStorageService.addToShopInventory('invalid')).rejects.toThrow('Valid inventory item data is required');
    });
  });

  describe('getOrders', () => {
    it('should fetch orders from the API', async () => {
      // Arrange
      const mockOrders = [{ id: '1', orderNumber: 'ORD-001' }];
      apiClient.get.mockResolvedValue({ data: mockOrders });

      // Act
      const result = await marketStorageService.getOrders();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/market/orders');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('calculateExpiryDate', () => {
    it('should calculate expiry date for avocados', () => {
      // Arrange
      const harvestDate = '2023-01-01';
      const category = 'Hass Avocados';

      // Act
      const result = marketStorageService.calculateExpiryDate(harvestDate, category);

      // Assert
      expect(result).toBe('2023-01-15'); // 14 days later
    });

    it('should calculate expiry date for seedlings', () => {
      // Arrange
      const harvestDate = '2023-01-01';
      const category = 'Avocado Seedlings';

      // Act
      const result = marketStorageService.calculateExpiryDate(harvestDate, category);

      // Assert
      expect(result).toBe('2023-01-31'); // 30 days later
    });

    it('should return empty string if no harvest date', () => {
      // Act
      const result = marketStorageService.calculateExpiryDate(null, 'Hass Avocados');

      // Assert
      expect(result).toBe('');
    });
  });
});