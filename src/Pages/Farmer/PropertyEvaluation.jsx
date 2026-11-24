import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import {
  createPropertyEvaluationRequest,
  updatePropertyEvaluationRequest,
  getPropertyEvaluationRequestById,
} from '../../services/serviceRequestsService';
import { getFarmerInformation } from '../../services/farmer-information';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Button, Field, inputClass, textareaClass, Spinner, ErrorState, EmptyState } from '../../components/Ui/kit';
import { RequestSubmitted } from './FarmerBits';
import { isoDay, addDays, farmLocationFromProfile, formatDate, errMsg } from './farmerShared';

const SOIL_TYPES = ['Loam', 'Clay', 'Sandy', 'Volcanic', 'Silt', "Don't know"];
const IRRIGATION = ['None (rain-fed)', 'Drip irrigation', 'Sprinkler', 'Furrow', 'Manual watering'];
const WATER = ['River / stream nearby', 'Borehole / well', 'Piped water', 'Rainwater harvesting', 'No reliable water'];

const emptyForm = {
  irrigationSource: '',
  irrigationTiming: '',
  soilTesting: '',
  visitStartDate: '',
  visitEndDate: '',
  certifiedValuationRequested: false,
  evaluationPurpose: '',
  farmSize: '',
  cropTypes: '',
  currentIrrigationSystem: '',
  soilType: '',
  waterAccess: '',
  priority: 'medium',
  notes: '',
  location: { province: '', district: '', sector: '', cell: '', village: '', farm_name: '' },
};

const toDay = (v) => (v ? String(v).slice(0, 10) : '');

