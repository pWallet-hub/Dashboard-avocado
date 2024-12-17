import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/Admin.css';

function Admin() {
  const [adminProfile, setAdminProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Password update modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateError, setPasswordUpdateError] = useState('');
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // Email update modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateError, setEmailUpdateError] = useState('');
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);

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

  // Password Modal Methods
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
    // Reset modal state
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordUpdateError('');
    setPasswordUpdateSuccess(false);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordUpdateError('All fields are required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordUpdateError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordUpdateError('New password must be at least 8 characters long');
      return;
    }
    
    if (oldPassword === newPassword) {
      setPasswordUpdateError('New password must be different from current password');
      return;
    }



    try {
      const token = localStorage.getItem('token');
      const id = localStorage.getItem('id');
      
      await axios.post(
         `https://pwallet-api.onrender.com/api/auth/change-password/${id}`,  
        {
          oldPassword,
          newPassword,
          confirmNewPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Success handling
      setPasswordUpdateSuccess(true);
      setPasswordUpdateError('');
      
      // Optional: Close modal after a short delay
      setTimeout(() => {
        closePasswordModal();
      }, 2000);

    } catch (error) {
      console.error(error);
      setPasswordUpdateError(
        error.response?.data?.message || 
        'Failed to update password. Please try again.'
      );
    }
  };

  // Email Modal Methods
  const openEmailModal = () => {
    setIsEmailModalOpen(true);
    // Reset modal state
    setNewEmail('');
    setEmailUpdateError('');
    setEmailUpdateSuccess(false);
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!newEmail) {
      setEmailUpdateError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailUpdateError('Please enter a valid email address');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        'https://pwallet-api.onrender.com/api/auth/update-email', 
        {
          newEmail
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Success handling
      setEmailUpdateSuccess(true);
      setEmailUpdateError('');
      
      // Update local profile
      setAdminProfile(prev => ({...prev, email: newEmail}));
      
      // Close modal after a short delay
      setTimeout(() => {
        closeEmailModal();
      }, 2000);

    } catch (error) {
      console.error(error);
      setEmailUpdateError(
        error.response?.data?.message || 
        'Failed to update email. Please try again.'
      );
    }
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
                <button 
                  onClick={openPasswordModal} 
                  className="settings-button blue"
                >
                  Update Password
                </button>
                <button 
                  onClick={openEmailModal}
                  className="settings-button purple"
                >
                  Update Email
                </button>
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

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Password</h2>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              {passwordUpdateError && (
                <div className="error-message">{passwordUpdateError}</div>
              )}
              {passwordUpdateSuccess && (
                <div className="success-message">
                  Password updated successfully!
                </div>
              )}
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closePasswordModal} 
                  className="modal-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-confirm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Update Modal */}
      {isEmailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Email</h2>
            <form onSubmit={handleEmailUpdate}>
              <div className="form-group">
                <label>New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  required
                />
              </div>
              {emailUpdateError && (
                <div className="error-message">{emailUpdateError}</div>
              )}
              {emailUpdateSuccess && (
                <div className="success-message">
                  Email updated successfully!
                </div>
              )}
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeEmailModal} 
                  className="modal-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-confirm"
                >
                  Update Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;