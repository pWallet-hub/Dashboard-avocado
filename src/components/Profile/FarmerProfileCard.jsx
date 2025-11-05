import React, { useState, useEffect } from 'react';
import { getFarmerInformation, updateFarmerInformation } from '../../services/farmer-information';

/* ───────────── Icons ───────────── */
const Icon = ({ name, className = 'farmer-icon' }) => {
  const map = {
    Person: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5A1.5 1.5 0 0 0 4.5 21h15A1.5 1.5 0 0 0 21 19.5C21 16.5 17 14 12 14Z"/>
      </svg>
    ),
    Map: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/>
      </svg>
    ),
    Leaf: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="currentColor" strokeWidth="2">
        <path d="M21 3S11 2 6 7s-4 11-4 11 6 2 11-3S21 3 21 3Z" fill="none"/>
        <path d="m12 9-2 4"/>
      </svg>
    ),
    Hand: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 11v2a7 7 0 0 0 14 0V6a2 2 0 0 0-4 0v5M10 6v6M7 8v4"/>
      </svg>
    ),
    Edit: (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75Z"/>
      </svg>
    ),
    Check: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m20 6-11 11L4 12"/>
      </svg>
    ),
    Close: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 6l12 12M18 6 6 18"/>
      </svg>
    ),
    AlertCircle: (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  };
  return map[name] || null;
};

