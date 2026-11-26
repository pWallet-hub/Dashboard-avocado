/**
 * Rwanda's official administrative divisions (province → district → sector →
 * cell → village) from the `rwanda` npm package (knowbee/rwanda, pinned 3.0.2:
 * 5 provinces, 30 districts, 416 sectors, 2,148 cells, 14,837 villages).
 *
 * The package (~250 KB) is loaded on demand the first time a picker needs it.
 * It names provinces 'East' | 'Kigali' | …; the app uses 'Eastern Province' |
 * 'Kigali City' | …, so we translate. Two package quirks are handled here:
 * Sectors() returns the whole province's sectors (we keep the district's own),
 * and an unknown name throws instead of returning nothing.
 */
import { RWANDA_DISTRICTS, RWANDA_PROVINCES } from './rwanda';

const TO_PKG = {
  'Kigali City': 'Kigali',
  'Eastern Province': 'East',
  'Northern Province': 'North',
  'Southern Province': 'South',
  'Western Province': 'West',
};

let modPromise = null;
/** Resolve the package once (code-split chunk). */
export const loadRwanda = () => {
  if (!modPromise) modPromise = import('rwanda');
  return modPromise;
};

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/[^a-z]/g, '');
const safe = (fn) => {
  try {
    return fn() || [];
  } catch {
    return [];
  }
};

export const provinceOfDistrict = (district) =>
  RWANDA_PROVINCES.find((p) => RWANDA_DISTRICTS[p].some((d) => norm(d) === norm(district))) || '';

/** Official spelling of a district (or '' if unknown). */
export const canonicalDistrict = (district) =>
  RWANDA_PROVINCES.flatMap((p) => RWANDA_DISTRICTS[p]).find((d) => norm(d) === norm(district)) || '';

/** Match a free-typed name against a list, ignoring case and punctuation. */
export const matchName = (list, value) => list.find((x) => norm(x) === norm(value)) || '';

/** Synchronous lookups once the module is loaded (`rw` = the loaded module). */
export function makeLookups(rw) {
  const area = (district) => {
    const d = canonicalDistrict(district);
    return d ? { province: TO_PKG[provinceOfDistrict(d)], district: d } : null;
  };
  const cells = (district, sector) => {
    const a = area(district);
    return a && sector ? [...safe(() => rw.Cells({ ...a, sector }))].sort() : [];
  };
  return {
    districts: (province) => (province ? RWANDA_DISTRICTS[province] || [] : Object.values(RWANDA_DISTRICTS).flat()).slice().sort(),
    sectors: (district) => {
      const a = area(district);
      if (!a) return [];
      return [...new Set(safe(() => rw.Sectors(a)))].filter((s) => cells(district, s).length > 0).sort();
    },
    cells,
    villages: (district, sector, cell) => {
      const a = area(district);
      return a && sector && cell ? [...safe(() => rw.Villages({ ...a, sector, cell }))].sort() : [];
    },
  };
}

/** Human label for a VBA area: 'All of Eastern Province', 'Musha sector, Rwamagana', … */
const AREA_LEVELS = ['village', 'cell', 'sector', 'district', 'province'];
export const describeArea = (a) => {
  if (!a) return '';
  if (typeof a === 'string') return a;
  const deepest = AREA_LEVELS.find((l) => a[l]);
  const parts = [a.village, a.cell, a.sector && `${a.sector} sector`, a.district, !a.district && a.province].filter(Boolean);
  return deepest === 'province' ? `All of ${a.province}` : parts.join(', ');
};

