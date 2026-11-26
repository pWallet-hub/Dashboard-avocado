import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, Loader2 } from "lucide-react";
import AuthShell, { authInput, authButton, AuthMessage } from '../../components/Layout/AuthShell';
import { login } from '../../services/authService'; // Import the authService

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState(
    searchParams.get('resetSuccess')
      ? 'Password reset successful! Please log in with your new password.'
      : searchParams.get('registered') === 'pending'
        ? 'Registration received. An administrator will activate your account — you can sign in once it is approved.'
        : ''
  );
  const navigate = useNavigate();
  
  // Add form validation
  const validateForm = () => {
    if (!username || !password) {
      setMessage('Please fill in all fields');
      return false;
    }
    
    // Email address, or a phone number (farmers who activated without an email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+\d][\d\s\-()]{7,}$/;
    if (!emailRegex.test(username.trim()) && !phoneRegex.test(username.trim())) {
      setMessage('Enter your email address or phone number');
      return false;
    }
    
    // Password length validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Validate form before submitting
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      // Actual API call to authenticate user
      const credentials = {
        email: username,
        password: password
      };
      
      const response = await login(credentials);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Store role and other user data with correct keys
      localStorage.setItem('role', response.user.role);
      localStorage.setItem('id', response.user.id);
      localStorage.setItem('username', response.user.email); // Store email as username
      
      // If it's a shop manager, also store shop information
      if (response.user.role === 'shop_manager') {
        // In a real implementation, this would come from the user profile
        const shopInfo = {
          shopId: 'shop-001', // This would come from the API
          shopName: 'Kigali Agricultural Shop' // This would come from the API
        };
        localStorage.setItem('shopInfo', JSON.stringify(shopInfo));
      }
      
      setMessage('Login successful! Redirecting...');
      
      // Redirect to role dashboard with standardized format
      const rolePath = response.user.role.replace('_', '-');
      navigate(`/dashboard/${rolePath}`);
    } catch (error) {
      setMessage(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your dashboard to continue."
      footer={<>Don&apos;t have an account? <Link to="/register" className="font-medium text-brand-700 hover:underline">Create one</Link><span className="mx-2 text-slate-300">·</span>Registered by an agent? <Link to="/activate" className="font-medium text-brand-700 hover:underline">Activate your account</Link></>}
    >
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email or phone number</span>
          <input
            type="text"
            inputMode="email"
            autoComplete="username"
            placeholder="you@example.com or 0788 123 456"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className={authInput}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 flex items-center justify-between font-medium text-slate-700">
            Password
            <Link to="/forgot-password" className="text-xs font-medium text-brand-700 hover:underline">Forgot password?</Link>
          </span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password (required for all accounts)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={authInput}
          />
        </label>
        <AuthMessage message={message} success={message.includes('successful') || message.startsWith('Registration received')} />
        <button type="submit" disabled={loading} className={authButton}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Logging in...</> : <><LogIn className="h-4 w-4" />Sign In</>}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;