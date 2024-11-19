import React, { useState } from 'react';
import { Bell, User, Settings, LogOut, Search, ChevronDown } from 'lucide-react';
import asr from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import './TopBar.css';

const TopBar = ({ onLogout, user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
                <div className="profile-avatar1">
                  <User className="profile-avatar-icon" />
                </div>
                <span className="profile-name1">{user?.name || 'N/A'}</span>
                <ChevronDown className="profile-chevron hidden w-4 h-4" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="py-2">
                    <button className="profile-dropdown-item">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="profile-dropdown-item">
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
    </div>
  );
};

export default TopBar;