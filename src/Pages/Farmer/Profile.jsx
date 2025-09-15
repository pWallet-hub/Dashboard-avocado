import React, { useEffect, useState } from 'react';
import { getProfile } from '../../services/authService';
import Advertisement from '../../components/advertisement/advertisement';
import MembershipCard from '../../components/Profile/MembershipCard';
import './profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
    

 useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await getProfile();
      console.log('Profile response:', profileData); // Debug: see what backend returns
      setProfile(profileData);
    } catch (error) {
      setError('There was an error fetching the profile data!');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="error-text">
            <h3 className="error-title">Error</h3>
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="no-data-container">
        <p className="no-data-text">No profile data available.</p>
      </div>
    );
  }

  const InfoItem = ({ label, value }) => (
    <div className="info-item">
      <dt className="info-label">{label}</dt>
      <dd className="info-value">{value || 'N/A'}</dd>
    </div>
  );

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`tab-button ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  );

  // Extract farmer-specific profile data
  const farmerProfile = profile.profile || {};

  return (
    <div className='profile-page'>
      <div className="profile-wrapper">
        <div style={{display:'flex',justifyContent:'center',marginBottom:'2rem'}}>
          <MembershipCard
            name={profile.full_name}
            treeCount={farmerProfile.tree_count || 'N/A'}
            propertyId={farmerProfile.upi_number || 'N/A'}
            location={`${farmerProfile.district || ''}${farmerProfile.province ? `, ${farmerProfile.province}` : ''}`.trim() || 'N/A'}
            variety={farmerProfile.avocado_type || 'N/A'}
            profileImage={farmerProfile.image}
            role={profile.role}
            memberSince={profile.created_at}
            status={profile.status}
          />
        </div>
            
        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <TabButton id="personal" label="Personal Information" active={activeTab === 'personal'} />
          <TabButton id="location" label="Location" active={activeTab === 'location'} />
          <TabButton id="farm" label="Farm Details" active={activeTab === 'farm'} />
          <TabButton id="assistance" label="Assistance" active={activeTab === 'assistance'} />
        </div>
      </div>

      {/* Content Sections */}
      <div className="content-grid">
        {activeTab === 'personal' && (
          <div className="content-section">
            <div className="info-grid">
              <InfoItem label="Age" value={farmerProfile.age} />
              <InfoItem label="ID Number" value={farmerProfile.id_number} />
              <InfoItem label="Gender" value={farmerProfile.gender} />
              <InfoItem label="Marital Status" value={farmerProfile.marital_status} />
              <InfoItem label="Education Level" value={farmerProfile.education_level} />
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="content-section">
            <div className="info-grid">
              <InfoItem label="Province" value={farmerProfile.province} />
              <InfoItem label="District" value={farmerProfile.district} />
              <InfoItem label="Sector" value={farmerProfile.sector} />
              <InfoItem label="Cell" value={farmerProfile.cell} />
              <InfoItem label="Village" value={farmerProfile.village} />
            </div>
          </div>
        )}

        {activeTab === 'farm' && (
          <>
            <div className="content-section">
              <div className="info-grid">
                <InfoItem label="Farm Age" value={farmerProfile.farm_age ? `${farmerProfile.farm_age} years` : 'N/A'} />
                <InfoItem label="Avocado Type" value={farmerProfile.avocado_type} />
                <InfoItem label="Farm Size" value={farmerProfile.farm_size} />
                <InfoItem label="Tree Count" value={farmerProfile.tree_count} />
                <InfoItem label="UPI Number" value={farmerProfile.upi_number} />
                <InfoItem label="Planted" value={farmerProfile.planted} />
                <InfoItem label="Mixed Percentage" value={farmerProfile.mixed_percentage} />
              </div>
            </div>
            <div className="content-section">
              <div className="info-grid">
                <InfoItem label="Province" value={farmerProfile.farm_province} />
                <InfoItem label="District" value={farmerProfile.farm_district} />
                <InfoItem label="Sector" value={farmerProfile.farm_sector} />
                <InfoItem label="Cell" value={farmerProfile.farm_cell} />
                <InfoItem label="Village" value={farmerProfile.farm_village} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'assistance' && (
          <div className="assistance-content-section">
            <h2 className="section-title">Assistance Information</h2>
            <div className="assistance-tags">
              {farmerProfile.assistance && farmerProfile.assistance.length > 0 ? (
                farmerProfile.assistance.map((item, index) => (
                  <span key={index} className="assistance-tag">
                    {item}
                  </span>
                ))
              ) : (
                <p>No assistance information available.</p>
              )}
            </div>
          </div>
        )}
      </div>
      <Advertisement/>
    </div>
  );
}