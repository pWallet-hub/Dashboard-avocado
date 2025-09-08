import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Advertisement from '../../components/advertisement/advertisement';
import './profile.css';

// Membership Card Component converted from HTML to JSX
const MembershipCard = ({ name, treeCount, propertyId, location, variety, profileImage }) => {
  useEffect(() => {
    // Add dynamic interactions based on section boundaries
    const profileSection = document.querySelector('.profile-section');
    const infoValues = document.querySelectorAll('.info-value, .variety-value');
    
    // Section-specific hover effects
    const handleProfileEnter = function() {
      this.style.transform = 'scale(1.05)';
      this.style.transition = 'transform 0.3s ease';
    };
    
    const handleProfileLeave = function() {
      this.style.transform = 'scale(1)';
    };
    
    if (profileSection) {
      profileSection.addEventListener('mouseenter', handleProfileEnter);
      profileSection.addEventListener('mouseleave', handleProfileLeave);
    }
    
    // Subtle glow effect for info values on hover
    infoValues.forEach(value => {
      const handleValueEnter = function() {
        this.style.textShadow = '0 1px 2px rgba(0,0,0,0.5), 0 0 12px rgba(255,215,0,0.6)';
        this.style.transition = 'text-shadow 0.3s ease';
      };
      
      const handleValueLeave = function() {
        this.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
      };
      
      value.addEventListener('mouseenter', handleValueEnter);
      value.addEventListener('mouseleave', handleValueLeave);
    });
    
    // Cleanup event listeners
    return () => {
      if (profileSection) {
        profileSection.removeEventListener('mouseenter', handleProfileEnter);
        profileSection.removeEventListener('mouseleave', handleProfileLeave);
      }
      infoValues.forEach(value => {
        value.removeEventListener('mouseenter', () => {});
        value.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: '#e8e8e8',
      padding: '40px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px'
    }}>
      <div className="membership-card" style={{
        width: '420px',
        height: '220px',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.25)';
        e.currentTarget.style.transition = 'all 0.3s ease';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transition = 'all 0.3s ease';
      }}>
        {/* Background layers */}
        <div className="card-background" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #023409 0%, #034a0c 25%, #045c0f 50%, #034a0c 75%, #023409 100%)'
        }}></div>
        
        <div className="diagonal-shine" style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.10) 30%, rgba(255, 255, 255, 0.05) 60%, transparent 80%)',
          borderRadius: '50%',
          transform: 'rotate(-15deg)'
        }}></div>
        
        <div className="curved-reflection" style={{
          position: 'absolute',
          top: '20px',
          right: '15px',
          width: '200px',
          height: '100px',
          background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.08) 70%, transparent 100%)',
          borderRadius: '50%',
          transform: 'rotate(-25deg)',
          opacity: 0.6
        }}></div>
        
        <div className="card-texture" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.04) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 40%)',
          pointerEvents: 'none'
        }}></div>
        
        {/* Header */}
        <div className="card-header" style={{
          position: 'relative',
          background: 'rgba(0, 0, 0, 0.1)',
          padding: '8px 0',
          textAlign: 'center',
          borderBottom: '1px solid #FFD700'
        }}>
          <div className="card-title" style={{
            color: '#FFD700',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '2px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}>FARMERS MEMBERSHIP CARD</div>
        </div>
        
        {/* Main content with exact sectional divisions */}
        <div className="card-content" style={{
          position: 'relative',
          padding: '16px 20px',
          height: 'calc(100% - 36px)',
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          {/* LEFT SECTION: Profile (following zigzag boundary) */}
          <div className="profile-section" style={{
            width: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: 0,
            position: 'relative'
          }}>
            <div className="profile-container" style={{
              width: '85px',
              height: '85px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}>
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile"
                  style={{
                    width: '75px',
                    height: '75px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div className="profile-silhouette" style={{
                  width: '75px',
                  height: '75px',
                  background: '#000000',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="silhouette-head" style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '24px',
                    height: '28px',
                    background: '#ffffff',
                    borderRadius: '50% 50% 45% 45%'
                  }}></div>
                  <div className="silhouette-neck" style={{
                    position: 'absolute',
                    top: '32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '6px',
                    background: '#ffffff'
                  }}></div>
                  <div className="silhouette-shoulders" style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '50px',
                    height: '30px',
                    background: '#ffffff',
                    borderRadius: '25px 25px 0 0'
                  }}></div>
                </div>
              )}
            </div>
            <div className="profile-name" style={{
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              textAlign: 'center',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
              marginTop: '8px'
            }}>{name || 'Nkusi John'}</div>
          </div>
          
          {/* MIDDLE SECTION: Information (main content area) */}
          <div className="info-section" style={{
            flex: 1,
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '8px',
            position: 'relative'
          }}>
            <div className="info-item" style={{ marginBottom: '14px' }}>
              <div className="info-label" style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '2px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.2
              }}>Number of Trees</div>
              <div className="info-value" style={{
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.3
              }}>{treeCount || '1,234'}</div>
            </div>
            <div className="info-item" style={{ marginBottom: '14px' }}>
              <div className="info-label" style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '2px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.2
              }}>Farmers Property ID</div>
              <div className="info-value" style={{
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.3
              }}>{propertyId || '038297U4'}</div>
            </div>
            <div className="info-item" style={{ marginBottom: '14px' }}>
              <div className="info-label" style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '2px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.2
              }}>Location</div>
              <div className="info-value" style={{
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                lineHeight: 1.3
              }}>{location || 'Gatsibo District'}</div>
            </div>
          </div>
          
          {/* RIGHT SECTION: Variety (following zigzag boundary) */}
          <div className="variety-section" style={{
            width: '80px',
            paddingTop: '8px',
            textAlign: 'left',
            position: 'relative'
          }}>
            <div className="variety-label" style={{
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '2px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>Variety</div>
            <div className="variety-value" style={{
              color: '#FFD700',
              fontSize: '14px',
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}>{variety || 'Many'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        <div style={{display:'flex',justifyContent:'center',marginBottom:'2rem'}}>
          <MembershipCard
            name={profile.full_name}
            treeCount={profile.tree_count || '1,234'}
            propertyId={profile.upi_number || '038297U4'}
            location={profile.district || 'Nyanza'}
            variety={profile.avocado_type || 'Many'}
            profileImage={profile.image}
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
      <Advertisement/>
    </div>
  );
}