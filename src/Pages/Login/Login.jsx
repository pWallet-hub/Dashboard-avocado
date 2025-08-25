import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from "lucide-react";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
   const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Simulate loading delay
    setTimeout(() => {
      // Local demo auth: map credentials to roles
      const email = username.trim().toLowerCase();
      const credentials = {
        'admin@avocado.rw': { role: 'admin', requirePassword: 'password123' },
        'agent@avocado.rw': { role: 'agent', requirePassword: 'password123rw' },
        'peter@avocado.rw': { role: 'farmer', requirePassword: 'password123umurima' },
        'shopmanager@avocado.rw': { role: 'shop-manager', requirePassword: 'shop123' },
        'shop@avocado.rw': { role: 'shop-manager', requirePassword: null }
      };

      if (!email) {
        setMessage('Please enter your email');
        setLoading(false);
        return;
      }

      const match = credentials[email];
      if (!match) {
        setMessage('Invalid credentials. Use admin@avocado.rw, agent@avocado.rw, peter@avocado.rw, shopmanager@avocado.rw, or shop@avocado.rw');
        setLoading(false);
        return;
      }

      // All accounts now require password
      if (!password) {
        setMessage('Please enter your password');
        setLoading(false);
        return;
      }

      if (password !== match.requirePassword) {
        setMessage(`Incorrect password for ${email}`);
        setLoading(false);
        return;
      }

      // Persist session in localStorage for layout/sidebar
      localStorage.setItem('username', email);
      localStorage.setItem('role', match.role);
      localStorage.setItem('id', String(Date.now()));
      localStorage.setItem('token', 'demo-token');

      // If it's a shop manager, also store shop information
      if (match.role === 'shop-manager') {
        // You can customize this based on which shop they manage
        const shopInfo = {
          shopId: email === 'shopmanager@avocado.rw' ? 'shop-001' : 'shop-002',
          shopName: email === 'shopmanager@avocado.rw' ? 'Kigali Agricultural Shop' : 'Musanze Farm Supplies'
        };
        localStorage.setItem('shopInfo', JSON.stringify(shopInfo));
      }

      setMessage('Login successful! Redirecting...');
      // Redirect to role dashboard
      navigate(`/dashboard/${match.role}`);
      setLoading(false);
    }, 1000);
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
          
          {/* Demo Credentials Section */}
          <div className="mt-6 p-4 bg-green-700 bg-opacity-50 rounded-lg text-left">
            <h5 className="text-sm font-semibold text-white mb-2">Demo Credentials:</h5>
            <div className="text-xs text-green-100 space-y-1">
              <div>👤 <strong>Admin:</strong> admin@avocado.rw (password: password123)</div>
              <div>🏢 <strong>Agent:</strong> agent@avocado.rw (password: password123rw)</div>
              <div>🌾 <strong>Farmer:</strong> peter@avocado.rw (password: password123umurima)</div>
              <div>🏪 <strong>Shop Manager:</strong> shopmanager@avocado.rw (password: shop123)</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full p-10 bg-white md:w-1/2">
          <h2 className="mb-5 text-2xl font-bold md:text-3xl">Login</h2>
          <div className="w-full">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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