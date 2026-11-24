import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { KeyRound, Loader2 } from "lucide-react";
import AuthShell, { authInput, authButton, AuthMessage } from '../../components/Layout/AuthShell';
import { resetPassword } from '../../services/authService';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(!token ? 'Reset link is missing or invalid. Please request a new one.' : '');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!token) {
      setMessage('Reset link is missing or invalid. Please request a new one.');
      return false;
    }

    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in all fields');
      return false;
    }

    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, newPassword);
      navigate('/?resetSuccess=1');
    } catch (error) {
      setMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a password of at least 8 characters."
      footer={<>Remembered your password? <Link to="/" className="font-medium text-brand-700 hover:underline">Back to login</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">New password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading || !token}
            className={authInput}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || !token}
            className={authInput}
          />
        </label>
        <AuthMessage message={message} />
        <button type="submit" disabled={loading || !token} className={authButton}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Resetting...</> : <><KeyRound className="h-4 w-4" />Reset Password</>}
        </button>
      </form>
    </AuthShell>
  );
}

export default ResetPassword;
