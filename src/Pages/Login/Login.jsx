import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { IoIosLogIn } from "react-icons/io";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://applicanion-api.onrender.com/api/auth/login', {
        username,
        password
      });
      const token = response.data.token;
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error) {
      alert('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side - Welcome Back Section */}
        <div className="welcome-section">
          <h2>Urakaza neza kuri </h2>
          <h4>Avocado Society of Rwanda</h4>
          <p>Ibarura ry’abahinzi bafite ubutaka bakaba bifuza gutera no gukora Ubuhinzi bw’ avoka by’ umwuga</p>
        </div>
        {/* Right Side - Login Form Section */}
        <div className="login-form-section">
          <h2> Login Admin</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : <><IoIosLogIn />Sign In</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;