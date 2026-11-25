import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Send, Sprout, Tractor, ClipboardList } from 'lucide-react';
import {
  createHarvestingPlanRequest,
  createHarvestRequest,
  listServiceRequestsForAgentPage,
} from '../../services/serviceRequestsService';
import { statusMeta, formatDate } from '../Admin/serviceRequests/helpers';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass, Spinner, EmptyState, ErrorState, Table, Td, Tabs,
} from '../../components/Ui/kit';
import { FarmerPicker, LocationFields } from './agentShared';
import { farmerLocation } from './agentHelpers';

const today = () => new Date().toISOString().slice(0, 10);
const EQUIPMENT = ['Harvesting poles', 'Picking bags', 'Crates', 'Ladders', 'Pruning shears', 'Transport vehicle'];
const MARKETS = ['Local market', 'Export', 'Processing / oil', 'Cooperative collection'];

const emptyPlan = () => ({ plannedHarvestDate: '', estimatedYield: '', farmSize: '', laborRequirement: '', marketTarget: '', priority: 'medium', notes: '' });
const emptyDay = () => ({ harvestDateFrom: '', harvestDateTo: '', treesToHarvest: '', workersNeeded: '', equipmentNeeded: [], priority: 'medium', notes: '' });

/**
 * Agent files a harvesting plan (POST /service-requests/harvesting-plan) or a
 * harvest-day request (POST /service-requests/harvest) on a farmer's behalf.
 * The request is created assigned to the agent; an admin approves it, then the
 * agent starts/completes it from Service History.
 */