export default function FarmerProfileCard({ 
  onUpdate, 
  showEditButton = true,
  fullScreen = true,
  cardOnly = false
}) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formInnerTab, setFormInnerTab] = useState('personal');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFarmerInformation();
      console.log('API Response:', response);
      
      const { user_info, farmer_profile } = response.data || response;

      // Set defaults for tree varieties if not present
      const hass_trees = farmer_profile?.hass_trees || 0;
      const fuerte_trees = farmer_profile?.fuerte_trees || 0;
      
      // Calculate tree_count as sum of hass and fuerte if not provided, or use API value
      const tree_count = farmer_profile?.tree_count || (hass_trees + fuerte_trees);

      // Construct profile data with defaults for missing fields
      const profile = {
        id: user_info?.id,
        full_name: user_info?.full_name || 'Farmer Name',
        email: user_info?.email || '',
        phone: user_info?.phone || '',
        role: user_info?.role || 'farmer',
        status: user_info?.status || 'active',
        created_at: user_info?.created_at || new Date().toISOString(),
        updated_at: user_info?.updated_at,
        profile: {
          ...farmer_profile,
          hass_trees: hass_trees,
          fuerte_trees: fuerte_trees,
          tree_count: tree_count,
        }
      };

      setProfileData(profile);
      
      // Initialize form data
      setFormData({
        full_name: user_info?.full_name || '',
        email: user_info?.email || '',
        phone: user_info?.phone || '',
        age: farmer_profile?.age || '',
        id_number: farmer_profile?.id_number || '',
        gender: farmer_profile?.gender || '',
        marital_status: farmer_profile?.marital_status || '',
        education_level: farmer_profile?.education_level || '',
        province: farmer_profile?.province || '',
        district: farmer_profile?.district || '',
        sector: farmer_profile?.sector || '',
        cell: farmer_profile?.cell || '',
        village: farmer_profile?.village || '',
        farm_age: farmer_profile?.farm_age || '',
        avocado_type: farmer_profile?.avocado_type || '',
        farm_size: farmer_profile?.farm_size || '',
        tree_count: farmer_profile?.tree_count || '',
        hass_trees: farmer_profile?.hass_trees || 0,
        fuerte_trees: farmer_profile?.fuerte_trees || 0,
        upi_number: farmer_profile?.upi_number || '',
        planted: farmer_profile?.planted || '',
        mixed_percentage: farmer_profile?.mixed_percentage || '',
        farm_province: farmer_profile?.farm_province || '',
        farm_district: farmer_profile?.farm_district || '',
        farm_sector: farmer_profile?.farm_sector || '',
        farm_cell: farmer_profile?.farm_cell || '',
        farm_village: farmer_profile?.farm_village || '',
        assistance: farmer_profile?.assistance || []
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err?.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fp = profileData?.profile || {};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Prepare update data with proper type conversions
      const updateData = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value === '' || value === null || typeof value === 'undefined') return;
        
        // Convert numeric fields
        if (['age', 'farm_age', 'tree_count', 'hass_trees', 'fuerte_trees'].includes(key)) {
          updateData[key] = parseInt(value, 10);
        } else if (['farm_size', 'mixed_percentage'].includes(key)) {
          updateData[key] = parseFloat(value);
        } else {
          updateData[key] = value;
        }
      });

      console.log('Sending update:', updateData);
      
      const response = await updateFarmerInformation(updateData);
      console.log('Update response:', response);
      
      const { user_info, farmer_profile } = response.data || response;

      // Ensure proper defaults for tree counts
      const hass_trees = farmer_profile?.hass_trees || 0;
      const fuerte_trees = farmer_profile?.fuerte_trees || 0;
      const tree_count = farmer_profile?.tree_count || (hass_trees + fuerte_trees);

      // Update local state with new data
      const updatedProfile = {
        ...profileData,
        full_name: user_info?.full_name || profileData.full_name,
        email: user_info?.email || profileData.email,
        phone: user_info?.phone || profileData.phone,
        status: user_info?.status || profileData.status,
        profile: {
          ...farmer_profile,
          hass_trees: hass_trees,
          fuerte_trees: fuerte_trees,
          tree_count: tree_count,
        },
      };

      setProfileData(updatedProfile);
      
      // Update localStorage if needed
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({
            ...userData,
            ...updatedProfile
          }));
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }
      
      setSaveSuccess(true);
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updatedProfile);
      }
      
      // Auto-close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSaveSuccess(false);
      }, 1500);
      
    } catch (err) {
      console.error('Update failed:', err);
      setSaveError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #2d5f2e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: 16, color: '#666' }}>Loading profile…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: 20, background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', maxWidth: 400 }}>
          <Icon name="AlertCircle" className="farmer-icon" style={{ width: 48, height: 48, color: '#dc2626', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#dc2626', marginBottom: 8 }}>Failed to Load Profile</h3>
          <p style={{ color: '#666', marginBottom: 16 }}>{error}</p>
          <button 
            onClick={fetchProfile}
            style={{ padding: '10px 20px', background: '#2d5f2e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) scale(1);
          }
          50% { 
            transform: translateY(-20px) scale(1.05);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f5f5f5;
          overflow-x: hidden;
        }
        
        .farmer-profile-container {
          width: 100%;
          min-height: ${cardOnly ? 'auto' : '100vh'};
          margin: 0;
          background: white;
          border-radius: 0;
          overflow-x: hidden;
          box-shadow: none;
        }
        
        .farmer-profile-header {
          background: linear-gradient(135deg, #1a4d1a 0%, #2d5f2e 100%);
          padding: 18px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .farmer-profile-header::before {
          content: '';
          position: absolute;
          width: 400px;
          height: 400px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          top: -200px;
          right: -100px;
          z-index: 0;
          animation: float 6s ease-in-out infinite;
        }
        
        .farmer-profile-header::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 50%;
          bottom: -150px;
          left: -50px;
          z-index: 0;
          animation: pulse 4s ease-in-out infinite;
        }
        
        .farmer-profile-header > * {
          position: relative;
          z-index: 1;
        }
        
        .farmer-membership-badge {
          color: #ffd700;
          text-align: center;
          padding: 22px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin: -24px -24px -1px;
        }
        
        .farmer-profile-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .farmer-avatar {
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .farmer-avatar-silhouette {
          width: 90%;
          height: 90%;
          background: radial-gradient(circle at 30% 30%, #333 0%, #000 100%);
          border-radius: 50%;
          position: relative;
          overflow: hidden;
        }
        
        .farmer-avatar-silhouette::before {
          content: '';
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 30px;
          background: #555;
          border-radius: 50%;
        }
        
        .farmer-avatar-silhouette::after {
          content: '';
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 40px;
          background: #555;
          border-radius: 50% 50% 0 0;
        }
        
        .farmer-profile-info {
          flex: 1;
          min-width: 0;
        }
        
        .farmer-profile-name {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        
        .farmer-profile-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 12px;
        }
        
        .farmer-stat-item {
          display: flex;
          gap: 1rem
          
        }
        
        .farmer-stat-label {
          color: #ffd700;
          font-weight: 600;
          margin-bottom: 2px;
        }
        
        .farmer-stat-value {
          color: white;
          font-weight: 500;
        }
        
        .farmer-profile-tabs {
          display: flex;
          background: #e8f5e8;
          padding: 4px;
          gap: 4px;
          border-radius: 12px;
        }
        
        .farmer-tab-btn {
          flex: 1;
          padding: 10px 8px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #2d5f2e;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .farmer-tab-btn.active {
          background: #2d5f2e;
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .farmer-tab-btn .farmer-icon {
          width: 18px;
          height: 18px;
        }
        
        .farmer-profile-content {
          padding: 10px;
          position: relative;
          overflow: hidden;
        }
        
        .farmer-profile-content::before {
          content: '';
          position: absolute;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(45, 95, 46, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          top: -50px;
          right: -80px;
          z-index: 0;
          animation: pulse 5s ease-in-out infinite;
        }
        
        .farmer-profile-content::after {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(26, 77, 26, 0.06) 0%, transparent 70%);
          border-radius: 50%;
          bottom: -60px;
          left: -70px;
          z-index: 0;
          animation: float 7s ease-in-out infinite;
        }
        
        .farmer-profile-content > * {
          position: relative;
          z-index: 1;
        }
        
        .farmer-info-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .farmer-info-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 16px;
          background: #e8f5e8;
          border-radius: 8px;
          font-size: 13px;
        }
        
        .farmer-info-label {
          color: #2d5f2e;
          font-weight: 600;
        }
        
        .farmer-info-value {
          color: #1a4d1a;
          font-weight: 500;
        }
        
        .farmer-edit-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .farmer-edit-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.05);
        }
        
        .farmer-edit-btn .farmer-icon {
          width: 20px;
          height: 20px;
          color: white;
        }
        
        .farmer-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .farmer-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .farmer-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .farmer-modal-header h2 {
          margin: 0;
          font-size: 20px;
          color: #1a4d1a;
        }
        
        .farmer-close-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s;
        }
        
        .farmer-close-btn:hover {
          background: #f5f5f5;
        }
        
        .farmer-close-btn .farmer-icon {
          width: 20px;
          height: 20px;
          color: #666;
        }
        
        .farmer-form-tabs {
          display: flex;
          padding: 16px 24px 0;
          gap: 8px;
          border-bottom: 1px solid #eee;
        }
        
        .farmer-form-tab {
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .farmer-form-tab.active {
          color: #2d5f2e;
          border-bottom-color: #2d5f2e;
        }
        
        .farmer-modal-form {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        
        .farmer-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .farmer-form-grid input,
        .farmer-form-grid select {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
        }
        
        .farmer-form-grid input:focus,
        .farmer-form-grid select:focus {
          outline: none;
          border-color: #2d5f2e;
        }
        
        .farmer-success-alert {
          background: #d4edda;
          color: #155724;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .farmer-success-alert .farmer-icon {
          width: 18px;
          height: 18px;
        }
        
        .farmer-error-alert {
          background: #f8d7da;
          color: #721c24;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .farmer-error-alert .farmer-icon {
          width: 18px;
          height: 18px;
        }
        
        .farmer-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .farmer-btn {
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .farmer-btn-cancel {
          background: #f5f5f5;
          color: #666;
        }
        
        .farmer-btn-cancel:hover {
          background: #eee;
        }
        
        .farmer-btn-save {
          background: #2d5f2e;
          color: white;
        }
        
        .farmer-btn-save:hover {
          background: #1a4d1a;
        }
        
        .farmer-btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .farmer-assistance-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .farmer-tag {
          padding: 8px 16px;
          background: #e8f5e8;
          color: #2d5f2e;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }
      `}</style>

      <div className="farmer-profile-container">
        <div className="farmer-profile-header">
          <div className="farmer-membership-badge">
            FARMERS MEMBERSHIP CARD
          </div>
          
          {showEditButton && !cardOnly && (
            <button className="farmer-edit-btn" onClick={() => setShowModal(true)}>
              <Icon name="Edit" />
            </button>
          )}
          
          <div className="farmer-profile-top">
            <div className="farmer-avatar">
              <div className="farmer-avatar-silhouette"></div>
            </div>
            
            <div className="farmer-profile-info">
              <h1 className="farmer-profile-name">{profileData?.full_name || 'Farmer Name'}</h1>
              <div className="farmer-profile-stats">
                <div className="farmer-stat-item">
                  <span className="farmer-stat-label">Number of Trees :</span>
                  <span className="farmer-stat-value">{fp.tree_count || 'N/A'}</span>
                </div>
                <div className="farmer-stat-item">
                  <span className="farmer-stat-label">Variety :</span>
                  <span className="farmer-stat-value">
                    {`Hass: ${fp.hass_trees || 345}, Fuerte: ${fp.fuerte_trees || 0}`}
                  </span>
                </div>
                <div className="farmer-stat-item">
                  <span className="farmer-stat-label">Farmers Property ID :</span>
                  <span className="farmer-stat-value">{fp.upi_number || 'N/A'}</span>
                </div>
                <div className="farmer-stat-item">
                  <span className="farmer-stat-label">Location :</span>
                  <span className="farmer-stat-value">
                    {[fp.sector, fp.district, fp.province, 'Rwanda'].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {!cardOnly && (
            <div className="farmer-profile-tabs">
              {[
                { id: 'personal', label: 'Personal Information', icon: 'Person' },
                { id: 'location', label: 'Location', icon: 'Map' },
                { id: 'farm', label: 'Farm Details', icon: 'Leaf' },
                { id: 'assistance', label: 'Assistance', icon: 'Hand' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`farmer-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <Icon name={t.icon} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!cardOnly && (
          <div className="farmer-profile-content">
            {activeTab === 'personal' && (
              <div className="farmer-info-list">
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Date Of Birth</span>
                  <span className="farmer-info-value">1980 - 01 - 01</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">ID Number</span>
                  <span className="farmer-info-value">{fp.id_number || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Gender</span>
                  <span className="farmer-info-value">{fp.gender || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Marital Status</span>
                  <span className="farmer-info-value">{fp.marital_status || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Education Level</span>
                  <span className="farmer-info-value">{fp.education_level || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Farmers Property ID</span>
                  <span className="farmer-info-value">{fp.upi_number || 'N/A'}</span>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="farmer-info-list">
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Province</span>
                  <span className="farmer-info-value">{fp.province || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">District</span>
                  <span className="farmer-info-value">{fp.district || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Sector</span>
                  <span className="farmer-info-value">{fp.sector || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Cell</span>
                  <span className="farmer-info-value">{fp.cell || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Village</span>
                  <span className="farmer-info-value">{fp.village || 'N/A'}</span>
                </div>
              </div>
            )}

            {activeTab === 'farm' && (
              <div className="farmer-info-list">
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Farm Age</span>
                  <span className="farmer-info-value">{fp.farm_age || 'N/A'} yrs</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Avocado Type</span>
                  <span className="farmer-info-value">{fp.avocado_type || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Hass Trees</span>
                  <span className="farmer-info-value">{fp.hass_trees || 0}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Fuerte Trees</span>
                  <span className="farmer-info-value">{fp.fuerte_trees || 0}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Farm Size</span>
                  <span className="farmer-info-value">{fp.farm_size || 'N/A'} ha</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Total Trees</span>
                  <span className="farmer-info-value">{fp.tree_count || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">UPI Number</span>
                  <span className="farmer-info-value">{fp.upi_number || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Planted Year</span>
                  <span className="farmer-info-value">{fp.planted || 'N/A'}</span>
                </div>
                <div className="farmer-info-row">
                  <span className="farmer-info-label">Mixed Percentage</span>
                  <span className="farmer-info-value">{fp.mixed_percentage || 'N/A'}%</span>
                </div>
              </div>
            )}

            {activeTab === 'assistance' && (
              <div className="farmer-assistance-tags">
                {Array.isArray(fp.assistance) && fp.assistance.length > 0 ? (
                  fp.assistance.map((item, i) => (
                    <span key={i} className="farmer-tag">{item}</span>
                  ))
                ) : (
                  <span className="farmer-info-value">No assistance recorded</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="farmer-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="farmer-modal" onClick={e => e.stopPropagation()}>
            <div className="farmer-modal-header">
              <h2>Update Profile</h2>
              <button className="farmer-close-btn" onClick={() => setShowModal(false)}>
                <Icon name="Close" />
              </button>
            </div>

            <div className="farmer-form-tabs">
              {['personal', 'location', 'farm', 'farm_location'].map(id => (
                <button
                  key={id}
                  className={`farmer-form-tab ${formInnerTab === id ? 'active' : ''}`}
                  onClick={() => setFormInnerTab(id)}
                >
                  {id === 'personal' && 'Personal'}
                  {id === 'location' && 'Location'}
                  {id === 'farm' && 'Farm'}
                  {id === 'farm_location' && 'Farm Location'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="farmer-modal-form">
              {saveError && (
                <div className="farmer-error-alert">
                  <Icon name="AlertCircle" />
                  {saveError}
                </div>
              )}
              
              {saveSuccess && (
                <div className="farmer-success-alert">
                  <Icon name="Check" />
                  Profile updated successfully!
                </div>
              )}

              {formInnerTab === 'personal' && (
                <div className="farmer-form-grid">
                  <input name="full_name" placeholder="Full Name" value={formData.full_name || ''} onChange={handleInputChange} />
                  <input name="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} />
                  <input name="phone" type="tel" placeholder="Phone" value={formData.phone || ''} onChange={handleInputChange} />
                  <input name="age" type="number" placeholder="Age" value={formData.age || ''} onChange={handleInputChange} />
                  <input name="id_number" placeholder="ID Number" value={formData.id_number || ''} onChange={handleInputChange} />
                  <select name="gender" value={formData.gender || ''} onChange={handleInputChange}>
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <select name="marital_status" value={formData.marital_status || ''} onChange={handleInputChange}>
                    <option value="">Marital Status</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                  <input name="education_level" placeholder="Education" value={formData.education_level || ''} onChange={handleInputChange} />
                </div>
              )}

              {formInnerTab === 'location' && (
                <div className="farmer-form-grid">
                  <input name="province" placeholder="Province" value={formData.province || ''} onChange={handleInputChange} />
                  <input name="district" placeholder="District" value={formData.district || ''} onChange={handleInputChange} />
                  <input name="sector" placeholder="Sector" value={formData.sector || ''} onChange={handleInputChange} />
                  <input name="cell" placeholder="Cell" value={formData.cell || ''} onChange={handleInputChange} />
                  <input name="village" placeholder="Village" value={formData.village || ''} onChange={handleInputChange} />
                </div>
              )}

              {formInnerTab === 'farm' && (
                <div className="farmer-form-grid">
                  <input name="farm_age" type="number" placeholder="Farm Age (yrs)" value={formData.farm_age || ''} onChange={handleInputChange} />
                  <input name="avocado_type" placeholder="Avocado Type" value={formData.avocado_type || ''} onChange={handleInputChange} />
                  <input name="hass_trees" type="number" placeholder="Hass Trees" value={formData.hass_trees || ''} onChange={handleInputChange} />
                  <input name="fuerte_trees" type="number" placeholder="Fuerte Trees" value={formData.fuerte_trees || ''} onChange={handleInputChange} />
                  <input name="farm_size" placeholder="Farm Size (ha)" value={formData.farm_size || ''} onChange={handleInputChange} />
                  <input name="tree_count" type="number" placeholder="Total Trees" value={formData.tree_count || ''} onChange={handleInputChange} />
                  <input name="upi_number" placeholder="UPI Number" value={formData.upi_number || ''} onChange={handleInputChange} />
                  <input name="planted" placeholder="Planted Year" value={formData.planted || ''} onChange={handleInputChange} />
                  <input name="mixed_percentage" placeholder="Mixed %" value={formData.mixed_percentage || ''} onChange={handleInputChange} />
                </div>
              )}

              {formInnerTab === 'farm_location' && (
                <div className="farmer-form-grid">
                  <input name="farm_province" placeholder="Province" value={formData.farm_province || ''} onChange={handleInputChange} />
                  <input name="farm_district" placeholder="District" value={formData.farm_district || ''} onChange={handleInputChange} />
                  <input name="farm_sector" placeholder="Sector" value={formData.farm_sector || ''} onChange={handleInputChange} />
                  <input name="farm_cell" placeholder="Cell" value={formData.farm_cell || ''} onChange={handleInputChange} />
                  <input name="farm_village" placeholder="Village" value={formData.farm_village || ''} onChange={handleInputChange} />
                </div>
              )}

              <div className="farmer-modal-footer">
                <button type="button" className="farmer-btn farmer-btn-cancel" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="farmer-btn farmer-btn-save" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
