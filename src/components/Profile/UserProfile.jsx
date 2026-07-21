import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Shield, Edit2, Save, Phone, MapPin, 
  KeyRound, ShieldCheck, Sprout, Store, Briefcase, 
  CheckCircle2, AlertCircle, Loader2, Award
} from 'lucide-react';
import { updateProfile, changePassword, getProfile } from '../../services/authService';
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

  // Initialize immediately from prop
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        full_name: user.full_name || prev.full_name || '',
        email: user.email || prev.email || '',
        role: user.role || prev.role || '',
        phone: user.phone || prev.phone || '',
        profile: user.profile || prev.profile || {}
      }));
    }
  }, [user]);

  // Fetch authoritative profile upon opening
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    getProfile()
      .then((freshUser) => {
        if (!freshUser) return;
        setProfileData({
          full_name: freshUser.full_name || '',
          email: freshUser.email || '',
          role: freshUser.role || '',
          phone: freshUser.phone || '',
          profile: freshUser.profile || {}
        });
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setError('Failed to load the latest profile data');
      });
  }, [isOpen]);

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
      
      if (Object.keys(profileData.profile).length > 0) {
        updateData.profile = profileData.profile;
      }
      
      const updatedUser = await updateProfile(updateData);
      
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrator',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldCheck
        };
      case 'shop_manager':
        return {
          label: 'Shop Manager',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Store
        };
      case 'farmer':
        return {
          label: 'Avocado Farmer',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Sprout
        };
      case 'agent':
        return {
          label: 'Extension Agent',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Briefcase
        };
      default:
        return {
          label: role?.replace('_', ' ').toUpperCase() || 'User',
          bg: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: User
        };
    }
  };

  if (!isOpen) return null;

  const roleInfo = getRoleBadge(profileData.role);
  const RoleIcon = roleInfo.icon;

  const labelClasses = "block text-xs font-semibold text-[#344054] mb-1.5 font-['Poppins'] flex items-center gap-1.5";
  const inputClasses = `w-full border rounded-lg px-3.5 py-2.5 text-sm font-['Poppins'] transition-all duration-200 focus:outline-none ${
    isEditing
      ? 'bg-white border-[#d0d5dd] text-[#101828] focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 shadow-xs'
      : 'bg-[#f8fafc] border-[#eaecf0] text-[#475467] cursor-not-allowed'
  }`;

  return (
    <div className="fixed inset-0 bg-[#0c111d]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Poppins'] animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#eaecf0]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#eaecf0] bg-[#fcfcfd]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf3] text-[#15803d] flex items-center justify-center border border-[#d1fadf]">
              <User className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#101828]">Account Profile</h2>
              <p className="text-xs text-[#475467]">Manage your personal credentials & preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Header Avatar & Role Summary */}
          <div className="bg-[#fcfcfd] border border-[#eaecf0] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <ProfilePictureUploader 
              currentPicture={user?.profile?.picture}
              userId={user?.id}
              onUpload={(file) => {
                console.log('Uploading file:', file);
                setError(null);
              }}
              onDelete={() => {
                console.log('Deleting profile picture');
              }}
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#101828] truncate">
                {profileData.full_name || 'Anonymous User'}
              </h3>
              <p className="text-xs text-[#475467] mt-0.5 truncate">{profileData.email || 'No email specified'}</p>
              
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.bg}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span>{roleInfo.label}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eaecf0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
                Basic Profile Parameters
              </h4>
              <button
                type="button"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                  isEditing 
                    ? 'bg-[#15803d] hover:bg-[#166534] text-white' 
                    : 'bg-white border border-[#d0d5dd] hover:bg-gray-50 text-[#344054]'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isEditing ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    <span>Edit Information</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className={inputClasses}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full bg-[#f8fafc] border border-[#eaecf0] rounded-lg px-3.5 py-2.5 text-sm text-[#667085] cursor-not-allowed font-['Poppins']"
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  Assigned System Role
                </label>
                <input
                  type="text"
                  value={profileData.role?.replace('_', ' ').toUpperCase()}
                  disabled
                  className="w-full bg-[#f8fafc] border border-[#eaecf0] rounded-lg px-3.5 py-2.5 text-sm text-[#667085] cursor-not-allowed font-['Poppins'] font-medium"
                />
              </div>

              <div>
                <label className={labelClasses}>
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  Mobile Telephone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+250 7XX XXX XXX"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role Specific Meta Parameters */}
          {profileData.role && profileData.role !== 'admin' && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#15803d] pb-2 border-b border-[#eaecf0]">
                Role-Specific Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileData.role === 'farmer' && (
                  <>
                    <div>
                      <label className={labelClasses}>
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        Location / District
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.location || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('location', e.target.value)}
                        placeholder="Enter location"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>
                        <Sprout className="w-3.5 h-3.5 text-gray-400" />
                        Total Orchard Size
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.farm_size || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('farm_size', e.target.value)}
                        placeholder="e.g., 2.5 Hectares"
                        className={inputClasses}
                      />
                    </div>
                  </>
                )}

                {profileData.role === 'agent' && (
                  <>
                    <div>
                      <label className={labelClasses}>
                        <Award className="w-3.5 h-3.5 text-gray-400" />
                        Specialization Area
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.specialization || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('specialization', e.target.value)}
                        placeholder="Enter specialization"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        Professional Experience
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.experience || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('experience', e.target.value)}
                        placeholder="e.g., 5 Years Agronomy"
                        className={inputClasses}
                      />
                    </div>
                  </>
                )}

                {profileData.role === 'shop_manager' && (
                  <>
                    <div>
                      <label className={labelClasses}>
                        <Store className="w-3.5 h-3.5 text-gray-400" />
                        Market Shop Name
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.shop_name || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('shop_name', e.target.value)}
                        placeholder="Enter shop name"
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        Store Outlet Location
                      </label>
                      <input
                        type="text"
                        value={profileData.profile.shop_location || ''}
                        disabled={!isEditing}
                        onChange={(e) => handleProfileChange('shop_location', e.target.value)}
                        placeholder="Enter outlet location"
                        className={inputClasses}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Security & Change Password */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#15803d] pb-2 border-b border-[#eaecf0] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Security & Password
            </h4>

            <form onSubmit={handlePasswordChange} className="bg-[#fcfcfd] border border-[#eaecf0] rounded-xl p-5 space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-[#ecfdf3] border border-[#d1fadf] text-[#12b76a] rounded-lg text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#d0d5dd] rounded-lg px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all font-['Poppins'] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Min 8 characters"
                    className="w-full bg-white border border-[#d0d5dd] rounded-lg px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all font-['Poppins'] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Re-enter new password"
                    className="w-full bg-white border border-[#d0d5dd] rounded-lg px-3.5 py-2.5 text-sm text-[#101828] focus:outline-none focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/20 transition-all font-['Poppins'] shadow-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#eaecf0] bg-[#fcfcfd] flex justify-end">
          <button
            onClick={onClose}
            className="bg-white border border-[#d0d5dd] hover:bg-gray-50 text-[#344054] text-xs font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;