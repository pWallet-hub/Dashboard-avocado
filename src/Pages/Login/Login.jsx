import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosLogIn } from "react-icons/io";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      switch (username.toLowerCase()) {
        case 'admin':
          localStorage.setItem('role', 'admin');
          break;
        case 'agent':
          localStorage.setItem('role', 'agent');
          break;
        case 'farmer':
          localStorage.setItem('role', 'farmer');
          break;
        default:
          alert('Invalid username or password');
          break;
      }
      navigate('/dashboard');
    }, 1000); // Simulate a 1 second delay
  };
  
  //  const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await axios.post('https://applicanion-api.onrender.com/api/auth/login', {
  //       username,
  //       password
  //     });
  //     const { token, role } = response.data;
  //     localStorage.setItem('token', token);
  //     localStorage.setItem('role', role);

  //     switch (role) {
  //       case 'admin':
  //         navigate('/admin');
  //         break;
  //       case 'agent':
  //         navigate('/agent');
  //         break;
  //       case 'farmer':
  //         navigate('/farmer');
  //         break;
  //       default:
  //         navigate('/');
  //         break;
  //     }
  //   } catch (error) {
  //     alert('Invalid username or password');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-green-500">
      <div className="flex flex-col w-11/12 h-auto max-w-4xl overflow-hidden rounded-lg shadow-lg md:flex-row md:w-4/5 md:h-96">
        <div className="flex flex-col items-center justify-center w-full p-10 text-center md:w-1/2 bg-gradient-to-r from-green-600 to-green-500">
          <h2 className="mb-5 text-2xl text-white md:text-4xl">Urakaza neza kuri</h2>
          <h4 className="mb-5 text-xl text-white md:text-2xl">Avocado Society of Rwanda</h4>
          <p className="mb-10 text-sm text-white md:text-lg">
            Ibarura ry’abahinzi bafite ubutaka bakaba bifuza gutera no gukora Ubuhinzi bw’ avoka by’ umwuga
          </p>
        </div>
        <div className="flex flex-col items-center justify-center w-full p-10 bg-white md:w-1/2">
          <h2 className="mb-5 text-2xl font-bold md:text-3xl">Login Admin</h2>
          <form onSubmit={handleLogin} className="w-full">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 text-white rounded ${loading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} flex justify-center items-center`}
            >
              {loading ? 'Logging in...' : <><IoIosLogIn className="mr-2 text-2xl" />Sign In</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;