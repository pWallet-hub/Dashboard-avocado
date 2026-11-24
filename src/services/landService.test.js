import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as land from './landService';
import * as surveys from './surveysService';
import apiClient from './apiClient';
import { toRwandaPhone } from '../Pages/Login/ClaimAccount';
import { ringToGeoJson, geoJsonToRing, areaSqm } from '../components/Map/ParcelEditor';

vi.mock('./apiClient', () => {
  const mockApiClient = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  return { default: mockApiClient, extractData: (response) => response.data.data };
});

describe('land / UPI helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recognises UPI shapes', () => {
    expect(land.looksLikeUpi('5/01/02/03/1234')).toBe(true);
    expect(land.looksLikeUpi(' 1/3/1/4/30 ')).toBe(true);
    expect(land.looksLikeUpi('5/01/02/03/1234-2')).toBe(true);
    expect(land.looksLikeUpi('5-01-02')).toBe(false);
    expect(land.looksLikeUpi('')).toBe(false);
  });

  it('does not call the API for a malformed UPI', async () => {
    await expect(land.checkUpi('abc')).rejects.toThrow(/format/);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('sends the UPI as a query parameter (it contains slashes)', async () => {
    apiClient.get.mockResolvedValue({ data: { success: true, data: { valid: true } } });
    await land.checkUpi(' 5/01/02/03/1234 ');
    expect(apiClient.get).toHaveBeenCalledWith('/land/upi', { params: { upi: '5/01/02/03/1234' } });
  });

  it('drops empty map filters', async () => {
    apiClient.get.mockResolvedValue({ data: { success: true, data: { features: [] } } });
    await land.getFarmMap({ district: 'Gatsibo', province: '', boundaries: 'true' });
    expect(apiClient.get).toHaveBeenCalledWith('/map/farms', { params: { district: 'Gatsibo', boundaries: 'true' } });
  });

  it('formats areas in hectares', () => {
    expect(land.formatArea(25000)).toBe('2.5 ha');
    expect(land.formatArea(null)).toBe('—');
  });
});

describe('parcel geometry', () => {
  const ring = [[-2, 30], [-2, 30.000898], [-1.999102, 30.000898], [-1.999102, 30]];
  it('round-trips editor rings and GeoJSON (closed, lng/lat order)', () => {
    const gj = ringToGeoJson(ring);
    expect(gj.coordinates[0]).toHaveLength(5);
    expect(gj.coordinates[0][0]).toEqual([30, -2]);
    expect(geoJsonToRing(gj)).toEqual(ring);
    expect(ringToGeoJson(ring.slice(0, 2))).toBeNull();
  });
  it('computes ~1 ha for a 100 m square', () => {
    expect(areaSqm(ring)).toBeGreaterThan(9500);
    expect(areaSqm(ring)).toBeLessThan(10500);
  });
});

describe('phone normalisation for account activation', () => {
  it('accepts common Rwandan formats', () => {
    expect(toRwandaPhone('0788 123 456')).toBe('+250788123456');
    expect(toRwandaPhone('788123456')).toBe('+250788123456');
    expect(toRwandaPhone('+250 788-123-456')).toBe('+250788123456');
    expect(toRwandaPhone('12345')).toBeNull();
  });
});

describe('survey import service', () => {
  beforeEach(() => vi.clearAllMocks());
  it('rejects non-spreadsheet files before uploading', async () => {
    await expect(surveys.previewSurveyImport(new File(['x'], 'notes.txt'))).rejects.toThrow(/xlsx/);
    expect(apiClient.post).not.toHaveBeenCalled();
  });
  it('uploads as multipart form data', async () => {
    apiClient.post.mockResolvedValue({ data: { success: true, data: { batch_id: 'b1' } } });
    const res = await surveys.previewSurveyImport(new File(['x'], 'survey.xlsx'));
    expect(res.batch_id).toBe('b1');
    const [url, body] = apiClient.post.mock.calls[0];
    expect(url).toBe('/surveys/import/preview');
    expect(body).toBeInstanceOf(FormData);
  });
});
