import React, { useEffect, useState } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, User, Mail, Phone, Shield, Edit3, Save, X, Truck } from 'lucide-react';
import '../Styles/Admin.css';
import { getProfile, updateProfile, changePassword } from '../../services/authService';
import { listServiceRequests, listHarvestRequests } from '../../services/serviceRequestsService';

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
        console.log('🚀 Starting to fetch both API endpoints...');
        
        // Fetch both endpoints in parallel with better error handling
        const [propertyEvalResponse, harvestResponse] = await Promise.allSettled([
          listServiceRequests().catch(error => {
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
          console.log('✅ Property evaluation requests loaded:', propertyRequests.length);
        } else {
          console.error('❌ Property evaluation requests failed:', propertyEvalResponse.reason);
        }

        // Process Harvest Requests with improved structure handling
        let harvestData = [];
        if (harvestResponse.status === 'fulfilled') {
          const harvestResult = harvestResponse.value;
          
          // Handle the API response structure: { success: true, message: "...", data: [...] }
          if (harvestResult?.success && Array.isArray(harvestResult.data)) {
            harvestData = harvestResult.data;
            console.log('✅ Harvest requests loaded from success response:', harvestData.length);
          } else if (Array.isArray(harvestResult?.data)) {
            harvestData = harvestResult.data;
            console.log('✅ Harvest requests loaded from data property:', harvestData.length);
          } else if (Array.isArray(harvestResult)) {
            harvestData = harvestResult;
            console.log('✅ Harvest requests loaded as direct array:', harvestData.length);
          } else {
            console.warn('⚠️ Unknown harvest response structure:', harvestResult);
            harvestData = [];
          }
        } else {
          console.error('❌ Harvest requests failed:', harvestResponse.reason);
        }

        // Update state
        setServiceRequests(propertyRequests);
        setHarvestRequests(harvestData);

        const totalRequests = propertyRequests.length + harvestData.length;
        console.log('📈 Total requests loaded:', {
          propertyEvaluations: propertyRequests.length,
          harvestRequests: harvestData.length,
          total: totalRequests
        });

        // Only use localStorage fallback if both endpoints return empty
        if (totalRequests === 0) {
          console.log('📁 No API data found, checking localStorage fallback...');
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
                console.log('📁 Using localStorage fallback:', parsedRequests.length, 'requests');
              }
            } catch (parseError) {
              console.error('❌ Error parsing localStorage requests:', parseError);
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Critical error fetching service requests:', error);
        setRequestsError(`Failed to fetch service requests: ${error.message}`);
      } finally {
        setRequestsLoading(false);
        console.log('🏁 Data fetching completed');
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
              
              {requestsLoading ? (
                <div className="loading-spinner text-center mb-4">Loading requests...</div>
              ) : requestsError ? (
                <div className="error-message mb-4">
                  <p>{requestsError}</p>
                </div>
              ) : null}

              {/* Debug Info - Remove in production */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4 text-xs">
                <div className="flex justify-between items-center mb-2">
                  <p><strong>Debug Info:</strong></p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Refresh Data
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p><strong>API Status:</strong></p>
                    <p>Loading: {requestsLoading ? 'Yes' : 'No'}</p>
                    <p>Error: {requestsError || 'None'}</p>
                    <p>Property Requests: {serviceRequests.length}</p>
                    <p>Harvest Requests: {harvestRequests.length}</p>
                  </div>
                  <div>
                    <p><strong>Test Endpoints:</strong></p>
                    <div className="space-y-1">
                      <button 
                        onClick={async () => {
                          try {
                            console.log('Testing harvest endpoint...');
                            const result = await listHarvestRequests();
                            console.log('Harvest test raw result:', result);
                            console.log('Result type:', typeof result);
                            console.log('Result keys:', Object.keys(result || {}));
                            console.log('Result.success:', result?.success);
                            console.log('Result.data:', result?.data);
                            console.log('Result.data length:', result?.data?.length);
                            
                            let message = 'Harvest Endpoint Test Results:\n\n';
                            message += `Response Type: ${typeof result}\n`;
                            message += `Has Success: ${result?.success !== undefined}\n`;
                            message += `Success Value: ${result?.success}\n`;
                            message += `Has Data: ${result?.data !== undefined}\n`;
                            message += `Data is Array: ${Array.isArray(result?.data)}\n`;
                            message += `Data Length: ${result?.data?.length || 0}\n`;
                            message += `Message: ${result?.message}\n\n`;
                            
                            if (result?.data?.[0]) {
                              message += 'First Item Details:\n';
                              message += `ID: ${result.data[0].id}\n`;
                              message += `Farmer: ${result.data[0].farmer_id?.full_name}\n`;
                              message += `Service Type: ${result.data[0].service_type}\n`;
                              message += `Status: ${result.data[0].status}\n`;
                              message += `Trees: ${result.data[0].harvest_details?.trees_to_harvest}\n`;
                              message += `Workers: ${result.data[0].harvest_details?.workers_needed}\n`;
                            }
                            
                            alert(message);
                            
                            // Also try to manually set the data for testing
                            if (result?.data && Array.isArray(result.data)) {
                              console.log('Manual test: Setting harvest data directly');
                              setHarvestRequests(result.data);
                              alert('Manually set harvest data for testing! Check if it appears now.');
                            }
                            
                          } catch (error) {
                            console.error('Harvest test error:', error);
                            let errorMsg = `Harvest Endpoint Error:\n\n`;
                            errorMsg += `Message: ${error.message}\n`;
                            errorMsg += `Status: ${error.response?.status}\n`;
                            errorMsg += `Status Text: ${error.response?.statusText}\n`;
                            if (error.response?.data) {
                              errorMsg += `Response Data: ${JSON.stringify(error.response.data, null, 2)}`;
                            }
                            alert(errorMsg);
                          }
                        }}
                        className="block w-full px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                      >
                        Test Harvest API + Manual Set
                      </button>
                      
                      <button 
                        onClick={() => {
                          // Create test harvest data with your exact structure
                          const testHarvestData = [
                            {
                              "id": "68d693276b859afd25ad314d",
                              "farmer_id": {
                                "_id": "68cc4e5a2a37e6f5f0230c2c",
                                "email": "johnm@example.com",
                                "full_name": "John Doe",
                                "phone": "+1234567890",
                                "id": "68cc4e5a2a37e6f5f0230c2c"
                              },
                              "service_type": "harvest",
                              "title": "Harvest Request",
                              "description": "Harvest request for 150 trees requiring 5 workers",
                              "request_number": "HRV-1758892839299-T49Q",
                              "status": "pending",
                              "priority": "medium",
                              "requested_date": "2025-09-26T13:20:39.299Z",
                              "location": {
                                "coordinates": {
                                  "latitude": -1.4995,
                                  "longitude": 29.6346
                                },
                                "province": "Eastern Province",
                                "district": "Gatsibo",
                                "sector": "Kageyo",
                                "cell": "Karangazi",
                                "village": "Nyagatare"
                              },
                              "notes": "Ready for harvest. Trees are at full maturity with good fruit quality. Request for 150 trees requiring 5 workers.",
                              "harvest_details": {
                                "workers_needed": 5,
                                "equipment_needed": [
                                  "Tractors",
                                  "Harvesters",
                                  "Transport Vehicles",
                                  "Storage Containers"
                                ],
                                "trees_to_harvest": 150,
                                "harvest_date_from": "2024-01-15T00:00:00.000Z",
                                "harvest_date_to": "2024-01-18T00:00:00.000Z"
                              },
                              "created_at": "2025-09-26T13:20:39.299Z"
                            }
                          ];
                          
                          console.log('Setting test harvest data:', testHarvestData);
                          setHarvestRequests(testHarvestData);
                          alert('Test harvest data has been set! Check if the harvest requests appear in the dashboard.');
                        }}
                        className="block w-full px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Set Test Harvest Data
                      </button>
                      
                      <button 
                        onClick={async () => {
                          try {
                            console.log('Testing property eval endpoint...');
                            const result = await listServiceRequests();
                            console.log('Property eval test result:', result);
                            let message = 'Property Eval Endpoint Test:\n\n';
                            message += `Type: ${typeof result}\n`;
                            message += `Is Array: ${Array.isArray(result)}\n`;
                            message += `Length: ${result?.length || 0}\n`;
                            if (result?.[0]) {
                              message += `\nFirst Item: ${JSON.stringify(result[0], null, 2).substring(0, 200)}...`;
                            }
                            alert(message);
                          } catch (error) {
                            console.error('Property eval test error:', error);
                            alert(`Property eval endpoint error: ${error.message}`);
                          }
                        }}
                        className="block w-full px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
                      >
                        Test Property API
                      </button>
                    </div>
                  </div>
                </div>
                
                {serviceRequests.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium">Property Evaluation Sample</summary>
                    <pre className="bg-white p-2 rounded text-xs overflow-x-auto max-h-32 mt-2">
                      {JSON.stringify(serviceRequests[0], null, 2)}
                    </pre>
                  </details>
                )}
                
                {harvestRequests.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer font-medium">Harvest Request Sample</summary>
                    <pre className="bg-white p-2 rounded text-xs overflow-x-auto max-h-32 mt-2">
                      {JSON.stringify(harvestRequests[0], null, 2)}
                    </pre>
                  </details>
                )}
                
                {harvestRequests.length === 0 && serviceRequests.length === 0 && !requestsLoading && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-700 font-medium">No data found!</p>
                    <p className="text-yellow-600 text-xs mt-1">
                      1. Check browser console for API call details<br/>
                      2. Verify your endpoints are working<br/>
                      3. Check authentication tokens<br/>
                      4. Use test buttons above to debug
                    </p>
                  </div>
                )}
              </div>

              {/* Main Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

              {/* Service Type Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClipboardList className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Property Evaluations</p>
                      <p className="text-2xl font-bold text-purple-800">{getPropertyEvalRequestsCount()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Truck className="w-8 h-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Harvest Requests</p>
                      <p className="text-2xl font-bold text-orange-800">{getHarvestRequestsCount()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Harvest Requests Details */}
              {harvestRequests.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3">Recent Harvest Requests</h3>
                  <div className="space-y-3">
                    {harvestRequests.slice(0, 3).map((request, index) => (
                      <div key={request.id || index} className="bg-white rounded-lg p-3 border border-orange-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">
                              {request.farmer_id?.full_name || 'Unknown Farmer'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Request: {request.request_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              Trees to Harvest: {request.harvest_details?.trees_to_harvest}
                            </p>
                            <p className="text-sm text-gray-600">
                              Workers Needed: {request.harvest_details?.workers_needed}
                            </p>
                            <p className="text-sm text-gray-600">
                              Location: {request.location?.village}, {request.location?.district}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.priority}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Requests Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">Total Service Requests</p>
                    <p className="text-3xl font-bold text-gray-800">{getTotalRequestsCount()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="/dashboard/admin/service-requests" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View All Requests
                </a>
                <a 
                  href="/dashboard/admin/harvest-requests" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Manage Harvest Requests
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