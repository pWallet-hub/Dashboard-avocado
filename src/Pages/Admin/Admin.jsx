import { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/Admin.css'

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
            Authorization: `Bearer ${token}`,
          },
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
    <div className="admin-container">
      <div className="admin-inner">
        <div className="admin-header">
          <h1 className="admin-title">Admin Profile</h1>
          <button onClick={handleLogout} className="admin-logout">
            Logout
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="admin-content">
            <div className="profile-card">
              <h2 className="card-title">Profile Information</h2>
              <div className="profile-grid">
                <div className="profile-item">
                  <p className="profile-label">Name</p>
                  <p className="profile-value">{adminProfile.username || 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <p className="profile-label">Email</p>
                  <p className="profile-value">{adminProfile.email || 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <p className="profile-label">Phone Number</p>
                  <p className="profile-value">{adminProfile.phoneNumber || 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <p className="profile-label">Role</p>
                  <p className="profile-value">{adminProfile.role || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h2 className="card-title">Account Settings</h2>
              <div className="settings-buttons">
                <button className="settings-button blue">Update Password</button>
                <button className="settings-button purple">Update Email</button>
              </div>
            </div>

            <div className="activity-card">
              <h2 className="card-title">Activity Log</h2>
              <div className="activity-placeholder">
                <p>Placeholder for activity log...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
