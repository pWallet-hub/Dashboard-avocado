import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as svc from './harvestLotsService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => {
  const mockApiClient = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  return { default: mockApiClient, extractData: (response) => response.data.data };
});

describe('harvestLotsService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('allowedLotActions', () => {
    const lot = (status) => ({ id: '1', status });
    it('lets staff verify/reject recorded lots but not farmers', () => {
      expect(svc.allowedLotActions(lot('recorded'), 'agent')).toEqual(['verify', 'reject']);
      expect(svc.allowedLotActions(lot('recorded'), 'admin')).toEqual(['verify', 'reject', 'delete']);
      expect(svc.allowedLotActions(lot('recorded'), 'farmer')).toEqual(['delete']);
    });
    it('follows the verified -> sold -> delivered workflow', () => {
      expect(svc.allowedLotActions(lot('verified'), 'farmer')).toEqual(['sell']);
      expect(svc.allowedLotActions(lot('verified'), 'agent')).toEqual(['reject', 'sell']);
      expect(svc.allowedLotActions(lot('sold'), 'farmer')).toEqual(['deliver']);
      expect(svc.allowedLotActions(lot('delivered'), 'admin')).toEqual([]);
      expect(svc.allowedLotActions(lot('rejected'), 'agent')).toEqual([]);
    });
  });

  it('validates a new lot before calling the API', async () => {
    await expect(svc.createHarvestLot({ harvest_date: '2026-11-01', quantity_kg: 5 })).rejects.toThrow(/farm/);
    await expect(svc.createHarvestLot({ farm_id: 'f', harvest_date: '2026-11-01', quantity_kg: 0 })).rejects.toThrow(/Quantity/);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('posts workflow actions to the right endpoint', async () => {
    apiClient.post.mockResolvedValue({ data: { success: true, data: { status: 'sold' } } });
    const res = await svc.sellHarvestLot('lot-1', { buyer_name: 'B', price_per_kg: 700 });
    expect(apiClient.post).toHaveBeenCalledWith('/harvest-lots/lot-1/sell', { buyer_name: 'B', price_per_kg: 700 });
    expect(res.status).toBe('sold');
  });

  it('maps a 404 trace lookup to a friendly message', async () => {
    apiClient.get.mockRejectedValue({ response: { status: 404, data: { message: 'Lot not found' } } });
    await expect(svc.traceLot('AVO-20260101-ABCDEF')).rejects.toThrow('No harvest lot found with this code.');
    expect(apiClient.get).toHaveBeenCalledWith('/traceability/AVO-20260101-ABCDEF');
  });

  it('statusMeta falls back to "recorded" styling for unknown status', () => {
    expect(svc.statusMeta('sold').label).toBe('Sold');
    expect(svc.statusMeta('weird').value).toBe('recorded');
  });
});
