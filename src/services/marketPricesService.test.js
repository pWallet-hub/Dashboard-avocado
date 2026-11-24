import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as svc from './marketPricesService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => {
  const mockApiClient = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  return { default: mockApiClient, extractData: (response) => response.data.data };
});

describe('marketPricesService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists prices, dropping empty filters and returning pagination from meta', async () => {
    apiClient.get.mockResolvedValue({
      data: { success: true, data: [{ id: '1', price_per_kg: 400 }], meta: { pagination: { page: 2, totalPages: 3, hasNext: true } } },
    });
    const res = await svc.listMarketPrices({ district: '', price_type: 'farm_gate', page: 2 });
    expect(apiClient.get).toHaveBeenCalledWith('/market-prices', { params: { price_type: 'farm_gate', page: 2 } });
    expect(res.data).toHaveLength(1);
    expect(res.pagination.hasNext).toBe(true);
  });

  it('validates before creating a price', async () => {
    await expect(svc.createMarketPrice({ price_per_kg: 0, province: 'P', district: 'D' })).rejects.toThrow(/greater than 0/);
    await expect(svc.createMarketPrice({ price_per_kg: 10, province: 'P' })).rejects.toThrow(/district/);
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('sends price_per_kg as a number', async () => {
    apiClient.post.mockResolvedValue({ data: { success: true, data: { id: 'x' } } });
    await svc.createMarketPrice({ price_per_kg: '450', province: 'Eastern Province', district: 'Rwamagana' });
    expect(apiClient.post.mock.calls[0][1].price_per_kg).toBe(450);
  });

  it('surfaces the API error message', async () => {
    apiClient.get.mockRejectedValue({ response: { data: { message: 'price_type must be one of: ...' } } });
    await expect(svc.getLatestPrices({ price_type: 'bad' })).rejects.toThrow('price_type must be one of: ...');
  });

  it('pivots trend series into one row per period, sorted', () => {
    const rows = svc.pivotTrendSeries([
      { period: '2026-11-09', price_type: 'retail', average_price: 600 },
      { period: '2026-11-02', price_type: 'farm_gate', average_price: 400 },
      { period: '2026-11-09', price_type: 'farm_gate', average_price: 410 },
    ]);
    expect(rows).toEqual([
      { period: '2026-11-02', farm_gate: 400 },
      { period: '2026-11-09', retail: 600, farm_gate: 410 },
    ]);
  });

  it('labels known values and falls back gracefully', () => {
    expect(svc.labelFor(svc.GRADES, 'grade_a')).toBe('Grade A');
    expect(svc.labelFor(svc.GRADES, 'unknown')).toBe('unknown');
    expect(svc.labelFor(svc.GRADES, null)).toBe('—');
  });
});
