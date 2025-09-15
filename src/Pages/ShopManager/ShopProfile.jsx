import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Store, Edit3, Save, X, Award, Package, Users } from 'lucide-react';
import { getProfile, updateProfile } from '../../services/authService';
import MembershipCard from '../../components/Profile/MembershipCard';
import '../Styles/Shop.css';

export default function ShopProfile() {
  const [shopProfile, setShopProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    const fetchShopProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileData = await getProfile();
        setShopProfile(profileData);
        setEditedProfile(profileData);
      } catch (error) {
        setError('There was an error fetching the profile data!');
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopProfile();
  }, []);

  const handleEditProfile = () => {
    setEditedProfile({ ...shopProfile });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData = {
        full_name: editedProfile.full_name,
        phone: editedProfile.phone
      };
      
      // Add profile data if it exists
      if (editedProfile.profile) {
        updateData.profile = editedProfile.profile;
      }
      
      const updatedProfile = await updateProfile(updateData);
      setShopProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({ ...shopProfile });
    setIsEditing(false);
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileNestedChange = (parent, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const ProfileCard = ({ icon: Icon, title, value, subtitle }) => (
    <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-blue-50">
          <Icon className="w-6 h-6 text-blue-600" aria-hidden="true" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">{value || 'N/A'}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
    </div>
  );

  const InfoField = ({ label, value, icon: Icon, isEditing, onChange, type = "text" }) => (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div className="p-2 rounded-lg mr-4 bg-blue-50">
        <Icon className="w-5 h-5 text-blue-600" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        {isEditing ? (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded-md"
          />
        ) : (
          <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mb-4"
            role="status"
            aria-label="Loading"
          ></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!shopProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md">
          <p className="text-gray-700">No profile data available.</p>
        </div>
      </div>
    );
  }

  // Extract shop-specific profile data
  const shopProfileData = shopProfile.profile || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="shadow-sm bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <Store className="w-6 h-6 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Shop Manager Profile</h1>
                <p className="text-blue-200 text-sm">Manage your shop information</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              aria-label="Logout"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Membership Card Section */}
        <div className="mb-8">
          <div style={{display:'flex',justifyContent:'center'}}>
            <MembershipCard
              name={shopProfile.full_name}
              treeCount={shopProfileData.products_count || 'N/A'}
              propertyId={shopProfileData.license_number || 'N/A'}
              location={`${shopProfileData.city || ''}${shopProfileData.province ? `, ${shopProfileData.province}` : ''}`.trim() || 'N/A'}
              variety={shopProfileData.shop_name || 'N/A'}
              profileImage={shopProfileData.profileImage}
              role={shopProfile.role}
              memberSince={shopProfile.created_at}
              status={shopProfile.status}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-6">
          {!isEditing ? (
            <button
              onClick={handleEditProfile}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProfileCard
            icon={Package}
            title="Products"
            value={shopProfileData.products_count}
            subtitle="In inventory"
          />
          <ProfileCard
            icon={Users}
            title="Customers"
            value={shopProfileData.customer_count}
            subtitle="Active"
          />
          <ProfileCard
            icon={Award}
            title="Rating"
            value={shopProfileData.rating}
            subtitle="Average"
          />
          <ProfileCard
            icon={Calendar}
            title="Member Since"
            value={shopProfile.created_at ? new Date(shopProfile.created_at).getFullYear() : 'N/A'}
            subtitle="Years"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Full Name" 
                  value={isEditing ? editedProfile.full_name : shopProfile.full_name} 
                  icon={User} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileChange('full_name', value)}
                />
                <InfoField 
                  label="Email Address" 
                  value={shopProfile.email} 
                  icon={Mail} 
                  isEditing={false}
                />
                <InfoField 
                  label="Phone Number" 
                  value={isEditing ? editedProfile.phone : shopProfile.phone} 
                  icon={Phone} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileChange('phone', value)}
                  type="tel"
                />
                <InfoField 
                  label="Business License" 
                  value={shopProfileData.license_number} 
                  icon={Award} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'license_number', value)}
                />
              </div>
            </div>

            {/* Shop Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Store className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                Shop Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Shop Name" 
                  value={shopProfileData.shop_name} 
                  icon={Store} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'shop_name', value)}
                />
                <InfoField 
                  label="Shop Type" 
                  value={shopProfileData.shop_type} 
                  icon={Store} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'shop_type', value)}
                />
                <InfoField 
                  label="Province" 
                  value={shopProfileData.province} 
                  icon={MapPin} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'province', value)}
                />
                <InfoField 
                  label="City" 
                  value={shopProfileData.city} 
                  icon={MapPin} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'city', value)}
                />
                <div className="md:col-span-2">
                  <InfoField 
                    label="Full Address" 
                    value={shopProfileData.address} 
                    icon={MapPin} 
                    isEditing={isEditing}
                    onChange={(value) => handleProfileNestedChange('profile', 'address', value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                Business Details
              </h3>
              <div className="space-y-4">
                <InfoField
                  label="Years in Business"
                  value={shopProfileData.years_in_business}
                  icon={Calendar}
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'years_in_business', value)}
                  type="number"
                />
                <InfoField 
                  label="Employee Count" 
                  value={shopProfileData.employee_count} 
                  icon={Users} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'employee_count', value)}
                  type="number"
                />
                <InfoField 
                  label="Website" 
                  value={shopProfileData.website} 
                  icon={Store} 
                  isEditing={isEditing}
                  onChange={(value) => handleProfileNestedChange('profile', 'website', value)}
                  type="url"
                />
                <InfoField
                  label="Member Since"
                  value={shopProfile.created_at ? new Date(shopProfile.created_at).toLocaleDateString() : 'N/A'}
                  icon={Calendar}
                  isEditing={false}
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
                Account Status
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {shopProfile.status || 'Active'}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {shopProfileData.verification_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}