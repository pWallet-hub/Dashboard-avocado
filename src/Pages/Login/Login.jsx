import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file
import { IoIosLogIn } from "react-icons/io";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      navigate('/dashboard');
    } else {
      alert('Invalid username or password');
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
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button  type="submit"><IoIosLogIn />Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
