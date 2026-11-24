import { useEffect, useState } from 'react';
import { Bug } from 'lucide-react';
import { createPestManagementRequest } from '../../services/serviceRequestsService';
import { getFarmerInformation } from '../../services/farmer-information';
import { uploadMultiple } from '../../services/uploadService';
import { useToast } from '../../components/Ui/Toast';
import { Page, PageHeader, Card, Button, Field, inputClass, textareaClass } from '../../components/Ui/kit';
import { PhotoPicker, RequestSubmitted, uploadPhotos } from './FarmerBits';
import { isoDay, farmLocationFromProfile, errMsg } from './farmerShared';

const diseases = [
  { disease: "Root Rot (Phytophthora Root Rot)", symptoms: "Wilting, leaf yellowing, twig dieback, root decay with brown/black rot, stunted trees" },
  { disease: "Anthracnose", symptoms: "Black sunken spots on fruit, lesions on twigs and leaves, postharvest rot" },
  { disease: "Stem-End Rot", symptoms: "Brown to black decay at fruit stem end, extends inward postharvest" },
  { disease: "Cercospora Spot (Leaf and Fruit Spot)", symptoms: "Purplish-brown leaf spots, small dark fruit lesions that crack" },
  { disease: "Scab", symptoms: "Raised corky brown lesions on fruit, leaves, and twigs" },
  { disease: "Botryosphaeria Dieback / Canker", symptoms: "Branch dieback, bark cracking, gumming" },
  { disease: "Powdery Mildew", symptoms: "White powdery growth on young leaves, defoliation, flower abortion" },
  { disease: "Armillaria Root Rot", symptoms: "Honey-colored mushrooms at base, white mycelial mats under bark" },
  { disease: "Bacterial Canker", symptoms: "Water-soaked leaf spots, twig dieback, cankers on stems" },
  { disease: "Bacterial Soft Rot (Postharvest)", symptoms: "Soft, watery fruit decay, foul odor" },
  { disease: "Sunblotch", symptoms: "Yellow streaks on fruit, cracked bark, reduced fruit set, stunted growth" },
  { disease: "Tip Burn / Leaf Burn", symptoms: "Brown leaf tips and margins" },
  { disease: "Fruit Drop", symptoms: "Premature fruit fall" },
  { disease: "Sunburn", symptoms: "Brown patches on fruit and exposed bark" }
];

const pests = [
  { pest: "Fruit fly", damage: "Larvae bore into fruit, causing rotting and early drop" },
  { pest: "Seed weevil", damage: "Larvae feed inside the seed, fruit often drops" },
  { pest: "Avocado seed moth", damage: "Larvae tunnel in seed and pulp" },
  { pest: "Avocado lace bug", damage: "Sucks sap from underside of leaves to yellow stippling, leaf drop" },
  { pest: "Leaf miner", damage: "Mines leaves, distorting growth" },
  { pest: "Thrips", damage: "Feed on fruit epidermis to russeting and scarring" },
  { pest: "Loopers / Caterpillars", damage: "Feed on tender leaves, flowers" },
  { pest: "Whiteflies", damage: "Sap sucking to honeydew to sooty mold" },
  { pest: "Shot hole borer / Ambrosia beetle", damage: "Bore into stems, inoculate fungi to dieback" },
  { pest: "Bark beetle", damage: "Bores into branches; associated with Fusarium fungi" },
  { pest: "Stem borer", damage: "Boring holes in stems and branches" },
  { pest: "Persea mite", damage: "Yellow necrotic spots on underside of leaves; defoliation" },
  { pest: "Avocado brown mite", damage: "Causes bronzing of leaves" },
  { pest: "Root weevil", damage: "Larvae feed on roots, adults notch leaves" },
  { pest: "Root mealybugs", damage: "Suck root sap, promote fungal growth" },
  { pest: "Termites", damage: "Feed on bark, weaken tree base" },
  { pest: "Snails & slugs", damage: "Feed on young shoots and leaves" },
  { pest: "Rodents (rats, squirrels)", damage: "Gnaw fruits, bark, and seedlings" },
  { pest: "Birds (esp. bulbuls, starlings)", damage: "Peck ripe fruits" }
];

const NOTICED = [
  { value: 'this_week', label: 'This week' },
  { value: 'few_weeks', label: 'A few weeks ago' },
  { value: '2_months', label: 'In the last 2 months' },
  { value: 'last_year', label: 'Last year or earlier' },
];

const SEVERITY = [
  { value: 'low', label: 'Low — a few trees, little damage' },
  { value: 'medium', label: 'Medium — spreading, visible damage' },
  { value: 'high', label: 'High — many trees affected' },
  { value: 'critical', label: 'Critical — trees dying / crop loss' },
];

const IssueList = ({ title, items, nameKey, detailKey, selected, onToggle }) => (
  <Card title={title} subtitle={`${selected.length} selected`}>
    <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
      {items.map((it) => {
        const name = it[nameKey];
        const on = selected.includes(name);
        return (
          <label key={name} className={`flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm hover:bg-slate-50 ${on ? 'bg-brand-50' : ''}`}>
            <input type="checkbox" className="mt-1 h-4 w-4 accent-brand-600" checked={on} onChange={() => onToggle(name)} />
            <span>
              <span className="font-medium text-slate-900">{name}</span>
              <span className="block text-xs text-slate-500">{it[detailKey]}</span>
            </span>
          </label>
        );
      })}
    </div>
  </Card>
);

