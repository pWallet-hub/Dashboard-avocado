import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import AuthShell, { authInput, authButton, AuthMessage } from '../../components/Layout/AuthShell';
import apiClient from '../../services/apiClient';

/** 0788…, 788…, +250 788… → +250788… (how farmer phones are stored). */
export function toRwandaPhone(input) {
  let d = String(input || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 9 && d.startsWith('7')) return `+250${d}`;
  if (d.length === 10 && d.startsWith('07')) return `+250${d.slice(1)}`;
  if (d.length === 12 && d.startsWith('2507')) return `+${d}`;
  return null;
}

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * For farmers registered by an agent or imported from the field survey: they
 * already have an account tied to their phone number and set their own email
 * and password here (POST /api/auth/verify-phone).
 */
export default function ClaimAccount() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const phone = toRwandaPhone(form.phone);
    if (!phone) return setMessage('Enter your Rwandan mobile number, e.g. 0788 123 456');
    if (!PASSWORD_RULE.test(form.password)) {
      return setMessage('Password needs 8+ characters with an uppercase letter, a lowercase letter, a number and a symbol (@$!%*?&)');
    }
    if (form.password !== form.confirm) return setMessage('Passwords do not match');
    setLoading(true);
    try {
      await apiClient.post('/auth/verify-phone', { phone, email: form.email.trim(), password: form.password });
      setSuccess(true);
      setMessage('Your account is ready. Sign in with your new email and password.');
      setTimeout(() => navigate('/'), 2500);
    } catch (error) {
      setMessage(error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || 'Could not activate the account');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthShell
      title="Activate your account"
      subtitle="Were you registered by a field agent or during the farmer survey? Use the phone number you gave them to set your own login."
      footer={<>Already activated? <Link to="/" className="font-medium text-brand-700 hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone number</span>
          <div className="relative">
            <Smartphone className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input className={`${authInput} pl-10`} type="tel" inputMode="tel" autoComplete="tel" placeholder="0788 123 456" value={form.phone} onChange={set('phone')} required />
          </div>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email you will log in with</span>
          <input className={authInput} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">New password</span>
          <input className={authInput} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Confirm password</span>
          <input className={authInput} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />
        </label>
        <AuthMessage message={message} success={success} />
        <button type="submit" className={authButton} disabled={loading || success}>
          {loading ? 'Activating…' : 'Activate account'}
        </button>
      </form>
    </AuthShell>
  );
}