export default function HarvestingPlan() {
  const toast = useToast();
  const me = localStorage.getItem('id');

  const [kind, setKind] = useState('plan');
  const [farmer, setFarmer] = useState(null);
  const [location, setLocation] = useState(farmerLocation(null));
  const [plan, setPlan] = useState(emptyPlan);
  const [day, setDay] = useState(emptyDay);
  const [saving, setSaving] = useState(false);

  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);

  const serviceType = kind === 'plan' ? 'harvesting_plan' : 'harvest';
  const loadRecent = useCallback(async () => {
    setRecentLoading(true);
    setRecentError(null);
    try {
      const res = await listServiceRequestsForAgentPage(me, { service_type: serviceType, limit: 5 });
      setRecent(res.data);
    } catch (err) {
      setRecentError(err.message);
    } finally {
      setRecentLoading(false);
    }
  }, [me, serviceType]);
  useEffect(() => { loadRecent(); }, [loadRecent]);

  const pickFarmer = (f) => {
    setFarmer(f);
    setLocation(farmerLocation(f));
    if (f?.farm_size && !plan.farmSize) setPlan((p) => ({ ...p, farmSize: String(f.farm_size) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!farmer) return toast.error('Select the farmer this request is for');
    if (!location.province.trim()) return toast.error('Province is required');
    const loc = Object.fromEntries(Object.entries(location).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()]));
    const farmerInfo = { name: farmer.full_name, phone: farmer.phone || '', email: farmer.email || '' };
    setSaving(true);
    try {
      if (kind === 'plan') {
        if (plan.plannedHarvestDate < today()) throw new Error('Planned harvest date cannot be in the past');
        await createHarvestingPlanRequest({
          farmer_id: farmer.id,
          farmerInfo,
          location: loc,
          plannedHarvestDate: plan.plannedHarvestDate,
          estimatedYield: `${plan.estimatedYield} kg`,
          farmSize: `${plan.farmSize} ha`,
          laborRequirement: `${plan.laborRequirement} workers`,
          marketTarget: plan.marketTarget,
          priority: plan.priority,
          notes: plan.notes.trim(),
        });
        setPlan(emptyPlan());
      } else {
        if (day.harvestDateTo < day.harvestDateFrom) throw new Error('End date must be on or after the start date');
        await createHarvestRequest({
          farmer_id: farmer.id,
          location: loc,
          harvestDateFrom: day.harvestDateFrom,
          harvestDateTo: day.harvestDateTo,
          treesToHarvest: parseInt(day.treesToHarvest, 10),
          workersNeeded: parseInt(day.workersNeeded, 10),
          equipmentNeeded: day.equipmentNeeded,
          priority: day.priority,
          notes: day.notes.trim(),
        });
        setDay(emptyDay());
      }
      toast.success(`Request filed for ${farmer.full_name}. It is now waiting for admin approval.`);
      loadRecent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEquipment = (item) =>
    setDay((d) => ({ ...d, equipmentNeeded: d.equipmentNeeded.includes(item) ? d.equipmentNeeded.filter((x) => x !== item) : [...d.equipmentNeeded, item] }));

  const priorityField = (value, onChange) => (
    <Field label="Priority">
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
      </select>
    </Field>
  );

  return (
    <Page>
      <PageHeader
        icon={CalendarDays}
        title="Schedule harvesting"
        subtitle="File a harvesting plan or a harvest-day request on behalf of a farmer."
        actions={<Link to="/dashboard/agent/ServiceHistory"><Button variant="secondary" icon={ClipboardList}>My service requests</Button></Link>}
      />

      <Tabs
        tabs={[{ id: 'plan', label: 'Harvesting plan', icon: Sprout }, { id: 'day', label: 'Harvest day', icon: Tractor }]}
        value={kind}
        onChange={setKind}
      />

      <form onSubmit={submit} className="space-y-6">
        <Card title="Farmer" subtitle="Location is pre-filled from the farmer's profile — correct it if needed.">
          <div className="space-y-4">
            <FarmerPicker value={farmer} onChange={pickFarmer} required />
            <LocationFields value={location} onChange={setLocation} />
          </div>
        </Card>

        {kind === 'plan' ? (
          <Card title="Harvesting plan">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Planned harvest date" required>
                <input type="date" min={today()} className={inputClass} value={plan.plannedHarvestDate} onChange={(e) => setPlan({ ...plan, plannedHarvestDate: e.target.value })} required />
              </Field>
              <Field label="Estimated yield (kg)" required>
                <input type="number" min="1" className={inputClass} value={plan.estimatedYield} onChange={(e) => setPlan({ ...plan, estimatedYield: e.target.value })} required />
              </Field>
              <Field label="Farm size (ha)" required>
                <input type="number" min="0.01" step="0.01" className={inputClass} value={plan.farmSize} onChange={(e) => setPlan({ ...plan, farmSize: e.target.value })} required />
              </Field>
              <Field label="Workers needed" required>
                <input type="number" min="1" className={inputClass} value={plan.laborRequirement} onChange={(e) => setPlan({ ...plan, laborRequirement: e.target.value })} required />
              </Field>
              <Field label="Market target" required>
                <select className={inputClass} value={plan.marketTarget} onChange={(e) => setPlan({ ...plan, marketTarget: e.target.value })} required>
                  <option value="">Select…</option>
                  {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              {priorityField(plan.priority, (v) => setPlan({ ...plan, priority: v }))}
              <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
                <textarea className={textareaClass} value={plan.notes} onChange={(e) => setPlan({ ...plan, notes: e.target.value })} />
              </Field>
            </div>
          </Card>
        ) : (
          <Card title="Harvest day">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Harvest from" required>
                <input type="date" min={today()} className={inputClass} value={day.harvestDateFrom} onChange={(e) => setDay({ ...day, harvestDateFrom: e.target.value })} required />
              </Field>
              <Field label="Harvest to" required>
                <input type="date" min={day.harvestDateFrom || today()} className={inputClass} value={day.harvestDateTo} onChange={(e) => setDay({ ...day, harvestDateTo: e.target.value })} required />
              </Field>
              {priorityField(day.priority, (v) => setDay({ ...day, priority: v }))}
              <Field label="Trees to harvest" required>
                <input type="number" min="1" className={inputClass} value={day.treesToHarvest} onChange={(e) => setDay({ ...day, treesToHarvest: e.target.value })} required />
              </Field>
              <Field label="Workers needed" required>
                <input type="number" min="1" className={inputClass} value={day.workersNeeded} onChange={(e) => setDay({ ...day, workersNeeded: e.target.value })} required />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="mb-2 text-sm font-medium text-slate-700">Equipment needed</p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map((item) => (
                    <label key={item} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm ring-1 ring-inset ${day.equipmentNeeded.includes(item) ? 'bg-brand-50 text-brand-700 ring-brand-300' : 'bg-white text-slate-700 ring-slate-300'}`}>
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" checked={day.equipmentNeeded.includes(item)} onChange={() => toggleEquipment(item)} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
                <textarea className={textareaClass} value={day.notes} onChange={(e) => setDay({ ...day, notes: e.target.value })} />
              </Field>
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" icon={Send} loading={saving}>Submit request</Button>
        </div>
      </form>

      <Card title={kind === 'plan' ? 'Recent harvesting plans you filed' : 'Recent harvest-day requests you filed'} padded={false}>
        {recentLoading ? <Spinner /> : recentError ? <ErrorState message={recentError} onRetry={loadRecent} /> : recent.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nothing filed yet" description="Requests you submit appear here." />
        ) : (
          <Table head={['Request', 'Location', 'Status', 'Filed']}>
            {recent.map((r) => {
              const st = statusMeta(r.status);
              return (
                <tr key={r.id}>
                  <Td className="font-medium text-slate-900">{r.request_number}</Td>
                  <Td>{[r.location?.sector, r.location?.district].filter(Boolean).join(', ') || r.location?.province || '—'}</Td>
                  <Td><Badge tone={st.tone}>{st.label}</Badge></Td>
                  <Td>{formatDate(r.created_at)}</Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </Page>
  );
}
