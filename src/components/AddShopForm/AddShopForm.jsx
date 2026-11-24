import { useState } from 'react';
import { createShop, updateShop } from '../../services/shopService';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS } from '../../utils/rwanda';
import { useToast } from '../Ui/Toast';
import { Dialog, Button, Field, inputClass, textareaClass } from '../Ui/kit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{10,15}$/;
const EMPTY = { shopName: '', description: '', province: '', district: '', ownerName: '', ownerEmail: '', ownerPhone: '' };

/**
 * Create or edit a shop in a dialog. Pass `shop` to edit an existing one.
 * Calls onSuccess(savedShop) after the API confirms the save.
 */
export default function AddShopForm({ shop, onClose, onSuccess }) {
  const toast = useToast();
  const editing = Boolean(shop);
  const [form, setForm] = useState(() => (shop ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, shop[k] ?? ''])) : EMPTY));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Legacy rows may store a province name outside the canonical list; keep it selectable.
  const provinces = form.province && !RWANDA_PROVINCES.includes(form.province) ? [form.province, ...RWANDA_PROVINCES] : RWANDA_PROVINCES;
  const districts = RWANDA_DISTRICTS[form.province] || (form.district ? [form.district] : []);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [k]: value, ...(k === 'province' ? { district: '' } : {}) }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.shopName.trim().length < 2) er.shopName = 'At least 2 characters';
    if (!form.description.trim()) er.description = 'Required';
    if (!form.province) er.province = 'Required';
    if (!form.district) er.district = 'Required';
    if (form.ownerName.trim().length < 2) er.ownerName = 'At least 2 characters';
    if (!EMAIL_RE.test(form.ownerEmail.trim())) er.ownerEmail = 'Enter a valid email';
    if (!PHONE_RE.test(form.ownerPhone.trim())) er.ownerPhone = '10–15 digits, e.g. +250788123456';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
      const res = editing ? await updateShop(shop.shop_number, payload) : await createShop(payload);
      toast.success(editing ? 'Shop updated' : `Shop "${payload.shopName}" created`);
      onSuccess?.(res?.data || res);
    } catch (err) {
      toast.error(err?.response?.data?.errors?.[0]?.msg || err?.response?.data?.message || err.message || 'Failed to save shop');
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>;

  return (
    <Dialog
      title={editing ? `Edit ${shop.shopName}` : 'Add shop'}
      size="lg"
      onClose={() => !saving && onClose?.()}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="shop-form" loading={saving}>{editing ? 'Save changes' : 'Create shop'}</Button>
        </>
      )}
    >
      <form id="shop-form" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Shop name" required className="sm:col-span-2">
          <input className={inputClass} value={form.shopName} onChange={set('shopName')} maxLength={200} />{err('shopName')}
        </Field>
        <Field label="Description" required className="sm:col-span-2">
          <textarea className={textareaClass} value={form.description} onChange={set('description')} maxLength={1000} />{err('description')}
        </Field>
        <Field label="Province" required>
          <select className={inputClass} value={form.province} onChange={set('province')}>
            <option value="">Select…</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>{err('province')}
        </Field>
        <Field label="District" required>
          <select className={inputClass} value={form.district} onChange={set('district')} disabled={!form.province}>
            <option value="">{form.province ? 'Select…' : 'Choose a province first'}</option>
            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>{err('district')}
        </Field>
        <Field label="Owner name" required>
          <input className={inputClass} value={form.ownerName} onChange={set('ownerName')} />{err('ownerName')}
        </Field>
        <Field label="Owner phone" required>
          <input className={inputClass} type="tel" placeholder="+250788123456" value={form.ownerPhone} onChange={set('ownerPhone')} />{err('ownerPhone')}
        </Field>
        <Field label="Owner email" required className="sm:col-span-2">
          <input className={inputClass} type="email" value={form.ownerEmail} onChange={set('ownerEmail')} />{err('ownerEmail')}
        </Field>
      </form>
    </Dialog>
  );
}
