import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Admin() {
  const [adminProfile, setAdminProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const id = localStorage.getItem('id');
      try {
        const response = await axios.get(`https://pwallet-api.onrender.com/api/auth/admin-profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAdminProfile(response.data);
      } catch (error) {
        console.error(error);
        setError('There was an error fetching the profile data!');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Admin Profile</h1>
      {loading ? (
        <p>Loading profile...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Profile Information</h2>
            <p><strong>Name:</strong> {adminProfile.username || 'N/A'}</p>
            <p><strong>Email:</strong> {adminProfile.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {adminProfile.phoneNumber || 'N/A'}</p>
            <p><strong>Role:</strong> {adminProfile.role || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Account Settings</h2>
            <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Update Password</button>
            <button className="px-4 py-2 ml-4 text-white bg-blue-500 rounded hover:bg-blue-600">Update Email</button>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Activity Log</h2>
            <p>Placeholder for activity log...</p>
          </div>
          <button className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Admin;