const emptyForm = { diseases: [], pests: [], noticed: '', severity: '', controlMethods: '', preferredDate: '', notes: '' };

export default function PestManagement() {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [info, setInfo] = useState({ user: null, location: {} });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    getFarmerInformation()
      .then((res) => {
        const d = res?.data || res;
        setInfo({ user: d?.user_info || null, location: farmLocationFromProfile(d?.farmer_profile) });
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, issues: undefined }));
  };
  const toggle = (key) => (name) => set(key, form[key].includes(name) ? form[key].filter((x) => x !== name) : [...form[key], name]);

  const validate = () => {
    const e = {};
    if (!form.diseases.length && !form.pests.length) e.issues = 'Select at least one disease or pest';
    if (!form.noticed) e.noticed = 'Choose when you first noticed it';
    if (!form.severity) e.severity = 'Choose a severity level';
    if (!photos.length) e.photos = 'Add at least one photo of the problem';
    if (form.preferredDate && form.preferredDate < isoDay(1)) e.preferredDate = 'Choose a date from tomorrow';
    if (!info.location.province) e.location = 'Your farm province is missing — add it on your Profile page first';
    if (!info.user?.phone) e.phone = 'Your phone number is missing — add it on your Profile page first';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    setSaving(true);
    try {
      const attachments = await uploadPhotos(photos, uploadMultiple);
      const chosen = [...form.diseases, ...form.pests];
      const details = [
        ...diseases.filter((d) => form.diseases.includes(d.disease)).map((d) => `${d.disease}: ${d.symptoms}`),
        ...pests.filter((p) => form.pests.includes(p.pest)).map((p) => `${p.pest}: ${p.damage}`),
      ].join('; ');
      const title = `Pest & disease diagnosis: ${chosen.slice(0, 3).join(', ')}${chosen.length > 3 ? '…' : ''}`.slice(0, 200);
      const created = await createPestManagementRequest({
        service_type: 'pest_control',
        title,
        description: `Farmer-reported issue(s): ${chosen.join(', ')}.${form.notes.trim() ? ` ${form.notes.trim()}` : ''}`.slice(0, 1000),
        location: info.location,
        preferred_date: form.preferredDate || undefined,
        pest_management_details: {
          pests_diseases: chosen.map((name) => ({ name, type: form.diseases.includes(name) ? 'disease' : 'pest' })),
          first_noticed: NOTICED.find((n) => n.value === form.noticed)?.label || form.noticed,
          damage_observed: details.slice(0, 1000),
          damage_details: details.slice(0, 1000),
          control_methods_tried: form.controlMethods.trim() || 'None',
          severity_level: form.severity,
        },
        farmer_info: { name: info.user?.full_name || '', phone: info.user?.phone || '', location: info.location },
        priority: form.severity === 'critical' ? 'urgent' : form.severity,
        attachments,
        notes: form.notes.trim(),
      });
      setSubmitted(created || {});
      toast.success('Pest management request submitted');
    } catch (e) {
      toast.error(errMsg(e, 'Failed to submit request'));
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>;

  return (
    <Page>
      <PageHeader
        icon={Bug}
        title="Book your Integrated Pest Management Day"
        subtitle="Describe what you see on your trees. An agronomist reviews it and schedules an IPM visit."
      />
      {submitted ? (
        <RequestSubmitted
          title="Diagnosis request submitted"
          request={submitted}
          onAnother={() => { setForm(emptyForm); setPhotos([]); setErrors({}); setSubmitted(null); }}
        >
          Our agricultural experts will review your photos and contact you within 24–48 hours with recommendations and a visit date.
        </RequestSubmitted>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-6">
          {(errors.location || errors.phone) && (
            <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">{errors.location || errors.phone}</p>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            <IssueList title="Diseases observed" items={diseases} nameKey="disease" detailKey="symptoms" selected={form.diseases} onToggle={toggle('diseases')} />
            <IssueList title="Pests observed" items={pests} nameKey="pest" detailKey="damage" selected={form.pests} onToggle={toggle('pests')} />
          </div>
          {err('issues')}

          <Card title="About the problem">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="When did you first notice it?" required>
                <select className={inputClass} value={form.noticed} onChange={(e) => set('noticed', e.target.value)}>
                  <option value="">Select timeframe</option>
                  {NOTICED.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
                {err('noticed')}
              </Field>
              <Field label="Severity" required>
                <select className={inputClass} value={form.severity} onChange={(e) => set('severity', e.target.value)}>
                  <option value="">Select severity</option>
                  {SEVERITY.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
                {err('severity')}
              </Field>
              <Field label="Preferred visit date" hint="Optional">
                <input type="date" min={isoDay(1)} className={inputClass} value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)} />
                {err('preferredDate')}
              </Field>
              <Field label="Control methods already tried">
                <input className={inputClass} maxLength={1000} value={form.controlMethods} onChange={(e) => set('controlMethods', e.target.value)} placeholder="e.g. sprayed copper fungicide" />
              </Field>
              <Field label="Other details" className="sm:col-span-2">
                <textarea className={textareaClass} maxLength={500} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="How many trees, which part of the farm, anything else" />
              </Field>
            </div>
          </Card>

          <Card title="Photos of the problem" subtitle="At least one photo is required (up to 5 images, 5 MB each).">
            <PhotoPicker files={photos} onChange={(f) => { setPhotos(f); setErrors((e) => ({ ...e, photos: undefined })); }} onError={toast.error} disabled={saving} />
            {err('photos')}
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Submit for diagnosis</Button>
          </div>
        </form>
      )}
    </Page>
  );
}
