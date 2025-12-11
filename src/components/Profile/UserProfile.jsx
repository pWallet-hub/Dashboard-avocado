import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User, Mail, Shield, Calendar, Edit2, Save, Phone, MapPin } from 'lucide-react';
import authService from '../../services/authService';
import ProfilePictureUploader from './ProfilePictureUploader';

const UserProfile = ({ user, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    role: '',
    phone: '',
    profile: {}
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Initialize profile data when user prop changes
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || '',
        phone: user.phone || '',
        profile: user.profile || {}
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        full_name: profileData.full_name,
        phone: profileData.phone
      };
      
      // Only include profile data if it exists
      if (Object.keys(profileData.profile).length > 0) {
        updateData.profile = profileData.profile;
      }
      
      const updatedUser = await updateProfile(updateData);
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }
    
    setLoading(true);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess(true);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'shop_manager': return 'bg-blue-100 text-blue-800';
      case 'farmer': return 'bg-green-100 text-green-800';
      case 'agent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👤';
      case 'shop_manager': return '🏪';
      case 'farmer': return '🌾';
      case 'agent': return '🏢';
      default: return '👤';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <ProfilePictureUploader 
              currentPicture={user?.profile?.picture}
              userId={user?.id}
              onUpload={(file) => {
                // In a real implementation, this would upload the file to a server
                console.log('Uploading file:', file);
                // For now, we'll just show a success message
                setError(null);
              }}
              onDelete={() => {
                // Handle delete picture
                console.log('Deleting profile picture');
              }}
            />
            
            <div className="text-center mt-4">
              <h3 className="text-xl font-semibold text-gray-900">{profileData.full_name}</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(profileData.role)}`}>
                <span className="mr-1">{getRoleIcon(profileData.role)}</span>
                {profileData.role?.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={loading}
                  className="flex items-center px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Shield className="w-4 h-4 mr-2" />
                    Role
                  </label>
                  <input
                    type="text"
                    value={profileData.role?.replace('_', ' ').toUpperCase()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  />
                </div>

                {/* Role-specific fields */}
                {profileData.role === 'farmer' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.location || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="Enter location"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Farm Size
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.farm_size || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('farm_size', e.target.value)}
                        placeholder="Enter farm size"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                  </>
                )}

                {profileData.role === 'agent' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.specialization || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('specialization', e.target.value)}
                        placeholder="Enter specialization"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Experience
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.experience || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('experience', e.target.value)}
                        placeholder="Enter experience"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                  </>
                )}

                {profileData.role === 'shop_manager' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.shop_name || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('shop_name', e.target.value)}
                        placeholder="Enter shop name"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Shop Location
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.shop_location || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('shop_location', e.target.value)}
                        placeholder="Enter shop location"
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                          isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Change Password Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
              <form onSubmit={handlePasswordChange}>
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
                    Password changed successfully!
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Changing Password...
                        </div>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;