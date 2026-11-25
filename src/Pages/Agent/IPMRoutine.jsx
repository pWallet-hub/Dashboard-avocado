import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bug, Send, ClipboardList } from 'lucide-react';
import { createIPMRoutineRequest, listServiceRequestsForAgentPage } from '../../services/serviceRequestsService';
import { statusMeta, formatDate } from '../Admin/serviceRequests/helpers';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, Badge, Button, Field, inputClass, textareaClass, Spinner, EmptyState, ErrorState, Table, Td,
} from '../../components/Ui/kit';
import { FarmerPicker, LocationFields } from './agentShared';
import { farmerLocation } from './agentHelpers';

// Common avocado pests and diseases in Rwanda (reference list for the routine form)
const PESTS = [
  'Fruit fly', 'Seed weevil', 'Avocado seed moth', 'Avocado lace bug', 'Leaf miner', 'Thrips', 'Loopers / caterpillars',
  'Whiteflies', 'Shot hole borer', 'Bark beetle', 'Stem borer', 'Persea mite', 'Avocado brown mite', 'Root weevil',
  'Root mealybugs', 'Termites', 'Snails & slugs', 'Rodents', 'Birds',
];
const DISEASES = [
  'Phytophthora root rot', 'Anthracnose', 'Stem-end rot', 'Cercospora spot', 'Scab', 'Botryosphaeria dieback',
  'Powdery mildew', 'Armillaria root rot', 'Bacterial canker', 'Sunblotch',
];
const METHODS = ['Monitoring & scouting', 'Cultural control', 'Mechanical / traps', 'Biological control', 'Chemical (targeted)', 'Orchard sanitation', 'Pruning'];

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({
  scheduledDate: '', followUpDate: '', farmSize: '', targetArea: '', laborRequired: '', severity: 'medium',
  pestType: [], ipmMethod: [], chemicalsNeeded: '', equipmentNeeded: '', preventiveMeasures: '', specialInstructions: '', notes: '',
});
const splitList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

const Chips = ({ options, value, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const on = value.includes(o);
      return (
        <button
          key={o}
          type="button"
          aria-pressed={on}
          onClick={() => onToggle(o)}
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${on ? 'bg-brand-50 text-brand-700 ring-brand-300' : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'}`}
        >
          {o}
        </button>
      );
    })}
  </div>
);

/**
 * Agent schedules an IPM (integrated pest management) routine for a farmer via
 * POST /service-requests/ipm-routine. On admin approval the backend generates
 * the IPM form PDF as a document for the farmer.
 */
