import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from "lucide-react";
import AuthShell, { authInput, authButton, AuthMessage } from '../../components/Layout/AuthShell';
import { forgotPassword } from '../../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email) {
      setMessage('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
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
      await forgotPassword(email);
      setSuccess(true);
      setMessage('If an account exists for that email, a password reset link has been sent.');
    } catch (error) {
      setSuccess(false);
      setMessage(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={<>Remembered your password? <Link to="/" className="font-medium text-brand-700 hover:underline">Back to login</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={authInput}
          />
        </label>
        <AuthMessage message={message} success={success} />
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Mail className="h-4 w-4" />Send Reset Link</>}
        </button>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
