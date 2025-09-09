import React, { useState, useRef } from 'react';
import { Bell, User, Settings, LogOut, Search, ChevronDown, Camera, X } from 'lucide-react';
import asr from '../../assets/image/pwallet-logo-new.png';
import UserProfile from '../Profile/UserProfile';
import SettingsModal from '../Settings/SettingsModal';
import './TopBar.css';
import { updateProfile } from '../../services/authService';

const TopBar = ({ onLogout, user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profilePicture, setProfilePicture] = useState(() => {
    // Get profile picture from user profile data if available
    return user?.profile?.picture || localStorage.getItem(`profilePic_${user?.email}`) || null;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // In a real implementation, we would upload the file to a server
      // For now, we'll just store it in localStorage and update the UI
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target.result;
        setProfilePicture(imageDataUrl);
        
        // Store in localStorage for persistence
        localStorage.setItem(`profilePic_${user?.email}`, imageDataUrl);
        
        // In a complete implementation, we would also update the user profile on the server
        // For now, we'll just update the local state
        try {
          // This would be the API call to update the profile picture on the server
          // await updateProfile({ profile: { picture: imageDataUrl } });
        } catch (err) {
          console.error('Failed to update profile picture on server:', err);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update the profile picture if it was changed
    if (updatedUser.profile?.picture) {
      setProfilePicture(updatedUser.profile.picture);
      localStorage.setItem(`profilePic_${user?.email}`, updatedUser.profile.picture);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-container">
        <div className="topbar-content">
          <div className="topbar-logo-section">
            <div className="flex items-center">
              <img
                src={asr}
                alt="Logo"
                className="topbar-logo"
              />
              <h1 className="topbar-title-full">
                Avocado Society of Rwanda
              </h1>
              <h1 className="topbar-title-mobile">
                ASR
              </h1>
            </div>
          </div>

          
          <div className="topbar-actions">
            <div className="relative">
              <button
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-avatar1 relative">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="profile-avatar-icon" />
                  )}
                </div>
                <span className="profile-name1">{user?.full_name || user?.name || 'N/A'}</span>
                <ChevronDown className="profile-chevron hidden w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="py-2">
                    <button 
                      onClick={triggerFileUpload}
                      className="profile-dropdown-item"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                    {uploadError && (
                      <div className="px-4 py-2 text-red-500 text-sm">
                        {uploadError}
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        setShowUserProfile(true);
                        setShowProfileMenu(false);
                      }}
                      className="profile-dropdown-item"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowSettings(true);
                        setShowProfileMenu(false);
                      }}
                      className="profile-dropdown-item"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="profile-dropdown-item logout-button"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* User Profile Modal */}
      <UserProfile 
        user={user}
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onUpdate={handleProfileUpdate}
      />
      
      {/* Settings Modal */}
      <SettingsModal 
        user={user}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default TopBar;