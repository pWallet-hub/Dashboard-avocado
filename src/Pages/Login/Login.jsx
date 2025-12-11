import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from "lucide-react";
import { useAuth } from '../../hooks/useAuth.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Add form validation
  const validateForm = () => {
    if (!email || !password) {
      setMessage('Please fill in all fields');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
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
      const result = await login(email, password);
      
      if (result.success) {
        setMessage('Login successful! Redirecting...');
        
        // Redirect based on user role
        const user = result.user;
        switch (user.role) {
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'agent':
            navigate('/dashboard/agent');
            break;
          case 'farmer':
            navigate('/dashboard/farmer');
            break;
          case 'shop_manager':
            navigate('/dashboard/shop-manager');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-green-500">
      <div className="flex flex-col w-11/12 h-auto max-w-4xl overflow-hidden rounded-lg shadow-lg md:flex-row md:w-4/5 md:h-auto">
        <div className="flex flex-col items-center justify-center w-full p-10 text-center md:w-1/2 bg-gradient-to-r from-green-600 to-green-500">
          <h2 className="mb-5 text-2xl text-white md:text-4xl">Urakaza neza kuri</h2>
          <h4 className="mb-5 text-xl text-white md:text-2xl">Avocado Society of Rwanda</h4>
          <p className="mb-10 text-sm text-white md:text-lg">
            Ibarura ry'abahinzi bafite ubutaka bakaba bifuza gutera no gukora Ubuhinzi bw' avoka by' umwuga
          </p>
          
         
        </div>
        <div className="flex flex-col items-center justify-center w-full p-10 bg-white md:w-1/2">
          <h2 className="mb-5 text-2xl font-bold md:text-3xl">Login</h2>
          <div className="w-full">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            <input
              type="password"
              placeholder="Password (required for all accounts)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            {message && (
              <div className={`w-full p-2 mb-4 text-center rounded ${
                message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full p-3 text-white rounded ${loading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} flex justify-center items-center`}
            >
              {loading ? 'Logging in...' : <><LogIn className="mr-2 text-xl" />Sign In</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;