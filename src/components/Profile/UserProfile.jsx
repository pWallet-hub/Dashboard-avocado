import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Edit2, Save, Phone, MapPin, 
  KeyRound, ShieldCheck, Sprout, Store, Briefcase, 
  CheckCircle2, AlertCircle, Loader2, Award, ArrowLeft,
  Camera, Lock, Copy, Check
} from 'lucide-react';
import { updateProfile, changePassword, getProfile } from '../../services/authService';
import ProfilePictureUploader from './ProfilePictureUploader';

const UserProfile = ({ user: initialUser, onClose, onUpdate }) => {
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
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize immediately from prop
  useEffect(() => {
    if (initialUser) {
      setProfileData({
        full_name: initialUser.full_name || '',
        email: initialUser.email || '',
        role: initialUser.role || '',
        phone: initialUser.phone || '',
        profile: initialUser.profile || {}
      });
    }
  }, [initialUser]);

  // Fetch authoritative profile data on mount
  useEffect(() => {
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
        setError('Failed to load authoritative profile records');
      });
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg('');
    
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
      
      setSuccessMsg('Profile settings updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile settings');
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Derive First and Last Name for split input matching reference UI
  const nameParts = (profileData.full_name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const handleNameSplitChange = (type, val) => {
    let updatedFullName = '';
    if (type === 'first') {
      updatedFullName = `${val} ${lastName}`.trim();
    } else {
      updatedFullName = `${firstName} ${val}`.trim();
    }
    handleInputChange('full_name', updatedFullName);
  };

  return (
    <div className="w-full h-full min-h-full overflow-y-auto bg-[#eef2f6] text-[#334155] font-['Poppins'] pb-24">
      
      {/* ── HERO TOP DARK GREEN COVER BANNER ── */}
      <div className="w-full h-56 bg-gradient-to-r from-[#1a3808] via-[#234a0a] to-[#142e06] relative px-6 pt-6 flex justify-between items-start">
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer border border-white/20">
          <Camera className="w-4 h-4" />
          <span>Change Cover</span>
        </button>
      </div>

      {/* ── MAIN CONTENT CONTAINER (FLOATING CARDS OVER BANNER) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 space-y-6">
        
        {/* Global Feedback Banners */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium shadow-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-3.5 bg-[#f2f8ed] border border-[#c4e1b2] text-[#1a3808] rounded-xl text-xs font-medium shadow-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT COLUMN: STICKY PROFILE CARD & JUMP NAVIGATION ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center border-b border-[#f1f5f9]">
                
                {/* Avatar Uploader Wrapper */}
                <div className="relative mb-3">
                  <ProfilePictureUploader 
                    currentPicture={initialUser?.profile?.picture}
                    userId={initialUser?.id}
                    onUpload={() => setError(null)}
                    onDelete={() => console.log('Deleted picture')}
                  />
                </div>

                <h2 className="text-lg font-bold text-[#0f172a]">
                  {profileData.full_name || 'Anonymous User'}
                </h2>
                <p className="text-xs text-[#64748b] font-medium mt-0.5">
                  {profileData.role ? profileData.role.replace('_', ' ').toUpperCase() : 'System Member'}
                </p>
              </div>

              {/* Quick Metrics List */}
              <div className="divide-y divide-[#f1f5f9] text-xs">
                <div className="p-4 flex items-center justify-between">
                  <span className="text-[#64748b] font-medium">Assigned Domain</span>
                  <span className="font-bold text-[#1a3808] capitalize">{profileData.role || 'Member'}</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <span className="text-[#64748b] font-medium">Account Status</span>
                  <span className="font-bold text-[#1a3808] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <span className="text-[#64748b] font-medium">Profile Score</span>
                  <span className="font-bold text-[#334155]">100% Complete</span>
                </div>
              </div>

              {/* Action Link Box */}
              <div className="p-4 space-y-3 bg-[#f8fafc]">
                <button 
                  type="button"
                  className="w-full py-2.5 px-4 bg-white border border-[#cbd5e1] hover:bg-gray-50 text-[#334155] rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  View Public Profile
                </button>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full bg-white border border-[#cbd5e1] rounded-xl pl-3 pr-9 py-2 text-[11px] text-[#64748b] outline-none truncate"
                  />
                  <button
                    type="button"
                    onClick={copyProfileLink}
                    className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title="Copy link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#1a3808]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Section Anchor Jump Links */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">
                Section Overview
              </p>
              <button
                type="button"
                onClick={() => scrollToSection('account-section')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f2f8ed] hover:text-[#1a3808] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#1a3808]" />
                <span>1. Account Settings</span>
              </button>

              {profileData.role && profileData.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => scrollToSection('role-section')}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f2f8ed] hover:text-[#1a3808] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Award className="w-3.5 h-3.5 text-[#1a3808]" />
                  <span>2. Role Specifications</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('security-section')}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#475569] hover:bg-[#f2f8ed] hover:text-[#1a3808] rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#1a3808]" />
                <span>{profileData.role && profileData.role !== 'admin' ? '3.' : '2.'} Security & Password</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: FULL CONTINUOUSLY SCROLLABLE CONTENT ── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION 1: Account Settings */}
            <section id="account-section" className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden scroll-mt-6">
              <div className="border-b border-[#f1f5f9] px-6 py-4 bg-[#fcfcfd]">
                <h3 className="text-sm font-bold text-[#0f172a]">Account Settings</h3>
                <p className="text-xs text-[#64748b]">Manage personal contact details and identification credentials</p>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => handleNameSplitChange('first', e.target.value)}
                      placeholder="First Name"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => handleNameSplitChange('last', e.target.value)}
                      placeholder="Last Name"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+250 7XX XXX XXX"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#64748b] cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Assigned System Role</label>
                    <input
                      type="text"
                      value={profileData.role ? profileData.role.replace('_', ' ').toUpperCase() : 'USER'}
                      disabled
                      className="w-full bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#64748b] cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f1f5f9] flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#1a3808] hover:bg-[#142e06] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Update Settings</span>
                  </button>
                </div>
              </form>
            </section>

            {/* SECTION 2: Role Specifications */}
            {profileData.role && profileData.role !== 'admin' && (
              <section id="role-section" className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden scroll-mt-6">
                <div className="border-b border-[#f1f5f9] px-6 py-4 bg-[#fcfcfd]">
                  <h3 className="text-sm font-bold text-[#0f172a]">Role Specifications</h3>
                  <p className="text-xs text-[#64748b]">Configure workspace profile attributes tailored to your system role</p>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {profileData.role === 'farmer' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Location / District</label>
                          <input
                            type="text"
                            value={profileData.profile.location || ''}
                            onChange={(e) => handleProfileChange('location', e.target.value)}
                            placeholder="e.g. Gatsibo, Eastern Province"
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Total Orchard Size</label>
                          <input
                            type="text"
                            value={profileData.profile.farm_size || ''}
                            onChange={(e) => handleProfileChange('farm_size', e.target.value)}
                            placeholder="e.g. 2.5 Hectares"
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                          />
                        </div>
                      </>
                    )}

                    {profileData.role === 'agent' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Specialization Field</label>
                          <input
                            type="text"
                            value={profileData.profile.specialization || ''}
                            onChange={(e) => handleProfileChange('specialization', e.target.value)}
                            placeholder="e.g. Pest & Soil Analytics"
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Field Experience</label>
                          <input
                            type="text"
                            value={profileData.profile.experience || ''}
                            onChange={(e) => handleProfileChange('experience', e.target.value)}
                            placeholder="e.g. 5 Years Agronomy"
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                          />
                        </div>
                      </>
                    )}

                    {profileData.role === 'shop_manager' && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Market Shop Name</label>
                          <input
                            type="text"
                            value={profileData.profile.shop_name || ''}
                            onChange={(e) => handleProfileChange('shop_name', e.target.value)}
                            placeholder="Enter shop name"
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Outlet Physical Location</label>
                          <input
                            type="text"
                            value={profileData.profile.shop_location || ''}
                            onChange={(e) => handleProfileChange('shop_location', e.target.value)}
                            placeholder="Enter location"
                            className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#f1f5f9] flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#1a3808] hover:bg-[#142e06] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save Specifications</span>
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* SECTION 3: Security & Password Change */}
            <section id="security-section" className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden scroll-mt-6">
              <div className="border-b border-[#f1f5f9] px-6 py-4 bg-[#fcfcfd]">
                <h3 className="text-sm font-bold text-[#0f172a]">Security & Password</h3>
                <p className="text-xs text-[#64748b]">Update your system password to maintain account protection</p>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                {passwordError && (
                  <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3.5 bg-[#f2f8ed] border border-[#c4e1b2] text-[#1a3808] rounded-xl text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Password updated successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Min 8 characters"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0f172a] focus:bg-white focus:border-[#1a3808] focus:ring-2 focus:ring-[#1a3808]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f1f5f9] flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#1a3808] hover:bg-[#142e06] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
};

export default UserProfile;