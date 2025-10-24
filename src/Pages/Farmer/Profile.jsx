import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../../services/authService';
import { getFarmerInformation, updateFarmerInformation } from '../../services/farmer-information';
import Advertisement from '../../components/advertisement/advertisement';
import MembershipCard from '../../components/Profile/MembershipCard';
import './profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch farmer information from the API endpoint
        const response = await getFarmerInformation();
        console.log('Farmer data from API:', response);
        
        // Extract data from the exact response structure
        // Response structure: { success, message, data: { farmer_id, user_info, farmer_profile }, meta }
        const responseData = response.data;
        const userInfo = responseData.user_info;
        const farmerProfile = responseData.farmer_profile;
        
        // Create the profile object matching the component's expected format
        const profileData = {
          id: userInfo.id,
          full_name: userInfo.full_name,
          email: userInfo.email,
          phone: userInfo.phone,
          role: 'farmer', // From API context
          status: userInfo.status,
          created_at: userInfo.created_at,
          updated_at: userInfo.updated_at,
          profile: farmerProfile
        };
        
        setProfile(profileData);
        
        // Initialize form data with current profile
        setFormData({
          full_name: userInfo.full_name || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          age: farmerProfile.age || '',
          id_number: farmerProfile.id_number || '',
          gender: farmerProfile.gender || '',
          marital_status: farmerProfile.marital_status || '',
          education_level: farmerProfile.education_level || '',
          province: farmerProfile.province || '',
          district: farmerProfile.district || '',
          sector: farmerProfile.sector || '',
          cell: farmerProfile.cell || '',
          village: farmerProfile.village || '',
          farm_age: farmerProfile.farm_age || '',
          avocado_type: farmerProfile.avocado_type || '',
          farm_size: farmerProfile.farm_size || '',
          tree_count: farmerProfile.tree_count || '',
          upi_number: farmerProfile.upi_number || '',
          planted: farmerProfile.planted || '',
          mixed_percentage: farmerProfile.mixed_percentage || '',
          farm_province: farmerProfile.farm_province || '',
          farm_district: farmerProfile.farm_district || '',
          farm_sector: farmerProfile.farm_sector || '',
          farm_cell: farmerProfile.farm_cell || '',
          farm_village: farmerProfile.farm_village || '',
        });
      } catch (error) {
        setError('There was an error loading the profile data!');
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Prepare update data with all form fields
      // Only include non-empty values and convert types properly
      const updateData = {};
      
      // User-level fields
      if (formData.full_name) updateData.full_name = formData.full_name;
      if (formData.email) updateData.email = formData.email;
      if (formData.phone) updateData.phone = formData.phone;
      
      // Farmer profile fields - convert numbers properly
      if (formData.age) updateData.age = parseInt(formData.age);
      if (formData.id_number) updateData.id_number = formData.id_number;
      if (formData.gender) updateData.gender = formData.gender;
      if (formData.marital_status) updateData.marital_status = formData.marital_status;
      if (formData.education_level) updateData.education_level = formData.education_level;
      
      // Personal location
      if (formData.province) updateData.province = formData.province;
      if (formData.district) updateData.district = formData.district;
      if (formData.sector) updateData.sector = formData.sector;
      if (formData.cell) updateData.cell = formData.cell;
      if (formData.village) updateData.village = formData.village;
      
      // Farm information - convert numbers properly
      if (formData.farm_age) updateData.farm_age = parseInt(formData.farm_age);
      if (formData.avocado_type) updateData.avocado_type = formData.avocado_type;
      if (formData.farm_size) updateData.farm_size = parseFloat(formData.farm_size);
      if (formData.tree_count) updateData.tree_count = parseInt(formData.tree_count);
      if (formData.upi_number) updateData.upi_number = formData.upi_number;
      if (formData.planted) updateData.planted = formData.planted;
      if (formData.mixed_percentage) updateData.mixed_percentage = parseFloat(formData.mixed_percentage);
      
      // Farm location
      if (formData.farm_province) updateData.farm_province = formData.farm_province;
      if (formData.farm_district) updateData.farm_district = formData.farm_district;
      if (formData.farm_sector) updateData.farm_sector = formData.farm_sector;
      if (formData.farm_cell) updateData.farm_cell = formData.farm_cell;
      if (formData.farm_village) updateData.farm_village = formData.farm_village;
      
      console.log('Prepared update data:', updateData);
      
      // Update farmer information using farmer-information endpoint
      const response = await updateFarmerInformation(updateData);
      console.log('Farmer updated successfully:', response);
      
      // Extract data from the exact response structure
      // Response structure: { success, message, data: { farmer_id, user_info, farmer_profile }, meta }
      const responseData = response.data;
      const userInfo = responseData.user_info;
      const farmerProfile = responseData.farmer_profile;
      
      // Create updated profile object matching the component's expected format
      const updatedProfile = {
        id: userInfo.id,
        full_name: userInfo.full_name,
        email: userInfo.email,
        phone: userInfo.phone,
        role: profile.role, // Keep existing role
        status: userInfo.status,
        created_at: userInfo.created_at,
        updated_at: userInfo.updated_at,
        profile: farmerProfile
      };
      
      // Update React state
      setProfile(updatedProfile);
      
      // Update localStorage with the new user data so it persists
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      
      setSaveSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setSaveError(errorMessage);
      console.error('Error updating profile:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setSaving(false);
    }
  };

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

  const farmerProfile = profile.profile || {};

  return (
    <div className='profile-page'>
      <div className="profile-wrapper">
        <div style={{width: '100%', marginBottom: '2rem'}}>
          <MembershipCard
            name={profile.full_name}
            email={profile.email}
            phone={profile.phone}
            treeCount={farmerProfile.tree_count || 'N/A'}
            propertyId={farmerProfile.upi_number || 'N/A'}
            location={`${farmerProfile.district || ''}${farmerProfile.province ? `, ${farmerProfile.province}` : ''}`.trim() || 'N/A'}
            variety={farmerProfile.avocado_type || 'N/A'}
            profileImage={farmerProfile.image || null}
            role={profile.role}
            memberSince={profile.created_at}
            status={profile.status}
          />
        </div>
        
        {/* Edit Profile Button */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:'1.5rem'}}>
          <button 
            onClick={() => setShowModal(true)}
            className="edit-profile-btn"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            Edit Profile
          </button>
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
            <h2 className="section-title">Personal Information</h2>
            <div className="info-grid">
              <InfoItem label="Full Name" value={profile.full_name} />
              <InfoItem label="Email" value={profile.email} />
              <InfoItem label="Phone" value={profile.phone} />
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
            <h2 className="section-title">Personal Location</h2>
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
              <h2 className="section-title">Farm Information</h2>
              <div className="info-grid">
                <InfoItem label="Farm Age" value={farmerProfile.farm_age ? `${farmerProfile.farm_age} years` : 'N/A'} />
                <InfoItem label="Avocado Type" value={farmerProfile.avocado_type} />
                <InfoItem label="Farm Size" value={farmerProfile.farm_size} />
                <InfoItem label="Tree Count" value={farmerProfile.tree_count} />
                <InfoItem label="UPI Number" value={farmerProfile.upi_number} />
                <InfoItem label="Planted Year" value={farmerProfile.planted} />
                <InfoItem label="Mixed Percentage" value={farmerProfile.mixed_percentage} />
              </div>
            </div>
            <div className="content-section">
              <h2 className="section-title">Farm Location</h2>
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

      {/* Update Profile Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Profile</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {saveError && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  {saveError}
                </div>
              )}
              
              {saveSuccess && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  Profile updated successfully!
                </div>
              )}

              <div className="form-section">
                <h3 className="form-section-title">Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Number</label>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Marital Status</label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Education Level</label>
                    <input
                      type="text"
                      name="education_level"
                      value={formData.education_level}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Personal Location</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Province</label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sector</label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cell</label>
                    <input
                      type="text"
                      name="cell"
                      value={formData.cell}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Village</label>
                    <input
                      type="text"
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Farm Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Farm Age (years)</label>
                    <input
                      type="number"
                      name="farm_age"
                      value={formData.farm_age}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Avocado Type</label>
                    <input
                      type="text"
                      name="avocado_type"
                      value={formData.avocado_type}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Farm Size</label>
                    <input
                      type="text"
                      name="farm_size"
                      value={formData.farm_size}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tree Count</label>
                    <input
                      type="number"
                      name="tree_count"
                      value={formData.tree_count}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>UPI Number</label>
                    <input
                      type="text"
                      name="upi_number"
                      value={formData.upi_number}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Planted Year</label>
                    <input
                      type="text"
                      name="planted"
                      value={formData.planted}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mixed Percentage</label>
                    <input
                      type="text"
                      name="mixed_percentage"
                      value={formData.mixed_percentage}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Farm Location</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Province</label>
                    <input
                      type="text"
                      name="farm_province"
                      value={formData.farm_province}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>District</label>
                    <input
                      type="text"
                      name="farm_district"
                      value={formData.farm_district}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sector</label>
                    <input
                      type="text"
                      name="farm_sector"
                      value={formData.farm_sector}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Cell</label>
                    <input
                      type="text"
                      name="farm_cell"
                      value={formData.farm_cell}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Village</label>
                    <input
                      type="text"
                      name="farm_village"
                      value={formData.farm_village}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Advertisement/>
      
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          padding: 0.625rem 1.5rem;
          background-color: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }

        .btn-primary {
          padding: 0.625rem 1.5rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #059669;
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}