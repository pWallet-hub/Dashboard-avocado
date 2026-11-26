import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Dialog, Button, Field, inputClass, Spinner, ErrorState } from '../Ui/kit';
import LocationPicker from '../Location/LocationPicker';
import { useToast } from '../Ui/Toast';
import { getActivationFarmer, updateActivationFarmer } from '../../services/activationService';

const pick = (p = {}, prefix = '') => ({
  province: p[`${prefix}province`] || '', district: p[`${prefix}district`] || '', sector: p[`${prefix}sector`] || '',
  cell: p[`${prefix}cell`] || '', village: p[`${prefix}village`] || '',
});

/**
 * Staff (admin or the farmer's VBA) complete an imported farmer's missing
 * details — above all a phone number, which the activation code is sent to.
 * After the farmer has activated, staff can only fill empty fields.
 */
export default function FarmerDetailsDialog({ farmerId, onClose, onSaved }) {
  const toast = useToast();
  const [farmer, setFarmer] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getActivationFarmer(farmerId)
      .then((f) => {
        const p = f.farmer_profile || {};
        setFarmer(f);
        setForm({
          full_name: f.full_name || '', phone: f.phone || '', national_id: p.id_number || '', gender: p.gender || '', age: p.age ?? '',
          home: pick(p), farm: pick(p, 'farm_'),
        });
      })
      .catch((e) => setError(e.message));
  }, [farmerId]);

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        full_name: form.full_name, gender: form.gender || undefined, age: form.age === '' ? undefined : Number(form.age),
        national_id: form.national_id.trim() || undefined,
        ...Object.fromEntries(Object.entries(form.home).filter(([k]) => k !== 'province')),
        ...Object.fromEntries(Object.entries(form.farm).filter(([k]) => k !== 'province').map(([k, v]) => [`farm_${k}`, v])),
      };
      if (form.phone.trim()) body.phone = form.phone.trim();
      await updateActivationFarmer(farmerId, body);
      toast.success('Farmer details saved');
      onSaved?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const locked = farmer?.credentials_claimed;

  return (
    <Dialog
      open
      size="lg"
      title={farmer ? farmer.full_name : 'Farmer details'}
      subtitle={locked ? 'This farmer has activated their account: you can only fill empty fields.' : 'Complete the details so the farmer can activate their account.'}
      onClose={onClose}
      footer={form && <><Button variant="secondary" onClick={onClose}>Cancel</Button><Button icon={Save} loading={saving} onClick={save}>Save</Button></>}
    >
      {error ? <ErrorState message={error} /> : !form ? <Spinner label="Loading…" /> : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input className={inputClass} value={form.full_name} onChange={set('full_name')} disabled={locked} />
            </Field>
            <Field label="Mobile phone" hint="The activation code is sent here. One number per farmer." required>
              <input className={inputClass} type="tel" inputMode="tel" placeholder="0788 123 456" value={form.phone} onChange={set('phone')} disabled={locked && Boolean(farmer.phone)} />
            </Field>
            <Field label="National ID" hint="16 digits">
              <input className={`${inputClass} font-mono`} inputMode="numeric" maxLength={16} value={form.national_id} onChange={set('national_id')} disabled={locked && Boolean(farmer.farmer_profile?.id_number)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gender">
                <select className={inputClass} value={form.gender} onChange={set('gender')}>
                  <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
              <Field label="Age">
                <input className={inputClass} type="number" min={12} max={110} value={form.age} onChange={set('age')} />
              </Field>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">Where the farmer lives</p>
            <LocationPicker idPrefix="home" value={form.home} onChange={(home) => setForm({ ...form, home })} required="none" columns={3} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-800">Where the farm is</p>
            <LocationPicker idPrefix="farm" labelPrefix="Farm" value={form.farm} onChange={(farm) => setForm({ ...form, farm })} required="none" columns={3} />
          </div>
        </div>
      )}
    </Dialog>
  );
}