export default function IPMRoutine() {
  const toast = useToast();
  const me = localStorage.getItem('id');
  const [farmer, setFarmer] = useState(null);
  const [location, setLocation] = useState(farmerLocation(null));
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState(null);

  const loadRecent = useCallback(async () => {
    setRecentLoading(true);
    setRecentError(null);
    try {
      setRecent((await listServiceRequestsForAgentPage(me, { service_type: 'ipm_routine', limit: 5 })).data);
    } catch (err) {
      setRecentError(err.message);
    } finally {
      setRecentLoading(false);
    }
  }, [me]);
  useEffect(() => { loadRecent(); }, [loadRecent]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) => setForm((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));
  const pickFarmer = (f) => {
    setFarmer(f);
    setLocation(farmerLocation(f));
    if (f?.farm_size && !form.farmSize) set('farmSize', String(f.farm_size));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!farmer) return toast.error('Select the farmer this routine is for');
    if (form.pestType.length === 0) return toast.error('Select at least one pest or disease');
    if (form.ipmMethod.length === 0) return toast.error('Select at least one IPM method');
    if (form.followUpDate && form.followUpDate < form.scheduledDate) return toast.error('Follow-up must be after the scheduled date');
    setSaving(true);
    try {
      const loc = Object.fromEntries(Object.entries(location).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v.trim()]));
      await createIPMRoutineRequest({
        farmer_id: farmer.id,
        farmerInfo: { name: farmer.full_name, phone: farmer.phone || '', email: farmer.email || '' },
        location: loc,
        scheduledDate: form.scheduledDate,
        followUpDate: form.followUpDate || undefined,
        farmSize: form.farmSize,
        targetArea: `${form.targetArea} ha`,
        laborRequired: `${form.laborRequired} workers`,
        severity: form.severity,
        pestType: form.pestType,
        ipmMethod: form.ipmMethod,
        chemicalsNeeded: splitList(form.chemicalsNeeded),
        equipmentNeeded: splitList(form.equipmentNeeded),
        preventiveMeasures: form.preventiveMeasures.trim(),
        specialInstructions: form.specialInstructions.trim(),
        notes: form.notes.trim(),
      });
      toast.success(`IPM routine filed for ${farmer.full_name}. It is now waiting for admin approval.`);
      setForm(emptyForm());
      loadRecent();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page>
      <PageHeader
        icon={Bug}
        title="Schedule IPM routine"
        subtitle="Plan an integrated pest management routine for a farmer. Once approved, the IPM form is added to the farmer's documents."
        actions={<Link to="/dashboard/agent/ServiceHistory"><Button variant="secondary" icon={ClipboardList}>My service requests</Button></Link>}
      />

      <form onSubmit={submit} className="space-y-6">
        <Card title="Farmer" subtitle="Location is pre-filled from the farmer's profile — correct it if needed.">
          <div className="space-y-4">
            <FarmerPicker value={farmer} onChange={pickFarmer} required />
            <LocationFields value={location} onChange={setLocation} />
          </div>
        </Card>

        <Card title="Pests & diseases targeted" subtitle="Select everything observed on the farm.">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Pests</p>
              <Chips options={PESTS} value={form.pestType} onToggle={(v) => toggle('pestType', v)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Diseases</p>
              <Chips options={DISEASES} value={form.pestType} onToggle={(v) => toggle('pestType', v)} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">IPM methods <span className="text-rose-600">*</span></p>
              <Chips options={METHODS} value={form.ipmMethod} onToggle={(v) => toggle('ipmMethod', v)} />
            </div>
          </div>
        </Card>

        <Card title="Routine details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Scheduled date" required>
              <input type="date" min={today()} className={inputClass} value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} required />
            </Field>
            <Field label="Follow-up date">
              <input type="date" min={form.scheduledDate || today()} className={inputClass} value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} />
            </Field>
            <Field label="Severity">
              <select className={inputClass} value={form.severity} onChange={(e) => set('severity', e.target.value)}>
                {['low', 'medium', 'high', 'urgent'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Farm size (ha)" required>
              <input type="number" min="0.01" step="0.01" className={inputClass} value={form.farmSize} onChange={(e) => set('farmSize', e.target.value)} required />
            </Field>
            <Field label="Area to treat (ha)" required>
              <input type="number" min="0.01" step="0.01" className={inputClass} value={form.targetArea} onChange={(e) => set('targetArea', e.target.value)} required />
            </Field>
            <Field label="Workers needed" required>
              <input type="number" min="1" className={inputClass} value={form.laborRequired} onChange={(e) => set('laborRequired', e.target.value)} required />
            </Field>
            <Field label="Chemicals needed" hint="Comma separated" className="sm:col-span-2 lg:col-span-1">
              <input className={inputClass} value={form.chemicalsNeeded} onChange={(e) => set('chemicalsNeeded', e.target.value)} placeholder="e.g. Copper oxychloride" />
            </Field>
            <Field label="Equipment needed" hint="Comma separated" className="sm:col-span-2">
              <input className={inputClass} value={form.equipmentNeeded} onChange={(e) => set('equipmentNeeded', e.target.value)} placeholder="e.g. Knapsack sprayer, PPE" />
            </Field>
            <Field label="Preventive measures" className="sm:col-span-2 lg:col-span-3">
              <textarea className={textareaClass} value={form.preventiveMeasures} onChange={(e) => set('preventiveMeasures', e.target.value)} />
            </Field>
            <Field label="Special instructions" className="sm:col-span-2 lg:col-span-3">
              <textarea className={textareaClass} value={form.specialInstructions} onChange={(e) => set('specialInstructions', e.target.value)} />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" icon={Send} loading={saving}>Submit routine</Button>
        </div>
      </form>

      <Card title="Recent IPM routines you filed" padded={false}>
        {recentLoading ? <Spinner /> : recentError ? <ErrorState message={recentError} onRetry={loadRecent} /> : recent.length === 0 ? (
          <EmptyState icon={Bug} title="Nothing filed yet" description="Routines you submit appear here." />
        ) : (
          <Table head={['Request', 'Targets', 'Scheduled', 'Status']}>
            {recent.map((r) => {
              const st = statusMeta(r.status);
              const d = r.ipm_routine_details || {};
              return (
                <tr key={r.id}>
                  <Td className="font-medium text-slate-900">{r.request_number}</Td>
                  <Td className="max-w-xs truncate">{Array.isArray(d.pestType) ? d.pestType.join(', ') : '—'}</Td>
                  <Td>{formatDate(d.scheduledDate)}</Td>
                  <Td><Badge tone={st.tone}>{st.label}</Badge></Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </Page>
  );
}
