/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { User, Pencil, Phone, Mail, MapPin, Trees, HandHelping } from 'lucide-react';
import { getFarmerInformation, updateFarmerInformation } from '../../services/farmer-information';
import { updateProfile } from '../../services/authService';
import { useToast } from '../Ui/Toast';
import { Page, PageHeader, Card, Badge, Button, Field, inputClass, ErrorState, Spinner, Dialog, Tabs } from '../Ui/kit';
import ProfilePictureUploader from './ProfilePictureUploader';
import LocationPicker from '../Location/LocationPicker';
import { Link } from 'react-router-dom';
import { CardFront } from './MembershipCard';
import { getMyCard } from '../../services/membershipService';

const AVOCADO_TYPES = ['Hass', 'Fuerte', 'Bacon', 'Zutano', 'Mixed'];
const ASSISTANCE = ['irrigation', 'fertilizers', 'fertilizer', 'pesticide', 'training', 'equipment', 'seedlings', 'pest_control'];

const INT_FIELDS = ['age', 'farm_age', 'tree_count'];
const FLOAT_FIELDS = ['farm_size', 'mixed_percentage'];
const PROFILE_FIELDS = [
  'age', 'id_number', 'gender', 'marital_status', 'education_level',
  'province', 'district', 'sector', 'cell', 'village',
  'farm_age', 'planted', 'avocado_type', 'mixed_percentage', 'farm_size', 'tree_count', 'upi_number',
  'farm_province', 'farm_district', 'farm_sector', 'farm_cell', 'farm_village', 'assistance',
];

const toForm = (user, fp) => {
  const f = { full_name: user?.full_name || '', phone: user?.phone || '' };
  PROFILE_FIELDS.forEach((k) => {
    f[k] = k === 'assistance' ? fp?.assistance || [] : fp?.[k] ?? '';
  });
  return f;
};

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 text-sm">
    <dt className="text-slate-500">{label}</dt>
    <dd className="text-right font-medium text-slate-900">{value === '' || value === null || value === undefined ? '—' : value}</dd>
  </div>
);

const join = (...parts) => parts.filter(Boolean).join(', ');

/**
 * Farmer profile page: view + edit personal, location and farm details, and the
 * profile picture. Used by /dashboard/farmer/profile.
 */
