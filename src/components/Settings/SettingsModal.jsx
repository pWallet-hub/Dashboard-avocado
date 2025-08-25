import React, { useState } from 'react';
import { 
  X, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Moon, 
  Sun, 
  Monitor,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Volume2,
  VolumeX
} from 'lucide-react';

const SettingsModal = ({ user, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem(`settings_${user?.email}`);
    return savedSettings ? JSON.parse(savedSettings) : {
      // Account Settings
      language: 'en',
      timezone: 'Africa/Kigali',
      
      // Appearance Settings
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
      
      // Notification Settings
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      marketingEmails: false,
      orderUpdates: true,
      systemAlerts: true,
      
      // Privacy Settings
      profileVisibility: 'public',
      showOnlineStatus: true,
      dataCollection: true,
      
      // Security Settings
      twoFactorAuth: false,
      sessionTimeout: '30',
      loginAlerts: true
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem(`settings_${user?.email}`, JSON.stringify(settings));
    // Show success message or toast
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (!isOpen) return null;

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Africa/Kigali">Africa/Kigali (GMT+2)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={() => {
              if (newPassword === confirmPassword && newPassword.length >= 6) {
                alert('Password updated successfully!');
                setNewPassword('');
                setConfirmPassword('');
              } else {
                alert('Passwords do not match or are too short (minimum 6 characters)');
              }
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('theme', value)}
              className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                settings.theme === value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Compact Mode</label>
              <p className="text-xs text-gray-500">Reduce spacing and padding</p>
            </div>
            <button
              onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.compactMode ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser notifications', icon: Smartphone },
            { key: 'soundEnabled', label: 'Sound Notifications', desc: 'Play sound for notifications', icon: Volume2 },
            { key: 'orderUpdates', label: 'Order Updates', desc: 'Notifications about order status changes', icon: Bell },
            { key: 'systemAlerts', label: 'System Alerts', desc: 'Important system notifications', icon: Bell },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional and marketing content', icon: Mail }
          ].map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">{label}</label>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange(key, !settings[key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[key] ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="contacts">Contacts Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Show Online Status</label>
              <p className="text-xs text-gray-500">Let others see when you're online</p>
            </div>
            <button
              onClick={() => handleSettingChange('showOnlineStatus', !settings.showOnlineStatus)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showOnlineStatus ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Data Collection</label>
              <p className="text-xs text-gray-500">Allow analytics and usage data collection</p>
            </div>
            <button
              onClick={() => handleSettingChange('dataCollection', !settings.dataCollection)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataCollection ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataCollection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-xs text-gray-500">Add an extra layer of security</p>
            </div>
            <button
              onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Login Alerts</label>
              <p className="text-xs text-gray-500">Get notified of new login attempts</p>
            </div>
            <button
              onClick={() => handleSettingChange('loginAlerts', !settings.loginAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.loginAlerts ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account': return renderAccountSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'security': return renderSecuritySettings();
      default: return renderAccountSettings();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(80vh-120px)]">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 p-3 overflow-y-auto">
            <nav className="space-y-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center px-2 py-2 text-left rounded-md transition-colors text-sm ${
                    activeTab === id
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-2xl">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
