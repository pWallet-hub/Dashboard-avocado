import React, { useEffect, useState } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, User, Mail, Phone, Shield, Edit3, Save, X } from 'lucide-react';
import '../Styles/Admin.css';
import { getProfile, updateProfile, changePassword } from '../../services/authService';
import { listServiceRequests } from '../../services/serviceRequestsService';

function Admin() {
  const [adminProfile, setAdminProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  
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
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getProfile();
        setAdminProfile(profile);
        setEditedProfile(profile);
      } catch (error) {
        console.error(error);
        setError('There was an error fetching the profile data!');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Load service requests from localStorage
  useEffect(() => {
    const savedRequests = localStorage.getItem('farmerServiceRequests');
    if (savedRequests) {
      const parsedRequests = JSON.parse(savedRequests);
      setServiceRequests(parsedRequests);
    }
  }, []);

  const getPendingRequestsCount = () => {
    return serviceRequests.filter(request => request.status === 'pending').length;
  };

  const getApprovedRequestsCount = () => {
    return serviceRequests.filter(request => request.status === 'approved').length;
  };

  const getCompletedRequestsCount = () => {
    return serviceRequests.filter(request => request.status === 'completed').length;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleEditProfile = () => {
    setEditedProfile({ ...adminProfile });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await updateProfile({
        full_name: editedProfile.full_name,
        phone: editedProfile.phone
      });
      
      setAdminProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({ ...adminProfile });
    setIsEditing(false);
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
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
      await changePassword({
        currentPassword: oldPassword,
        newPassword: newPassword
      });

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
      await updateProfile({
        email: newEmail
      });

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
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Profile Information</h2>
                {!isEditing ? (
                  <button 
                    onClick={handleEditProfile}
                    className="flex items-center px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="flex items-center px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="profile-grid">
                <div className="profile-item">
                  <p className="profile-label">Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.full_name || ''}
                      onChange={(e) => handleProfileChange('full_name', e.target.value)}
                      className="profile-input"
                    />
                  ) : (
                    <p className="profile-value">{adminProfile.full_name || 'N/A'}</p>
                  )}
                </div>
                <div className="profile-item">
                  <p className="profile-label">Email</p>
                  <p className="profile-value">{adminProfile.email || 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <p className="profile-label">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="profile-input"
                    />
                  ) : (
                    <p className="profile-value">{adminProfile.phone || 'N/A'}</p>
                  )}
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
              <h2 className="card-title">Service Requests Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Pending</p>
                      <p className="text-2xl font-bold text-yellow-800">{getPendingRequestsCount()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Approved</p>
                      <p className="text-2xl font-bold text-green-800">{getApprovedRequestsCount()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Completed</p>
                      <p className="text-2xl font-bold text-blue-800">{getCompletedRequestsCount()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <a 
                  href="/dashboard/admin/service-requests" 
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View All Requests
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2>Update Password</h2>
              <button onClick={closePasswordModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
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
            <div className="flex justify-between items-center mb-4">
              <h2>Update Email</h2>
              <button onClick={closeEmailModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Email'}
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