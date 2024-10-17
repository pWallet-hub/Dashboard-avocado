// TopBar.js
import { useState } from 'react';
import { Bell, User, Settings, LogOut, Search, ChevronDown } from 'lucide-react';

const TopBar = ({ onLogout, user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="relative z-20 bg-teal-700 shadow-md">
      {/* Main Topbar */}
      <div className="px-4 py-2 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img 
                src="/assets/image/LOGO_-_Avocado_Society_of_Rwanda.png"
                alt="Logo" 
                className="w-10 h-10 transition-transform duration-300 rounded-lg hover:scale-105"
              />
              <h1 className="hidden ml-3 text-lg font-semibold text-white md:block">
                Avocado Society of Rwanda
              </h1>
              <h1 className="ml-3 text-lg font-semibold text-white md:hidden">
                ASR
              </h1>
            </div>
          </div>

          {/* Right Section - Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications and Profile */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 text-white"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 h-8 overflow-hidden bg-teal-600 rounded-full">
                  <User className="w-full h-full p-1" />
                </div>
                <span className="hidden md:block">{user?.name || 'N/A'}</span>
                <ChevronDown className="hidden w-4 h-4 md:block" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 w-48 mt-2 overflow-hidden bg-white rounded-lg shadow-lg">
                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={onLogout}  // Trigger logout function
                      className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-red-600 transition-colors hover:bg-red-50"
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
