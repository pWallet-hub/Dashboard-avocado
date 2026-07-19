import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from "lucide-react";
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
          <h2 className="mb-5 text-2xl font-bold md:text-3xl">Forgot Password</h2>
          <p className="mb-4 text-sm text-center text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div className="w-full">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            {message && (
              <div className={`w-full p-2 mb-4 text-center rounded ${
                success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full p-3 text-white rounded ${loading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} flex justify-center items-center`}
            >
              {loading ? 'Sending...' : <><Mail className="mr-2 text-xl" />Send Reset Link</>}
            </button>
            <p className="mt-4 text-sm text-center text-gray-600">
              Remembered your password? <Link to="/" className="font-medium text-green-600 hover:underline">Back to login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
