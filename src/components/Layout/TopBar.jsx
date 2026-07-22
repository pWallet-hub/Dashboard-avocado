import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Settings, LogOut, Search, ChevronDown, Camera, X } from 'lucide-react';
import asr from '../../assets/image/pwallet-logo-new.png';
import SettingsModal from '../Settings/SettingsModal';
import './TopBar.css';
import { updateProfile } from '../../services/authService';

const TopBar = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profilePicture, setProfilePicture] = useState(() => {
    return user?.profile?.picture || localStorage.getItem(`profilePic_${user?.email}`) || null;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target.result;
        setProfilePicture(imageDataUrl);
        localStorage.setItem(`profilePic_${user?.email}`, imageDataUrl);
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

  const handleNavigateProfile = () => {
    setShowProfileMenu(false);
    // Navigate based on user role
    const role = user?.role || localStorage.getItem('role');
    switch (role) {
      case 'admin':
        navigate('/dashboard/admin/profile');
        break;
      case 'agent':
        navigate('/dashboard/agent/profile');
        break;
      case 'farmer':
        navigate('/dashboard/farmer/profile');
        break;
      case 'shop_manager':
        navigate('/dashboard/shop-manager/profile');
        break;
      default:
        navigate('/dashboard');
        break;
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
                      onClick={handleNavigateProfile}
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