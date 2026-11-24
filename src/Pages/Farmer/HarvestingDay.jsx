import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { createHarvestRequest } from '../../services/serviceRequestsService';
import { getFarmerInformation } from '../../services/farmer-information';
import { uploadMultiple } from '../../services/uploadService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Button, Field, inputClass, textareaClass } from '../../components/Ui/kit';
import { PhotoPicker, RequestSubmitted, uploadPhotos } from './FarmerBits';
import { isoDay, addDays, farmLocationFromProfile, formatDate, errMsg } from './farmerShared';

const EQUIPMENT = ['Harvest clippers', 'Picking poles', 'Plastic crates', 'Ladders', 'Picking bags'];

const emptyForm = (loc = {}) => ({
  workersNeeded: '2',
  treesToHarvest: '',
  harvestDateFrom: '',
  harvestDateTo: '',
  equipmentNeeded: [],
  priority: 'medium',
  notes: '',
  location: { province: '', district: '', sector: '', cell: '', village: '', ...loc },
});

export default function HarvestingDay() {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm());
  const [profileLoc, setProfileLoc] = useState({});
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    getFarmerInformation()
      .then((res) => {
        const loc = farmLocationFromProfile((res?.data || res)?.farmer_profile);
        setProfileLoc(loc);
        setForm((f) => ({ ...f, location: { ...f.location, ...Object.fromEntries(Object.entries(loc).filter(([, v]) => v)) } }));
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const setLoc = (k, v) => setForm((f) => ({ ...f, location: { ...f.location, [k]: v } }));

  const validate = () => {
    const e = {};
    const workers = Number(form.workersNeeded);
    const trees = Number(form.treesToHarvest);
    if (!Number.isInteger(workers) || workers < 1) e.workersNeeded = 'Enter at least 1 worker';
    if (!Number.isInteger(trees) || trees < 1) e.treesToHarvest = 'Enter the number of trees (whole number)';
    if (!form.harvestDateFrom) e.harvestDateFrom = 'Choose a start date';
    else if (form.harvestDateFrom < isoDay(1)) e.harvestDateFrom = 'Start date must be from tomorrow';
    if (!form.harvestDateTo) e.harvestDateTo = 'Choose an end date';
    else if (form.harvestDateTo < form.harvestDateFrom) e.harvestDateTo = 'End date must be after the start date';
    if (!form.location.province?.trim()) e.province = 'Province is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const harvestImages = await uploadPhotos(photos, uploadMultiple);
      const created = await createHarvestRequest({
        workersNeeded: Number(form.workersNeeded),
        treesToHarvest: Number(form.treesToHarvest),
        harvestDateFrom: form.harvestDateFrom,
        harvestDateTo: form.harvestDateTo,
        equipmentNeeded: form.equipmentNeeded,
        harvestImages,
        location: form.location,
        priority: form.priority,
        notes: form.notes.trim(),
      });
      setSubmitted(created || {});
      toast.success('Harvest request submitted');
    } catch (e) {
      toast.error(errMsg(e, 'Failed to submit harvest request'));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm(emptyForm(Object.fromEntries(Object.entries(profileLoc).filter(([, v]) => v))));
    setPhotos([]);
    setErrors({});
    setSubmitted(null);
  };

  const err = (k) => errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>;

  return (
    <Page>
      <PageHeader
        icon={CalendarCheck}
        title="Book your Harvesting Day"
        subtitle="Tell us when your fruit is ready. An agent will confirm the date and bring a harvesting team."
      />
      {submitted ? (
        <RequestSubmitted title="Harvest request submitted" request={submitted} onAnother={reset}>
          We received your request for {form.treesToHarvest} trees between {formatDate(form.harvestDateFrom)} and {formatDate(form.harvestDateTo)}. You will be notified when it is approved and an agent is assigned.
        </RequestSubmitted>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card title="Harvest details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Number of trees to harvest" required>
                    <input type="number" min="1" step="1" className={inputClass} value={form.treesToHarvest} onChange={(e) => set('treesToHarvest', e.target.value)} />
                    {err('treesToHarvest')}
                  </Field>
                  <Field label="Workers needed" required>
                    <input type="number" min="1" step="1" className={inputClass} value={form.workersNeeded} onChange={(e) => set('workersNeeded', e.target.value)} />
                    {err('workersNeeded')}
                  </Field>
                  <Field label="Harvest from" required>
                    <input
                      type="date"
                      min={isoDay(1)}
                      className={inputClass}
                      value={form.harvestDateFrom}
                      onChange={(e) => {
                        const from = e.target.value;
                        setForm((f) => ({ ...f, harvestDateFrom: from, harvestDateTo: !f.harvestDateTo || f.harvestDateTo < from ? addDays(from, 4) : f.harvestDateTo }));
                        setErrors((x) => ({ ...x, harvestDateFrom: undefined, harvestDateTo: undefined }));
                      }}
                    />
                    {err('harvestDateFrom')}
                  </Field>
                  <Field label="Harvest until" required hint="Defaults to a 5-day window">
                    <input type="date" min={form.harvestDateFrom || isoDay(1)} className={inputClass} value={form.harvestDateTo} onChange={(e) => set('harvestDateTo', e.target.value)} />
                    {err('harvestDateTo')}
                  </Field>
                  <Field label="Priority">
                    <select className={inputClass} value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </Field>
                </div>
                <fieldset className="mt-4">
                  <legend className="mb-2 text-sm font-medium text-slate-700">Equipment needed</legend>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map((item) => {
                      const on = form.equipmentNeeded.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          aria-pressed={on}
                          onClick={() => set('equipmentNeeded', on ? form.equipmentNeeded.filter((x) => x !== item) : [...form.equipmentNeeded, item])}
                          className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset ${on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <Field label="Notes for the agent" className="mt-4">
                  <textarea className={textareaClass} maxLength={1000} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Fruit maturity, access to the farm, anything we should know" />
                </Field>
              </Card>

              <Card title="Photos of your trees" subtitle="Optional — helps the agent judge maturity (up to 5 images, 5 MB each).">
                <PhotoPicker files={photos} onChange={setPhotos} onError={toast.error} disabled={saving} />
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Farm location" subtitle="Pre-filled from your profile.">
                <div className="space-y-3">
                  {['province', 'district', 'sector', 'cell', 'village'].map((k) => (
                    <Field key={k} label={k[0].toUpperCase() + k.slice(1)} required={k === 'province'}>
                      <input className={inputClass} value={form.location[k] || ''} onChange={(e) => setLoc(k, e.target.value)} />
                      {k === 'province' && err('province')}
                    </Field>
                  ))}
                </div>
              </Card>
              <Button type="submit" loading={saving} className="w-full">Submit harvest request</Button>
            </div>
          </div>
        </form>
      )}
    </Page>
  );
}
