import React, { useEffect, useState } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, User, Mail, Phone, Shield, Edit3, Save, X, Truck } from 'lucide-react';
import '../Styles/Admin.css';
import authService from '../../services/authService';
import { getPestManagementRequests, getHarvestRequests, getPropertyEvaluationRequests } from '../../services/serviceRequestsService';

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
  
  // Service requests state
  const [serviceRequests, setServiceRequests] = useState([]);
  const [harvestRequests, setHarvestRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

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

  // Load service requests from API and localStorage
  useEffect(() => {
    const fetchServiceRequests = async () => {
      setRequestsLoading(true);
      setRequestsError(null);
      
      try {
        // Fetch both endpoints in parallel with better error handling
        const [propertyEvalResponse, harvestResponse] = await Promise.allSettled([
          getPestManagementRequests().catch(error => {
            console.warn('Property evaluation requests failed:', error);
            return [];
          }),
          listHarvestRequests().catch(error => {
            console.warn('Harvest requests failed:', error);
            return { success: false, data: [] };
          })
        ]);

        // Process Property Evaluation Requests
        let propertyRequests = [];
        if (propertyEvalResponse.status === 'fulfilled') {
          const propData = propertyEvalResponse.value;
          propertyRequests = Array.isArray(propData) ? propData : (propData?.data || []);
        } else {
          console.error('Property evaluation requests failed:', propertyEvalResponse.reason);
        }

        // Process Harvest Requests with improved structure handling
        let harvestData = [];
        if (harvestResponse.status === 'fulfilled') {
          const harvestResult = harvestResponse.value;
          
          // Handle the API response structure: { success: true, message: "...", data: [...] }
          if (harvestResult?.success && Array.isArray(harvestResult.data)) {
            harvestData = harvestResult.data;
          } else if (Array.isArray(harvestResult?.data)) {
            harvestData = harvestResult.data;
          } else if (Array.isArray(harvestResult)) {
            harvestData = harvestResult;
          } else {
            console.warn('Unknown harvest response structure:', harvestResult);
            harvestData = [];
          }
        } else {
          console.error('Harvest requests failed:', harvestResponse.reason);
        }

        // Update state
        setServiceRequests(propertyRequests);
        setHarvestRequests(harvestData);

        const totalRequests = propertyRequests.length + harvestData.length;

        // Only use localStorage fallback if both endpoints return empty
        if (totalRequests === 0) {
          const savedRequests = localStorage.getItem('farmerServiceRequests');
          if (savedRequests) {
            try {
              const parsedRequests = JSON.parse(savedRequests);
              if (Array.isArray(parsedRequests) && parsedRequests.length > 0) {
                // Separate by type if possible
                const propEval = parsedRequests.filter(req => req.service_type === 'property_evaluation' || req.type === 'Property Evaluation');
                const harvest = parsedRequests.filter(req => req.service_type === 'harvest' || req.type === 'Harvesting Day');
                
                setServiceRequests(propEval.length > 0 ? propEval : parsedRequests);
                setHarvestRequests(harvest);
              }
            } catch (parseError) {
              console.error('Error parsing localStorage requests:', parseError);
            }
          }
        }
        
      } catch (error) {
        console.error('Critical error fetching service requests:', error);
        setRequestsError(`Failed to fetch service requests: ${error.message}`);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchServiceRequests();
  }, []);

  // Service request statistics functions
  const getPendingRequestsCount = () => {
    const propertyEvalPending = serviceRequests.filter(request => 
      request.status === 'pending'
    ).length;
    
    const harvestPending = harvestRequests.filter(request => 
      request.status === 'pending'
    ).length;
    
    return propertyEvalPending + harvestPending;
  };

  const getApprovedRequestsCount = () => {
    const propertyEvalApproved = serviceRequests.filter(request => 
      request.status === 'approved'
    ).length;
    
    const harvestApproved = harvestRequests.filter(request => 
      request.status === 'approved'
    ).length;
    
    return propertyEvalApproved + harvestApproved;
  };

  const getCompletedRequestsCount = () => {
    const propertyEvalCompleted = serviceRequests.filter(request => 
      request.status === 'completed'
    ).length;
    
    const harvestCompleted = harvestRequests.filter(request => 
      request.status === 'completed'
    ).length;
    
    return propertyEvalCompleted + harvestCompleted;
  };

  const getHarvestRequestsCount = () => {
    return harvestRequests.length;
  };

  const getPropertyEvalRequestsCount = () => {
    return serviceRequests.length;
  };

  const getTotalRequestsCount = () => {
    return serviceRequests.length + harvestRequests.length;
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
          <h1 className="admin-title">Admin Dashboard</h1>
          <button onClick={handleLogout} className="admin-logout">
            Logout
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <XCircle className="w-6 h-6 mr-2 text-red-500" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="admin-content">
            <div className="profile-card">
              <div className="card-headers">
                <h2 className="card-title1">Profile Information</h2>
                {!isEditing ? (
                  <button 
                    onClick={handleEditProfile}
                    className="edit-button"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="save-button"
                    >
                      {loading ? (
                        <div className="spinner"></div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="cancel-button"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              <div className="profile-grid">
                <div className="profile-item">
                  <div className="profile-label">
                    <User className="w-4 h-4 mr-2" />
                    Name
                  </div>
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
                  <div className="profile-label">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </div>
                  <p className="profile-value">{adminProfile.email || 'N/A'}</p>
                </div>
                <div className="profile-item">
                  <div className="profile-label">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </div>
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
                  <div className="profile-label">
                    <Shield className="w-4 h-4 mr-2" />
                    Role
                  </div>
                  <p className="profile-value">{adminProfile.role || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h2 className="card-title1">Account Settings</h2>
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
              <h2 className="card-title1">Service Requests Overview</h2>
              
              {requestsLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading requests...</p>
                </div>
              ) : requestsError ? (
                <div className="error-message">
                  <XCircle className="w-6 h-6 mr-2 text-red-500" />
                  <p>{requestsError}</p>
                </div>
              ) : null}

              <div className="stats-grid">
                <div className="stat-card pending">
                  <Clock className="stat-icon" />
                  <div>
                    <p className="stat-label">Pending</p>
                    <p className="stat-value">{getPendingRequestsCount()}</p>
                  </div>
                </div>
                <div className="stat-card approved">
                  <CheckCircle className="stat-icon" />
                  <div>
                    <p className="stat-label">Approved</p>
                    <p className="stat-value">{getApprovedRequestsCount()}</p>
                  </div>
                </div>
                <div className="stat-card completed">
                  <ClipboardList className="stat-icon" />
                  <div>
                    <p className="stat-label">Completed</p>
                    <p className="stat-value">{getCompletedRequestsCount()}</p>
                  </div>
                </div>
              </div>

              <div className="service-breakdown">
                <div className="stat-card property">
                  <ClipboardList className="stat-icon" />
                  <div>
                    <p className="stat-label">Property Evaluations</p>
                    <p className="stat-value">{getPropertyEvalRequestsCount()}</p>
                  </div>
                </div>
                <div className="stat-card harvest">
                  <Truck className="stat-icon" />
                  <div>
                    <p className="stat-label">Harvest Requests</p>
                    <p className="stat-value">{getHarvestRequestsCount()}</p>
                  </div>
                </div>
              </div>

              {harvestRequests.length > 0 && (
                <div className="harvest-requests">
                  <h3 className="section-title">Recent Harvest Requests</h3>
                  <div className="requests-list">
                    {harvestRequests.slice(0, 3).map((request, index) => (
                      <div key={request.id || index} className="request-card">
                        <div className="request-details">
                          <p className="request-title">
                            {request.farmer_id?.full_name || 'Unknown Farmer'}
                          </p>
                          <p className="request-info">
                            Request: {request.request_number}
                          </p>
                          <p className="request-info">
                            Trees to Harvest: {request.harvest_details?.trees_to_harvest}
                          </p>
                          <p className="request-info">
                            Workers Needed: {request.harvest_details?.workers_needed}
                          </p>
                          <p className="request-info">
                            Location: {request.location?.village}, {request.location?.district}
                          </p>
                        </div>
                        <div className="request-status">
                          <span className={`status-badge ${request.status}`}>
                            {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                          </span>
                          <p className="request-priority">{request.priority}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="total-requests">
                <p className="total-label">Total Service Requests</p>
                <p className="total-value">{getTotalRequestsCount()}</p>
              </div>

              <div className="action-buttons">
                <a 
                  href="/dashboard/admin/service-requests" 
                  className="action-button view-all"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View All Requests
                </a>
                <a 
                  href="/dashboard/admin/harvest-requests" 
                  className="action-button manage-harvest"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Manage Harvest Requests
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Password</h2>
              <button onClick={closePasswordModal} className="modal-close">
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
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="form-input"
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

      {isEmailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Email</h2>
              <button onClick={closeEmailModal} className="modal-close">
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
                  className="form-input"
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