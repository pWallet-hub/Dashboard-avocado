import React, { useState, useRef } from 'react';
import { X, Camera, User, Mail, Shield, Calendar, Edit2, Save } from 'lucide-react';

const UserProfile = ({ user, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    joinDate: localStorage.getItem(`joinDate_${user?.email}`) || new Date().toLocaleDateString(),
    bio: localStorage.getItem(`bio_${user?.email}`) || '',
    phone: localStorage.getItem(`phone_${user?.email}`) || '',
    location: localStorage.getItem(`location_${user?.email}`) || ''
  });
  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem(`profilePic_${user?.email}`) || null;
  });
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(`bio_${user?.email}`, profileData.bio);
    localStorage.setItem(`phone_${user?.email}`, profileData.phone);
    localStorage.setItem(`location_${user?.email}`, profileData.location);
    localStorage.setItem(`joinDate_${user?.email}`, profileData.joinDate);
    
    setIsEditing(false);
  };

  const handleProfilePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setProfilePicture(imageDataUrl);
        localStorage.setItem(`profilePic_${user?.email}`, imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'shop-manager': return 'bg-blue-100 text-blue-800';
      case 'farmer': return 'bg-green-100 text-green-800';
      case 'agent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return '👤';
      case 'shop-manager': return '🏪';
      case 'farmer': return '🌾';
      case 'agent': return '🏢';
      default: return '👤';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto mx-auto">
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
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={triggerFileUpload}
                className="absolute bottom-2 right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>
            
            <div className="text-center mt-4">
              <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleColor(profileData.role)}`}>
                <span className="mr-1">{getRoleIcon(profileData.role)}</span>
                {profileData.role?.replace('-', ' ').toUpperCase()}
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
                  className="flex items-center px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                >
                  {isEditing ? (
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
                    value={profileData.role?.replace('-', ' ').toUpperCase()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Join Date
                  </label>
                  <input
                    type="text"
                    value={profileData.joinDate}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
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

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                      isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md resize-none ${
                      isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {localStorage.getItem(`loginCount_${user?.email}`) || '1'}
                  </div>
                  <div className="text-sm text-gray-600">Total Logins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {profileData.role === 'farmer' ? '12' : profileData.role === 'shop-manager' ? '45' : '8'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {profileData.role === 'farmer' ? 'Products' : profileData.role === 'shop-manager' ? 'Orders' : 'Tasks'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">Active</div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.floor((Date.now() - new Date(profileData.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">Days Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