export default function FarmerProfileCard({ onUpdate, showEditButton = true }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFarmerInformation();
      setData(res?.data || res);
    } catch (e) {
      setError(e?.message || 'Failed to load your profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const user = data?.user_info;
  const fp = data?.farmer_profile || {};

  const openEdit = () => {
    setForm(toForm(user, fp));
    setErrors({});
    setTab('personal');
    setEditing(true);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2) e.full_name = 'Enter your full name';
    if (form.phone && !/^\+?[0-9 ]{10,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number, e.g. +250788123456';
    INT_FIELDS.concat(FLOAT_FIELDS).forEach((k) => {
      if (form[k] !== '' && (Number.isNaN(Number(form[k])) || Number(form[k]) < 0)) e[k] = 'Must be a positive number';
    });
    if (form.mixed_percentage !== '' && Number(form.mixed_percentage) > 100) e.mixed_percentage = 'Must be between 0 and 100';
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      setTab(['full_name', 'phone', 'age', 'id_number'].includes(first) ? 'personal' : ['farm_size', 'tree_count', 'farm_age', 'mixed_percentage'].includes(first) ? 'farm' : tab);
    }
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {};
      PROFILE_FIELDS.forEach((k) => {
        const v = form[k];
        if (k === 'assistance') payload[k] = v;
        else if (v === '' || v === null || v === undefined) payload[k] = null;
        else if (INT_FIELDS.includes(k)) payload[k] = parseInt(v, 10);
        else if (FLOAT_FIELDS.includes(k)) payload[k] = parseFloat(v);
        else payload[k] = typeof v === 'string' ? v.trim() : v;
      });
      const accountChanged = form.full_name.trim() !== (user?.full_name || '') || form.phone.trim() !== (user?.phone || '');
      if (accountChanged) {
        const updatedUser = await updateProfile({ full_name: form.full_name.trim(), ...(form.phone.trim() ? { phone: form.phone.trim() } : {}) });
        if (updatedUser?.email) localStorage.setItem('username', updatedUser.email);
      }
      await updateFarmerInformation(payload);
      toast.success('Profile updated');
      setEditing(false);
      await load();
      onUpdate?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePicture = async (url) => {
    await updateFarmerInformation({ image: url });
    const key = localStorage.getItem('username') || user?.email;
    try {
      if (key) {
        if (url) localStorage.setItem(`profilePic_${key}`, url);
        else localStorage.removeItem(`profilePic_${key}`);
      }
    } catch {
      /* storage full / blocked — the server copy is what matters */
    }
    setData((d) => ({ ...d, farmer_profile: { ...(d?.farmer_profile || {}), image: url } }));
    toast.success(url ? 'Profile picture updated' : 'Profile picture removed');
  };

  const input = (k, props = {}) => (
    <>
      <input className={inputClass} value={form[k] ?? ''} onChange={(e) => set(k, e.target.value)} {...props} />
      {errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>}
    </>
  );
  const select = (k, options, placeholder = 'Select') => (
    <select className={inputClass} value={form[k] ?? ''} onChange={(e) => set(k, e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      {form[k] && !options.includes(form[k]) && <option value={form[k]}>{form[k]}</option>}
    </select>
  );

  const status = fp.verification_status || 'pending';

  return (
    <Page>
      <PageHeader
        icon={User}
        title="My Profile"
        subtitle="Keep your details up to date so agents and buyers can reach you."
        actions={showEditButton && data && <Button icon={Pencil} onClick={openEdit}>Edit profile</Button>}
      />
      {loading ? (
        <Card><Spinner label="Loading profile…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <Card>
              <div className="flex flex-col items-center gap-3 text-center">
                <ProfilePictureUploader currentPicture={fp.image} name={user?.full_name} onUpload={savePicture} onDelete={() => savePicture(null)} />
                <div>
                  <p className="text-lg font-semibold text-slate-900">{user?.full_name}</p>
                  <p className="text-sm text-slate-500">Farmer</p>
                </div>
                <Badge tone={status === 'verified' ? 'brand' : status === 'rejected' ? 'rose' : 'amber'} className="capitalize">Profile {status}</Badge>
                <dl className="w-full space-y-2 border-t border-slate-100 pt-3 text-left text-sm">
                  <div className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-slate-400" /> <span className="truncate">{user?.email}</span></div>
                  <div className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-slate-400" /> {user?.phone || '—'}</div>
                  <div className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-slate-400" /> {join(fp.district, fp.province) || '—'}</div>
                </dl>
              </div>
            </Card>
            <CardPreview />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card title="Personal details">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <Row label="Age" value={fp.age} />
                <Row label="Gender" value={fp.gender} />
                <Row label="National ID" value={fp.id_number} />
                <Row label="Marital status" value={fp.marital_status} />
                <Row label="Education" value={fp.education_level} />
                <Row label="Residence" value={join(fp.village, fp.cell, fp.sector, fp.district, fp.province)} />
              </dl>
            </Card>
            <Card title="Farm" actions={<Trees className="h-5 w-5 text-slate-400" />}>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <Row label="Farm size" value={fp.farm_size ? `${fp.farm_size} ha` : ''} />
                <Row label="Trees" value={fp.tree_count} />
                <Row label="Variety" value={fp.avocado_type} />
                <Row label="Mixed %" value={fp.mixed_percentage} />
                <Row label="Farm age" value={fp.farm_age ? `${fp.farm_age} years` : ''} />
                <Row label="Year planted" value={fp.planted} />
                <Row label="Land title (UPI)" value={fp.upi_number} />
                <Row label="Farm location" value={join(fp.farm_village, fp.farm_cell, fp.farm_sector, fp.farm_district, fp.farm_province)} />
              </dl>
            </Card>
            <Card title="Assistance received" actions={<HandHelping className="h-5 w-5 text-slate-400" />}>
              {fp.assistance?.length ? (
                <div className="flex flex-wrap gap-2">{fp.assistance.map((a) => <Badge key={a} tone="brand" className="capitalize">{a.replace(/_/g, ' ')}</Badge>)}</div>
              ) : (
                <p className="text-sm text-slate-500">None recorded.</p>
              )}
            </Card>
          </div>
        </div>
      )}

      <Dialog
        open={editing}
        title="Edit profile"
        size="lg"
        onClose={() => !saving && setEditing(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Tabs
            tabs={[{ id: 'personal', label: 'Personal' }, { id: 'location', label: 'Location' }, { id: 'farm', label: 'Farm' }]}
            value={tab}
            onChange={setTab}
          />
          {tab === 'personal' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>{input('full_name')}</Field>
              <Field label="Phone">{input('phone', { placeholder: '+250788123456' })}</Field>
              <Field label="Age">{input('age', { type: 'number', min: 0 })}</Field>
              <Field label="National ID">{input('id_number')}</Field>
              <Field label="Gender">{select('gender', ['Male', 'Female', 'Other'])}</Field>
              <Field label="Marital status">{select('marital_status', ['Single', 'Married', 'Divorced', 'Widowed'])}</Field>
              <Field label="Education">{select('education_level', ['None', 'Primary', 'Secondary', 'University'])}</Field>
            </div>
          )}
          {tab === 'location' && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Where you live</p>
                <LocationPicker
                  idPrefix="home"
                  value={{ province: form.province, district: form.district, sector: form.sector, cell: form.cell, village: form.village }}
                  onChange={(l) => setForm((f) => ({ ...f, province: l.province, district: l.district, sector: l.sector, cell: l.cell, village: l.village }))}
                  required="province"
                />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">Where your main farm is</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-brand-700 hover:underline"
                    onClick={() => setForm((f) => ({ ...f, farm_province: f.province, farm_district: f.district, farm_sector: f.sector, farm_cell: f.cell, farm_village: f.village }))}
                  >
                    Same as where I live
                  </button>
                </div>
                <LocationPicker
                  idPrefix="farm"
                  value={{ province: form.farm_province, district: form.farm_district, sector: form.farm_sector, cell: form.farm_cell, village: form.farm_village }}
                  onChange={(l) => setForm((f) => ({ ...f, farm_province: l.province, farm_district: l.district, farm_sector: l.sector, farm_cell: l.cell, farm_village: l.village }))}
                  required="province"
                />
                <p className="mt-2 text-xs text-slate-500">Other farms are added on the <Link to="/dashboard/farmer/my-farm" className="font-medium text-brand-700 hover:underline">My Farms</Link> page.</p>
              </div>
            </div>
          )}
          {tab === 'farm' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Farm size (ha)">{input('farm_size', { type: 'number', min: 0, step: 0.1 })}</Field>
              <Field label="Number of trees">{input('tree_count', { type: 'number', min: 0 })}</Field>
              <Field label="Avocado variety">{select('avocado_type', AVOCADO_TYPES)}</Field>
              <Field label="Mixed percentage (%)">{input('mixed_percentage', { type: 'number', min: 0, max: 100 })}</Field>
              <Field label="Farm age (years)">{input('farm_age', { type: 'number', min: 0 })}</Field>
              <Field label="Year planted">{input('planted')}</Field>
              <Field label="Land title (UPI)" className="sm:col-span-2">{input('upi_number', { placeholder: '5/01/02/03/1234' })}</Field>
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-sm font-medium text-slate-700">Assistance received</legend>
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...ASSISTANCE, ...(form.assistance || [])])].map((a) => {
                    const on = form.assistance?.includes(a);
                    return (
                      <button
                        type="button"
                        key={a}
                        aria-pressed={on}
                        onClick={() => set('assistance', on ? form.assistance.filter((x) => x !== a) : [...(form.assistance || []), a])}
                        className={`rounded-full px-3 py-1.5 text-sm capitalize ring-1 ring-inset ${on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                      >
                        {a.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          )}
        </div>
      </Dialog>
    </Page>
  );
}

/** The farmer's real membership card, linking to the full card page. */
function CardPreview() {
  const [card, setCard] = useState(null);
  useEffect(() => {
    getMyCard().then(setCard).catch(() => setCard(false));
  }, []);
  if (card === null) return null;
  if (card === false) return null;
  return (
    <div className="space-y-2">
      <CardFront card={card} />
      <Link to="/dashboard/farmer/membership-card" className="block text-center text-sm font-medium text-brand-700 hover:underline">
        Open, print or share my card
      </Link>
    </div>
  );
}
