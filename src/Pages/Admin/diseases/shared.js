// Enums mirror dash-api prisma/schema.prisma (DiseaseSeverity, DiseaseCaseStatus, OutbreakStatus).
export const SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const CASE_STATUSES = ['active', 'treated', 'monitoring', 'resolved'];
export const OUTBREAK_STATUSES = ['active', 'contained', 'monitoring', 'resolved'];

export const SEVERITY_TONES = { low: 'slate', medium: 'blue', high: 'amber', critical: 'rose' };
export const CASE_TONES = { active: 'rose', treated: 'blue', monitoring: 'amber', resolved: 'brand' };
export const OUTBREAK_TONES = { active: 'rose', contained: 'amber', monitoring: 'blue', resolved: 'brand' };

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

export const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Trim strings and drop empty values so optional fields aren't sent as "".
export const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      .filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
