import React, { useState, useRef } from 'react';
import { Bell, User, Settings, LogOut, Search, ChevronDown, Camera } from 'lucide-react';
import asr from '../../assets/image/pwallet-logo-new.png';
import UserProfile from '../Profile/UserProfile';
import SettingsModal from '../Settings/SettingsModal';
import './TopBar.css';

const TopBar = ({ onLogout, user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profilePicture, setProfilePicture] = useState(() => {
    return localStorage.getItem(`profilePic_${user?.email}`) || null;
  });
  const fileInputRef = useRef(null);

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
                <span className="profile-name1">{user?.name || 'N/A'}</span>
                <ChevronDown className="profile-chevron hidden w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="py-2">
                    <button 
                      onClick={triggerFileUpload}
                      className="profile-dropdown-item"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
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