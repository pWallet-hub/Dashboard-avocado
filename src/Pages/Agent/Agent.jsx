import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function Agent() {
  const [agentProfile, setAgentProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const agentId = localStorage.getItem('id');
      try {
        const response = await axios.get(`https://pwallet-api.onrender.com/api/agents/profile/${agentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAgentProfile(response.data);
      } catch (error) {
        console.log(error);
        setError('There was an error fetching the profile data!');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-transparent text-gray-800 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text">
            Agent Profile
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <ClipLoader color="#3498db" loading={loading} size={50} />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Information Card */}
            <div className="p-6 transition-shadow duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
              <h2 className="pb-2 mb-6 text-xl font-bold text-gray-800 border-b border-gray-200">
                Profile Information
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold text-gray-800">{agentProfile.fullname || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{agentProfile.email || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-800">{agentProfile.phonenumber || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm text-gray-500">Province</p>
                  <p className="font-semibold text-gray-800">{agentProfile.province || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm text-gray-500">District</p>
                  <p className="font-semibold text-gray-800">{agentProfile.district || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="mb-1 text-sm text-gray-500">Sector</p>
                  <p className="font-semibold text-gray-800">{agentProfile.sector || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Account Settings Card */}
            <div className="p-6 transition-shadow duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
              <h2 className="pb-2 mb-6 text-xl font-bold text-gray-800 border-b border-gray-200">
                Account Settings
              </h2>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Update Password
                </button>
                <button className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Update Email
                </button>
              </div>
            </div>

            {/* Activity Log Card */}
            <div className="p-6 transition-shadow duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
              <h2 className="pb-2 mb-6 text-xl font-bold text-gray-800 border-b border-gray-200">
                Activity Log
              </h2>
              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-gray-600">Placeholder for activity log...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}