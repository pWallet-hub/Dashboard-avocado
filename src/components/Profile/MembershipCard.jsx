import React, { useEffect, useState } from 'react';
import './MembershipCard.css';

export default function MembershipCard({
  name = 'Nkusi John',
  treeCount = '1,234',
  propertyId = '038297U4',
  location = 'Gatsibo District',
  variety = 'Many',
  profileImage,
  role = 'farmer',
  memberSince = '2023-01-15',
  status = 'Active',
  onUpdate,
}) {
  // Format member since date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get role-specific information
  const getRoleInfo = () => {
    switch (role) {
      case 'farmer':
        return {
          title: 'FARMERS MEMBERSHIP CARD',
          fields: [
            { label: 'Number of Trees', value: treeCount, editable: true },
            { label: 'Farmers Property ID', value: propertyId },
            { label: 'Location', value: location },
            { label: 'Variety', value: variety },
          ],
        };
      case 'agent':
        return {
          title: 'AGENT MEMBERSHIP CARD',
          fields: [
            { label: 'Specialization', value: variety },
            { label: 'Location', value: location },
            { label: 'Member Since', value: formatDate(memberSince) },
            { label: 'Status', value: status },
          ],
        };
      case 'shop_manager':
        return {
          title: 'SHOP MANAGER CARD',
          fields: [
            { label: 'Shop Name', value: variety },
            { label: 'Location', value: location },
            { label: 'Member Since', value: formatDate(memberSince) },
            { label: 'Status', value: status },
          ],
        };
      case 'admin':
        return {
          title: 'ADMINISTRATOR CARD',
          fields: [
            { label: 'Department', value: variety || 'Administration' },
            { label: 'Location', value: location },
            { label: 'Member Since', value: formatDate(memberSince) },
            { label: 'Status', value: status },
          ],
        };
      default:
        return {
          title: 'MEMBERSHIP CARD',
          fields: [
            { label: 'ID', value: propertyId },
            { label: 'Location', value: location },
            { label: 'Member Since', value: formatDate(memberSince) },
            { label: 'Status', value: status },
          ],
        };
    }
  };

  const roleInfo = getRoleInfo();

  // Debug log
  console.log('MembershipCard profileImage:', profileImage);
  console.log('MembershipCard profileImage check:', profileImage && profileImage.trim() !== '');

  // State for editable fields
  const [editableTreeCount, setEditableTreeCount] = useState(treeCount);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get the first letter of the name for the initial
  const getInitial = () => {
    if (!name || name.trim() === '') return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  // Event handlers
  const handleProfileEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.transition = 'transform 0.3s ease';
  };

  const handleProfileLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleValueEnter = (e) => {
    e.currentTarget.style.textShadow = '0 1px 2px rgba(0,0,0,0.5), 0 0 12px rgba(255,215,0,0.6)';
    e.currentTarget.style.transition = 'text-shadow 0.3s ease';
  };

  const handleValueLeave = (e) => {
    e.currentTarget.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
  };

  const handleEditClick = (field) => {
    if (field.label === 'Number of Trees' && role === 'farmer') {
      setIsEditing(true);
    }
  };

  const handleSave = (e) => {
    if (e.key === 'Enter' && isEditing) {
      setIsEditing(false);
      if (onUpdate && editableTreeCount !== treeCount) {
        onUpdate({ treeCount: editableTreeCount });
      }
    }
  };

  useEffect(() => {
    const profileSection = document.querySelector('.profile-section');
    const infoValues = document.querySelectorAll('.info-value, .variety-value');

    if (profileSection) {
      profileSection.addEventListener('mouseenter', handleProfileEnter);
      profileSection.addEventListener('mouseleave', handleProfileLeave);
    }

    infoValues.forEach((value) => {
      value.addEventListener('mouseenter', handleValueEnter);
      value.addEventListener('mouseleave', handleValueLeave);
    });

    return () => {
      if (profileSection) {
        profileSection.removeEventListener('mouseenter', handleProfileEnter);
        profileSection.removeEventListener('mouseleave', handleProfileLeave);
      }
      infoValues.forEach((value) => {
        value.removeEventListener('mouseenter', handleValueEnter);
        value.removeEventListener('mouseleave', handleValueLeave);
      });
    };
  }, []);

  return (
    <div className="membership-card-wrapper">
      <div className="membership-card">
        {/* Background layers */}
        <div className="card-background"></div>
        <div className="diagonal-shine"></div>
        <div className="curved-reflection"></div>
        <div className="card-texture"></div>

        {/* Header */}
        <div className="card-header">
          <div className="card-titles">{roleInfo.title}</div>
        </div>

        {/* Main content with exact sectional divisions */}
        <div className="card-content">
          {/* LEFT SECTION: Profile (following zigzag boundary) */}
          <div className="profile-section">
            <div className="profile-container">
              {(profileImage && typeof profileImage === 'string' && profileImage.trim() !== '' && profileImage !== 'null' && profileImage !== 'undefined') ? (
                <img src={profileImage} alt={name} className="profile-image" />
              ) : (
                <div className="profile-initial">
                  <svg 
                    width="75" 
                    height="75" 
                    viewBox="0 0 75 75" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* White background circle */}
                    <circle cx="37.5" cy="37.5" r="37.5" fill="#ffffff"/>
                    {/* Head */}
                    <circle cx="37.5" cy="25" r="10" fill="#9CA3AF"/>
                    {/* Body/Shoulders */}
                    <ellipse cx="37.5" cy="60" rx="20" ry="25" fill="#9CA3AF"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="profile-names">{name}</div>
          </div>

          {/* MIDDLE SECTION: Information (main content area) */}
          <div className="info-section">
            {roleInfo.fields.slice(0, 3).map((field, index) => (
              <div className="info-item" key={index}>
                <div className="info-label">{field.label}</div>
                <div
                  className={`info-value ${field.editable ? 'editable' : ''}`}
                  onClick={() => handleEditClick(field)}
                >
                  {isEditing && field.label === 'Number of Trees' ? (
                    <input
                      type="text"
                      value={editableTreeCount}
                      onChange={(e) => setEditableTreeCount(e.target.value)}
                      onKeyPress={handleSave}
                      onBlur={() => setIsEditing(false)}
                      autoFocus
                    />
                  ) : (
                    field.value
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SECTION: Last field (following zigzag boundary) */}
          <div className="variety-section">
            <div className="variety-label">{roleInfo.fields[3].label}</div>
            <div className="variety-value">{roleInfo.fields[3].value}</div>
          </div>
        </div>
      </div>
    </div>
  );
}