/** Book a property evaluation. `?edit=<requestId>` edits a pending request. */
export default function PropertyEvaluation() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');

  const [form, setForm] = useState(emptyForm);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(Boolean(editId));
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const loadExisting = useCallback(async () => {
    if (!editId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const r = await getPropertyEvaluationRequestById(editId);
      const d = r?.pest_management_details || {};
      const pd = d.property_details || {};
      const next = {
        ...emptyForm,
        irrigationSource: d.irrigation_source || '',
        irrigationTiming: d.irrigation_timing || '',
        soilTesting: d.soil_testing || '',
        visitStartDate: toDay(d.visit_start_date),
        visitEndDate: toDay(d.visit_end_date),
        certifiedValuationRequested: Boolean(d.certified_valuation_requested),
        evaluationPurpose: d.evaluation_purpose || '',
        farmSize: pd.farm_size ?? '',
        cropTypes: pd.crop_types || '',
        currentIrrigationSystem: pd.current_irrigation_system || '',
        soilType: pd.soil_type || '',
        waterAccess: pd.water_access || '',
        priority: r?.priority || 'medium',
        notes: r?.notes || '',
        location: { ...emptyForm.location, ...(r?.location || {}) },
      };
      setForm(next);
      setOriginal({ ...next, status: r?.status, request_number: r?.request_number });
    } catch (e) {
      setLoadError(errMsg(e, 'Failed to load request'));
    } finally {
      setLoading(false);
    }
  }, [editId]);

  useEffect(() => {
    if (editId) {
      loadExisting();
      return;
    }
    getFarmerInformation()
      .then((res) => {
        const fp = (res?.data || res)?.farmer_profile;
        const loc = farmLocationFromProfile(fp);
        setForm((f) => ({
          ...f,
          farmSize: f.farmSize || (fp?.farm_size ?? ''),
          location: { ...f.location, ...Object.fromEntries(Object.entries(loc).filter(([, v]) => v)) },
        }));
      })
      .catch(() => {});
  }, [editId, loadExisting]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setLoc = (k, v) => {
    setForm((f) => ({ ...f, location: { ...f.location, [k]: v } }));
    setErrors((e) => ({ ...e, province: undefined }));
  };

  const datesChanged = !original || original.visitStartDate !== form.visitStartDate;

  const validate = () => {
    const e = {};
    if (!form.irrigationSource) e.irrigationSource = 'Please answer this question';
    if (form.irrigationSource === 'Yes' && !form.irrigationTiming) e.irrigationTiming = 'Choose when you want to upgrade';
    if (!form.visitStartDate) e.visitStartDate = 'Choose the week for the visit';
    else if (datesChanged && form.visitStartDate < isoDay(1)) e.visitStartDate = 'The visit week must start from tomorrow';
    if (form.certifiedValuationRequested && !form.evaluationPurpose.trim()) e.evaluationPurpose = 'Tell us what the certified valuation is for';
    if (form.farmSize !== '' && (Number.isNaN(Number(form.farmSize)) || Number(form.farmSize) <= 0)) e.farmSize = 'Enter a positive number';
    if (!form.location.province?.trim()) e.province = 'Province is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      irrigationTiming: form.irrigationSource === 'Yes' ? form.irrigationTiming : undefined,
      farmSize: form.farmSize === '' ? undefined : Number(form.farmSize),
      evaluationPurpose: form.evaluationPurpose.trim() || 'Property evaluation',
      notes: form.notes.trim(),
    };
    try {
      if (editId) {
        if (!datesChanged) {
          delete payload.visitStartDate;
          delete payload.visitEndDate;
        }
        await updatePropertyEvaluationRequest(editId, payload);
        toast.success('Request updated');
        navigate('/dashboard/farmer/my-service-requests');
      } else {
        const created = await createPropertyEvaluationRequest(payload);
        setSubmitted(created || {});
        toast.success('Property evaluation request submitted');
      }
    } catch (e) {
      toast.error(errMsg(e, 'Failed to save request'));
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>;
  const title = editId ? 'Edit Property Evaluation Request' : 'Book your Property Evaluation Day';

  if (editId && (loading || loadError || (original && original.status !== 'pending'))) {
    return (
      <Page>
        <PageHeader icon={MapPin} title={title} />
        <Card>
          {loading ? (
            <Spinner />
          ) : loadError ? (
            <ErrorState message={loadError} onRetry={loadExisting} />
          ) : (
            <EmptyState
              icon={MapPin}
              title="This request can no longer be edited"
              description="Only pending requests can be changed."
              action={<Link to="/dashboard/farmer/my-service-requests" className="text-sm font-medium text-brand-700 hover:underline">Back to my requests</Link>}
            />
          )}
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        icon={MapPin}
        title={title}
        subtitle={
          editId
            ? `Request ${original?.request_number || ''}`
            : 'A property specialist visits your farm to assess land, soil and water — and can issue a certified valuation for banks and MFIs.'
        }
        actions={
          editId && (
            <Link to="/dashboard/farmer/my-service-requests" className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
              Back to my requests
            </Link>
          )
        }
      />
      {submitted ? (
        <RequestSubmitted title="Property evaluation requested" request={submitted} onAnother={() => { setForm(emptyForm); setSubmitted(null); }}>
          A specialist will visit during the week of {formatDate(form.visitStartDate)} – {formatDate(form.visitEndDate)}. You will be notified once the visit is confirmed.
        </RequestSubmitted>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title="Evaluation">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Do you want to upgrade your farm's water irrigation?" required>
                    <select className={inputClass} value={form.irrigationSource} onChange={(e) => set('irrigationSource', e.target.value)}>
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {err('irrigationSource')}
                  </Field>
                  {form.irrigationSource === 'Yes' && (
                    <Field label="When would you like to upgrade?" required>
                      <select className={inputClass} value={form.irrigationTiming} onChange={(e) => set('irrigationTiming', e.target.value)}>
                        <option value="">Select timing</option>
                        <option value="This Coming Season">This coming season</option>
                        <option value="Next Year">Next year</option>
                      </select>
                      {err('irrigationTiming')}
                    </Field>
                  )}
                  <Field label="Have you done any soil testing?">
                    <select className={inputClass} value={form.soilTesting} onChange={(e) => set('soilTesting', e.target.value)}>
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </Field>
                  <Field label="Visit week starts" required hint={form.visitEndDate ? `The specialist visits between ${formatDate(form.visitStartDate)} and ${formatDate(form.visitEndDate)} (5 days).` : 'Pick the first day of a 5-day window.'}>
                    <input
                      type="date"
                      min={isoDay(1)}
                      className={inputClass}
                      value={form.visitStartDate}
                      onChange={(e) => {
                        const v = e.target.value;
                        setForm((f) => ({ ...f, visitStartDate: v, visitEndDate: v ? addDays(v, 4) : '' }));
                        setErrors((x) => ({ ...x, visitStartDate: undefined }));
                      }}
                    />
                    {err('visitStartDate')}
                  </Field>
                </div>
                <label className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={form.certifiedValuationRequested} onChange={(e) => set('certifiedValuationRequested', e.target.checked)} />
                  <span>
                    <span className="font-medium text-slate-900">Send me a Certified Property Valuation document</span>
                    <span className="block text-slate-500">Stamped by ASR and an accredited property valuer, accepted by banks and MFIs.</span>
                  </span>
                </label>
                {form.certifiedValuationRequested && (
                  <Field label="What is the valuation for?" required className="mt-4">
                    <input className={inputClass} value={form.evaluationPurpose} onChange={(e) => set('evaluationPurpose', e.target.value)} placeholder="e.g. bank loan, insurance" />
                    {err('evaluationPurpose')}
                  </Field>
                )}
              </Card>

              <Card title="About your farm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Farm size (hectares)">
                    <input type="number" min="0" step="0.1" className={inputClass} value={form.farmSize} onChange={(e) => set('farmSize', e.target.value)} />
                    {err('farmSize')}
                  </Field>
                  <Field label="Current crops">
                    <input className={inputClass} value={form.cropTypes} onChange={(e) => set('cropTypes', e.target.value)} placeholder="e.g. Hass avocado, beans" />
                  </Field>
                  <Field label="Current irrigation">
                    <select className={inputClass} value={form.currentIrrigationSystem} onChange={(e) => set('currentIrrigationSystem', e.target.value)}>
                      <option value="">Select</option>
                      {IRRIGATION.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </Field>
                  <Field label="Soil type">
                    <select className={inputClass} value={form.soilType} onChange={(e) => set('soilType', e.target.value)}>
                      <option value="">Select</option>
                      {SOIL_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </Field>
                  <Field label="Water access">
                    <select className={inputClass} value={form.waterAccess} onChange={(e) => set('waterAccess', e.target.value)}>
                      <option value="">Select</option>
                      {WATER.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </Field>
                  <Field label="Priority">
                    <select className={inputClass} value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </Field>
                  <Field label="Notes" className="sm:col-span-2">
                    <textarea className={textareaClass} maxLength={1000} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Directions to the farm, best time to call, …" />
                  </Field>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Property location" subtitle="Pre-filled from your profile.">
                <div className="space-y-3">
                  <Field label="Farm name">
                    <input className={inputClass} value={form.location.farm_name || ''} onChange={(e) => setLoc('farm_name', e.target.value)} />
                  </Field>
                  {['province', 'district', 'sector', 'cell', 'village'].map((k) => (
                    <Field key={k} label={k[0].toUpperCase() + k.slice(1)} required={k === 'province'}>
                      <input className={inputClass} value={form.location[k] || ''} onChange={(e) => setLoc(k, e.target.value)} />
                      {k === 'province' && err('province')}
                    </Field>
                  ))}
                </div>
              </Card>
              <Button type="submit" loading={saving} className="w-full">{editId ? 'Save changes' : 'Submit request'}</Button>
            </div>
          </div>
        </form>
      )}
    </Page>
  );
}
