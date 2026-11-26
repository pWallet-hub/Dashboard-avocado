import { useEffect, useState } from 'react';
import { User, Mail, Phone, ShieldCheck, KeyRound, MapPin } from 'lucide-react';
import { updateProfile, changePassword, getProfile } from '../../services/authService';
import { useToast } from '../Ui/Toast';
import { Page, PageHeader, Card, Badge, Button, Field, inputClass, Spinner, ErrorState } from '../Ui/kit';
import ProfilePictureUploader from './ProfilePictureUploader';

const ROLE_LABELS = { admin: 'Administrator', agent: 'Field Agent (VBA)', farmer: 'Farmer', shop_manager: 'Shop Manager' };
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const syncTopBarPicture = (email, url) => {
  const key = localStorage.getItem('username') || email;
  if (!key) return;
  try {
    if (url) localStorage.setItem(`profilePic_${key}`, url);
    else localStorage.removeItem(`profilePic_${key}`);
  } catch {
    /* ignore storage errors */
  }
};

/**
 * Account profile for admin / agent (and any non-farmer role): name, phone,
 * location, profile picture and password. Saves through PUT /auth/profile and
 * PUT /auth/password.
 */
const UserProfile = ({ user: initialUser, onUpdate }) => {
  const toast = useToast();
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [loadError, setLoadError] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', province: '', district: '', sector: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const fill = (u) => {
    setUser(u);
    setForm({
      full_name: u?.full_name || '',
      phone: u?.phone || '',
      province: u?.profile?.province || '',
      district: u?.profile?.district || '',
      sector: u?.profile?.sector || '',
    });
  };

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      fill(await getProfile());
    } catch (e) {
      setLoadError(e?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialUser) fill(initialUser);
  }, [initialUser]);

  useEffect(() => {
    load();
    // load once on mount; the parent may also pass a user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.full_name.trim().length < 2) errs.full_name = 'Enter your full name';
    if (form.phone && !/^\+?[0-9 ]{9,15}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number, e.g. +250788123456';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        full_name: form.full_name.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        profile: { province: form.province.trim(), district: form.district.trim(), sector: form.sector.trim() },
      });
      fill(updated);
      onUpdate?.(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePicture = async (url) => {
    const updated = await updateProfile({ profile: { picture: url || null } });
    fill(updated);
    onUpdate?.(updated);
    syncTopBarPicture(updated?.email, url);
    toast.success(url ? 'Profile picture updated' : 'Profile picture removed');
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pw.currentPassword || !pw.newPassword) return setPwError('Fill in your current and new password');
    if (!PASSWORD_RULE.test(pw.newPassword)) return setPwError('New password needs 8+ characters with upper and lower case letters, a number and a symbol (@$!%*?&)');
    if (pw.newPassword !== pw.confirmPassword) return setPwError('New passwords do not match');
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      setPwError(err?.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
    return undefined;
  };

  const err = (k) => errors[k] && <span className="mt-1 block text-xs text-rose-600">{errors[k]}</span>;

  return (
    <Page>
      <PageHeader icon={User} title="My Profile" subtitle="Manage your account details, photo and password." />
      {loading && !user ? (
        <Card><Spinner label="Loading profile…" /></Card>
      ) : loadError && !user ? (
        <Card><ErrorState message={loadError} onRetry={load} /></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <div className="flex flex-col items-center gap-3 text-center">
              <ProfilePictureUploader currentPicture={user?.profile?.picture} name={user?.full_name} onUpload={savePicture} onDelete={() => savePicture(null)} />
              <div>
                <p className="text-lg font-semibold text-slate-900">{user?.full_name || '—'}</p>
                <Badge tone="brand">{ROLE_LABELS[user?.role] || user?.role}</Badge>
              </div>
              <dl className="w-full space-y-2 border-t border-slate-100 pt-3 text-left text-sm text-slate-700">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> <span className="truncate">{user?.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {user?.phone || '—'}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {[user?.profile?.district, user?.profile?.province].filter(Boolean).join(', ') || '—'}</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-400" /> <span className="capitalize">{user?.status || '—'}</span></div>
              </dl>
            </div>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            <Card title="Account details">
              <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required>
                  <input className={inputClass} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
                  {err('full_name')}
                </Field>
                <Field label="Phone">
                  <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+250788123456" />
                  {err('phone')}
                </Field>
                <Field label="Email" hint="Contact an administrator to change your email.">
                  <input className={`${inputClass} bg-slate-50`} value={user?.email || ''} readOnly />
                </Field>
                <Field label="Role">
                  <input className={`${inputClass} bg-slate-50`} value={ROLE_LABELS[user?.role] || user?.role || ''} readOnly />
                </Field>
                <Field label="Province">
                  <input className={inputClass} value={form.province} onChange={(e) => set('province', e.target.value)} />
                </Field>
                <Field label="District">
                  <input className={inputClass} value={form.district} onChange={(e) => set('district', e.target.value)} />
                </Field>
                <Field label="Sector">
                  <input className={inputClass} value={form.sector} onChange={(e) => set('sector', e.target.value)} />
                </Field>
                <div className="flex items-end justify-end sm:col-span-2">
                  <Button type="submit" loading={saving}>Save changes</Button>
                </div>
              </form>
            </Card>

            <Card title="Change password" actions={<KeyRound className="h-5 w-5 text-slate-400" />}>
              <form onSubmit={savePassword} noValidate className="grid gap-4 sm:grid-cols-3">
                {pwError && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200 sm:col-span-3">{pwError}</p>}
                <Field label="Current password">
                  <input type="password" autoComplete="current-password" className={inputClass} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
                </Field>
                <Field label="New password">
                  <input type="password" autoComplete="new-password" className={inputClass} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
                </Field>
                <Field label="Confirm new password">
                  <input type="password" autoComplete="new-password" className={inputClass} value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} />
                </Field>
                <div className="flex justify-end sm:col-span-3">
                  <Button type="submit" loading={pwSaving}>Update password</Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
};

export default UserProfile;
