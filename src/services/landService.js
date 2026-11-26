import apiClient, { extractData } from './apiClient';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

/** Rwanda UPI shape: province/district/sector/cell/parcel (+ optional -unit). */
export const UPI_PATTERN = /^\s*\d\s*[/\\]\s*\d{1,2}\s*[/\\]\s*\d{1,2}\s*[/\\]\s*\d{1,2}\s*[/\\]\s*\d{1,7}(-\d{1,4})?\s*$/;
export const looksLikeUpi = (value) => UPI_PATTERN.test(String(value || ''));

export async function getLandRegistryStatus() {
  try {
    return extractData(await apiClient.get('/land/status'));
  } catch {
    return { registry_enabled: false };
  }
}

export async function checkUpi(upi) {
  if (!looksLikeUpi(upi)) throw new Error('Use the format province/district/sector/cell/parcel, e.g. 5/01/02/03/1234');
  try {
    return extractData(await apiClient.get('/land/upi', { params: { upi: upi.trim() } }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Could not check this UPI'));
  }
}

export async function getFarmLand(farmId) {
  try {
    return extractData(await apiClient.get(`/land/farms/${farmId}`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load land details'));
  }
}

export async function saveFarmLand(farmId, payload) {
  try {
    return extractData(await apiClient.put(`/land/farms/${farmId}`, payload));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to save land details'));
  }
}

export async function verifyFarmLand(farmId) {
  try {
    return extractData(await apiClient.post(`/land/farms/${farmId}/verify`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to verify land details'));
  }
}

export async function getFarmMap(filters = {}) {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null));
  try {
    return extractData(await apiClient.get('/map/farms', { params }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load the farm map'));
  }
}

/** m² → readable hectares */
export const formatArea = (sqm) => (sqm ? `${(sqm / 10000).toLocaleString(undefined, { maximumFractionDigits: 3 })} ha` : '—');

/**
 * RwaSIS (Rwanda Soil Information System, RAB) shows the parcel of a UPI on a
 * map. It has no API for other systems, so we only link to it: the user looks
 * the UPI up there and traces the same shape on our map.
 */
export const RWASIS_PORTAL_URL = import.meta.env?.VITE_RWASIS_PORTAL_URL || 'https://rwasis.rab.gov.rw/portal';

/** Largest polygon ring ([[lng,lat],…]) in a GeoJSON object of any shape. */
function largestRing(geo) {
  const rings = [];
  const walk = (g) => {
    if (!g) return;
    if (g.type === 'FeatureCollection') g.features?.forEach((f) => walk(f));
    else if (g.type === 'Feature') walk(g.geometry);
    else if (g.type === 'GeometryCollection') g.geometries?.forEach(walk);
    else if (g.type === 'Polygon') rings.push(g.coordinates?.[0]);
    else if (g.type === 'MultiPolygon') g.coordinates?.forEach((p) => rings.push(p?.[0]));
    else if (g.type === 'LineString' && g.coordinates?.length >= 3) rings.push(g.coordinates); // a walked track
  };
  walk(typeof geo === 'string' ? JSON.parse(geo) : geo);
  const valid = rings.filter((r) => Array.isArray(r) && r.length >= 3 && r.every((p) => Number.isFinite(p?.[0]) && Number.isFinite(p?.[1])));
  if (!valid.length) return null;
  const size = (r) => {
    const xs = r.map((p) => p[0]);
    const ys = r.map((p) => p[1]);
    return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
  };
  return valid.sort((a, b) => size(b) - size(a))[0];
}

/** KML (Google Earth, phone GPS apps) → [[lng,lat],…] of its largest polygon or track. */
function kmlRing(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const blocks = [...doc.getElementsByTagName('coordinates')].map((n) =>
    n.textContent.trim().split(/\s+/).map((t) => t.split(',').map(Number)).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
  );
  return largestRing({ type: 'GeometryCollection', geometries: blocks.map((c) => ({ type: 'LineString', coordinates: c })) });
}

/**
 * Read a boundary file (.geojson/.json or .kml) → editor ring [[lat,lng],…]
 * (open, no repeated last point). Throws with a readable message.
 */
export async function readBoundaryFile(file) {
  const text = await file.text();
  let ring;
  try {
    ring = /\.kml$/i.test(file.name) || text.trimStart().startsWith('<') ? kmlRing(text) : largestRing(text);
  } catch {
    throw new Error('Could not read this file. Use a GeoJSON (.geojson/.json) or KML (.kml) file.');
  }
  if (!ring) throw new Error('No polygon or track found in this file.');
  let pts = ring.map(([lng, lat]) => [lat, lng]);
  const [f, l] = [pts[0], pts[pts.length - 1]];
  if (f[0] === l[0] && f[1] === l[1]) pts = pts.slice(0, -1);
  if (pts.some(([lat, lng]) => lat < -2.95 || lat > -1.0 || lng < 28.8 || lng > 30.95)) {
    throw new Error('The shape in this file is not in Rwanda (check that it uses longitude/latitude, WGS84).');
  }
  // Keep the editor responsive: thin very dense GPS tracks to ≤ 200 corners.
  if (pts.length > 200) {
    const step = Math.ceil(pts.length / 200);
    pts = pts.filter((_, i) => i % step === 0);
  }
  return pts;
}
