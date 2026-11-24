/**
 * Small helpers shared by the farmer pages (labels, formatting, current user).
 */

export const SERVICE_TYPE_LABELS = {
  harvest: 'Harvesting day',
  pest_control: 'Pest management (IPM)',
  other: 'Property evaluation',
  harvesting_plan: 'Harvesting plan',
  ipm_routine: 'IPM routine',
  planting: 'Planting',
  maintenance: 'Maintenance',
  consultation: 'Consultation',
};

export const serviceTypeLabel = (type) => SERVICE_TYPE_LABELS[type] || (type ? String(type).replace(/_/g, ' ') : 'Service');

export const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending', tone: 'amber' },
  { value: 'approved', label: 'Approved', tone: 'blue' },
  { value: 'assigned', label: 'Agent assigned', tone: 'blue' },
  { value: 'in_progress', label: 'In progress', tone: 'blue' },
  { value: 'completed', label: 'Completed', tone: 'brand' },
  { value: 'rejected', label: 'Rejected', tone: 'rose' },
  { value: 'cancelled', label: 'Cancelled', tone: 'slate' },
];

export const requestStatusMeta = (status) =>
  REQUEST_STATUSES.find((s) => s.value === status) || { value: status, label: status || 'Unknown', tone: 'slate' };

export const formatDate = (value, withTime = false) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
};

export const rwf = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '—' : `${Math.round(Number(n)).toLocaleString()} RWF`);

/** YYYY-MM-DD for a date `offset` days from today (local time). */
export const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

/** Add days to a YYYY-MM-DD string, returning YYYY-MM-DD. */
export const addDays = (dateString, days) => {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/** Logged-in user from localStorage (set at login/register). */
export const currentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const currentUserId = () => currentUser()?.id || localStorage.getItem('id') || null;

/** Farm location (falls back to residence) from a farmer_profile record. */
export const farmLocationFromProfile = (p) => ({
  province: p?.farm_province || p?.province || '',
  district: p?.farm_district || p?.district || '',
  sector: p?.farm_sector || p?.sector || '',
  cell: p?.farm_cell || p?.cell || '',
  village: p?.farm_village || p?.village || '',
});

export const formatLocation = (loc) => {
  if (!loc || typeof loc !== 'object') return '—';
  const parts = [loc.farm_name, loc.village, loc.cell, loc.sector, loc.district, loc.province].filter(
    (v) => v && v !== 'N/A' && v !== 'Unknown'
  );
  return parts.length ? parts.join(', ') : '—';
};

export const errMsg = (e, fallback = 'Something went wrong') => e?.response?.data?.message || e?.message || fallback;
