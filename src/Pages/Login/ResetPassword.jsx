import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { KeyRound } from "lucide-react";
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
          <h2 className="mb-5 text-2xl font-bold md:text-3xl">Reset Password</h2>
          <div className="w-full">
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading || !token}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !token}
              className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-green-500"
            />
            {message && (
              <div className="w-full p-2 mb-4 text-center rounded bg-red-100 text-red-700">
                {message}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading || !token}
              className={`w-full p-3 text-white rounded ${loading || !token ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} flex justify-center items-center`}
            >
              {loading ? 'Resetting...' : <><KeyRound className="mr-2 text-xl" />Reset Password</>}
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

export default ResetPassword;
