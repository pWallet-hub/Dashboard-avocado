// Shared constants/helpers for the admin Service Requests page.

export const SERVICE_TYPES = [
  { id: 'harvest', label: 'Harvesting day' },
  { id: 'pest_control', label: 'Pest management' },
  { id: 'property_evaluation', label: 'Property evaluation' },
  { id: 'harvesting_plan', label: 'Harvesting plan' },
  { id: 'ipm_routine', label: 'IPM routine' },
];

export const typeLabel = (id) => SERVICE_TYPES.find((t) => t.id === id)?.label || id;

// Backend ServiceStatus enum (dash-api prisma/schema.prisma).
export const STATUSES = [
  { id: 'pending', label: 'Pending', tone: 'amber' },
  { id: 'approved', label: 'Approved', tone: 'brand' },
  { id: 'assigned', label: 'Assigned', tone: 'blue' },
  { id: 'in_progress', label: 'In progress', tone: 'blue' },
  { id: 'completed', label: 'Completed', tone: 'slate' },
  { id: 'rejected', label: 'Rejected', tone: 'rose' },
  { id: 'cancelled', label: 'Cancelled', tone: 'slate' },
];

export const statusMeta = (s) => STATUSES.find((x) => x.id === s) || { id: s, label: s || 'Unknown', tone: 'slate' };

export const PRIORITY_TONES = { low: 'slate', medium: 'blue', high: 'amber', urgent: 'rose' };

/**
 * Which admin actions are valid for a request, mirroring the backend guards in
 * dash-api/src/routes/serviceRequests.ts:
 *  - approve: pending only (the backend doesn't check, but re-approving makes no sense)
 *  - reject: pending | approved
 *  - assign: anything not completed/cancelled/rejected
 *  - start: approved | assigned
 *  - complete: approved | assigned | in_progress
 *  - schedule/reschedule visit: property evaluations that are approved/assigned/in progress
 *  - cancel: anything not completed/cancelled
 */
export function allowedActions(req) {
  const s = req?.status;
  const open = !['completed', 'cancelled', 'rejected'].includes(s);
  return {
    approve: s === 'pending',
    reject: s === 'pending' || s === 'approved',
    assign: open,
    start: s === 'approved' || s === 'assigned',
    complete: ['approved', 'assigned', 'in_progress'].includes(s),
    reschedule: req?.service_type === 'other' && ['approved', 'assigned', 'in_progress'].includes(s),
    cancel: s !== 'completed' && s !== 'cancelled',
  };
}

// Backend stores property evaluations as service_type "other"; map to the UI key.
export const uiType = (serviceType) => (serviceType === 'other' ? 'property_evaluation' : serviceType);

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatLocation = (loc) => {
  if (!loc || typeof loc !== 'object') return '—';
  const parts = [loc.farm_name, loc.village, loc.cell, loc.sector, loc.district, loc.province].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

const list = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'object' ? x?.name : x)).filter(Boolean).join(', ') : v);

/** [label, value] pairs describing the type-specific details of a request. */
export function detailRows(req) {
  const h = req?.harvest_details || {};
  const p = req?.pest_management_details || {};
  const hp = req?.harvesting_plan_details || {};
  const ipm = req?.ipm_routine_details || {};
  switch (req?.service_type) {
    case 'harvest':
      return [
        ['Workers needed', h.workers_needed ?? h.workersNeeded],
        ['Trees to harvest', h.trees_to_harvest ?? h.treesToHarvest],
        ['Harvest window', `${formatDate(h.harvest_date_from ?? h.harvestDateFrom)} – ${formatDate(h.harvest_date_to ?? h.harvestDateTo)}`],
        ['Equipment', list(h.equipment_needed ?? h.equipmentNeeded)],
        ['Approved workers', h.approved_workers],
        ['Actual workers used', h.actual_workers_used],
        ['Actual harvest amount', h.actual_harvest_amount],
      ];
    case 'pest_control':
      return [
        ['Pests / diseases', list(p.pests_diseases)],
        ['Severity', p.severity_level],
        ['First noticed', p.first_noticed],
        ['Damage details', p.damage_details],
        ['Control methods tried', p.control_methods_tried],
        ['Treatment applied', p.treatment_applied],
      ];
    case 'other':
      // Property evaluations keep their details in pest_management_details (backend quirk).
      return [
        ['Evaluation purpose', p.evaluation_purpose],
        ['Irrigation source', p.irrigation_source],
        ['Irrigation timing', p.irrigation_timing],
        ['Soil testing', p.soil_testing === undefined ? null : p.soil_testing ? 'Yes' : 'No'],
        ['Visit window', p.visit_start_date ? `${formatDate(p.visit_start_date)} – ${formatDate(p.visit_end_date)}` : null],
        ['Farm visit', req?.visit_details?.visit_date ? `${formatDate(req.visit_details.visit_date)}${req.visit_details.visit_time ? ` at ${req.visit_details.visit_time}` : ''}` : null],
      ];
    case 'harvesting_plan':
      return [
        ['Planned harvest date', formatDateOrNull(hp.plannedHarvestDate ?? hp.planned_harvest_date)],
        ['Estimated yield', hp.estimatedYield ?? hp.estimated_yield],
        ['Farm size', hp.farmSize ?? hp.farm_size],
        ['Labour requirement', hp.laborRequirement ?? hp.labor_requirement],
        ['Market target', hp.marketTarget ?? hp.market_target],
        ['Actual yield', hp.actual_yield],
      ];
    case 'ipm_routine':
      return [
        ['Scheduled date', formatDateOrNull(ipm.scheduledDate ?? ipm.scheduled_date)],
        ['Farm size', ipm.farmSize ?? ipm.farm_size],
        ['Target area', ipm.targetArea ?? ipm.target_area],
        ['Pest types', list(ipm.pestType ?? ipm.pest_type)],
        ['IPM methods', list(ipm.ipmMethod ?? ipm.ipm_method)],
        ['Labour required', ipm.laborRequired ?? ipm.labor_required],
        ['Treatment outcome', ipm.treatment_outcome],
      ];
    default:
      return [];
  }
}

function formatDateOrNull(v) {
  return v ? formatDate(v) : null;
}
