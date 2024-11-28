import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Advertisement from '../../components/advertisement/advertisement';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      try {
        const response = await axios.get(`https://pwallet-api.onrender.com/api/farmers/profile/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
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
      <dd className="info-value">{value}</dd>
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

  return (
    <div className='profile-page'>
      <div className="profile-wrapper">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-header-gradient">
            <h2>FARMERS MEMBERSHIP CARD</h2>
              <div className="profile-header-content">
                <div className='profile-info'>
                <div className="profile-avatar">
                  <svg className="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="profile-name">{profile.full_name}</h1>
                </div>
               
                <div className="profile-header-text">
                  
                  <div className="profile-contact-info">
                    <div className="contact-item">
                      {/* <div className='email-icon'>
                      <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.email}
                      </div> */}
                      <h1>number of trees</h1>
                      <p>1, 234</p>
                      <h1>farmers property ID</h1>
                      <p>67789654567up</p>
                      <h1>Location</h1>
                      <p>Nyanza</p>
                    </div>
                    <div className="contact-item1">
                    <h1>variety</h1>
                    <p>many</p>
                    </div>
                  </div>
                </div>
              </div>
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
                {/* <h2 className="section-title">Personal Information</h2> */}
                <div className="info-grid">
                  <InfoItem label="Age" value={profile.age} />
                  <InfoItem label="ID Number" value={profile.id_number} />
                  <InfoItem label="Gender" value={profile.gender} />
                  <InfoItem label="Marital Status" value={profile.marital_status} />
                  <InfoItem label="Education Level" value={profile.education_level} />
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="content-section">
                <div className="info-grid">
                  <InfoItem label="Province" value={profile.province} />
                  <InfoItem label="District" value={profile.district} />
                  <InfoItem label="Sector" value={profile.sector} />
                  <InfoItem label="Cell" value={profile.cell} />
                  <InfoItem label="Village" value={profile.village} />
                </div>
              </div>
            )}

            {activeTab === 'farm' && (
              <>
                <div className="content-section">
                  <div className="info-grid">
                    <InfoItem label="Farm Age" value={`${profile.farm_age} years`} />
                    <InfoItem label="Avocado Type" value={profile.avocado_type} />
                    <InfoItem label="Farm Size" value={profile.farm_size} />
                    <InfoItem label="Tree Count" value={profile.tree_count} />
                    <InfoItem label="UPI Number" value={profile.upi_number} />
                    <InfoItem label="Planted" value={profile.planted} />
                    <InfoItem label="Mixed Percentage" value={profile.mixed_percentage} />
                  </div>
                </div>
                <div className="content-section">
                  <div className="info-grid">
                    <InfoItem label="Province" value={profile.farm_province} />
                    <InfoItem label="District" value={profile.farm_district} />
                    <InfoItem label="Sector" value={profile.farm_sector} />
                    <InfoItem label="Cell" value={profile.farm_cell} />
                    <InfoItem label="Village" value={profile.farm_village} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'assistance' && (
              <div className="assistance-content-section">
                <h2 className="section-title">Assistance Information</h2>
                <div className="assistance-tags">
                  {profile.assistance.map((item, index) => (
                    <span key={index} className="assistance-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Advertisement/>
    </div>
  );
}