import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, KeyRound } from 'lucide-react';
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
const apiError = (error, fallback) =>
  error.response?.data?.errors?.[0]?.message || error.response?.data?.message || error.message || fallback;

/**
 * Account activation for farmers registered by an agent or imported from the
 * field survey. Step 1: we SMS a 6-digit code to their phone. Step 2: code +
 * the email/password they want (POST /api/auth/verify-phone).
 */
export default function ClaimAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [form, setForm] = useState({ code: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const normalized = toRwandaPhone(phone);

  const sendCode = async (e) => {
    e?.preventDefault();
    setMessage('');
    setSuccess(false);
    if (!normalized) return setMessage('Enter your Rwandan mobile number, e.g. 0788 123 456');
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-phone/send-code', { phone: normalized });
      const devCode = res.data?.data?.dev_code;
      setStep('details');
      setSuccess(true);
      setMessage(devCode ? `Test mode (no SMS provider): your code is ${devCode}` : 'We sent a 6-digit code by SMS. It expires in 10 minutes.');
      if (devCode) setForm((f) => ({ ...f, code: devCode }));
    } catch (error) {
      setMessage(apiError(error, 'Could not send the code'));
    } finally {
      setLoading(false);
    }
  };

  const activate = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);
    if (!/^\d{6}$/.test(form.code.trim())) return setMessage('Enter the 6-digit code from the SMS');
    if (!PASSWORD_RULE.test(form.password)) {
      return setMessage('Password needs 8+ characters with an uppercase letter, a lowercase letter, a number and a symbol (@$!%*?&)');
    }
    if (form.password !== form.confirm) return setMessage('Passwords do not match');
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setMessage('Enter a valid email, or leave it empty');
    setLoading(true);
    try {
      const email = form.email.trim();
      await apiClient.post('/auth/verify-phone', {
        phone: normalized,
        code: form.code.trim(),
        ...(email ? { email } : {}),
        password: form.password,
      });
      setStep('done');
      setSuccess(true);
      setMessage(email
        ? 'Your account is ready. Sign in with your email or phone number and your new password.'
        : 'Your account is ready. Sign in with your phone number and your new password.');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setMessage(apiError(error, 'Could not activate the account'));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthShell
      title="Activate your account"
      subtitle="Registered by the Avocado Society of Rwanda, a field agent or during the farmer survey? Enter the phone number you gave them — we send you a code by SMS — then choose your password."
      footer={<>Already activated? <Link to="/" className="font-medium text-brand-700 hover:underline">Sign in</Link></>}
    >
      {step === 'phone' && (
        <form onSubmit={sendCode} className="space-y-4" noValidate>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Phone number</span>
            <div className="relative">
              <Smartphone className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input className={`${authInput} pl-10`} type="tel" inputMode="tel" autoComplete="tel" placeholder="0788 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </label>
          <AuthMessage message={message} success={success} />
          <button type="submit" className={authButton} disabled={loading}>
            {loading ? 'Sending…' : 'Send activation code'}
          </button>
        </form>
      )}

      {step !== 'phone' && (
        <form onSubmit={activate} className="space-y-4" noValidate>
          <p className="text-sm text-slate-600">
            Code sent to <span className="font-medium text-slate-900">{normalized}</span>.{' '}
            <button type="button" className="font-medium text-brand-700 hover:underline" onClick={() => { setStep('phone'); setMessage(''); }}>
              Change number
            </button>
          </p>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">6-digit code</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input className={`${authInput} pl-10 tracking-[0.3em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={form.code} onChange={set('code')} required />
            </div>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Email <span className="font-normal text-slate-500">(optional — you can always sign in with your phone number)</span></span>
            <input className={authInput} type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
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
          <button type="submit" className={authButton} disabled={loading || step === 'done'}>
            {loading ? 'Activating…' : 'Activate account'}
          </button>
          {step === 'details' && (
            <button type="button" onClick={sendCode} disabled={loading} className="w-full text-center text-sm font-medium text-brand-700 hover:underline disabled:opacity-60">
              Didn&apos;t get the code? Send it again
            </button>
          )}
        </form>
      )}
    </AuthShell>
  );
}
