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
  onUpdate, // Callback to update parent component
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

  // State for editable fields
  const [editableTreeCount, setEditableTreeCount] = useState(treeCount);
  const [isEditing, setIsEditing] = useState(false);

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
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: '#e8e8e8',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
      }}
    >
      <div
        className="membership-card"
        style={{
          width: '420px',
          height: '220px',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
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
        }}
      >
        {/* Background layers */}
        <div
          className="card-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #023409 0%, #034a0c 25%, #045c0f 50%, #034a0c 75%, #023409 100%)',
          }}
        ></div>

        <div
          className="diagonal-shine"
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.10) 30%, rgba(255, 255, 255, 0.05) 60%, transparent 80%)',
            borderRadius: '50%',
            transform: 'rotate(-15deg)',
          }}
        ></div>

        <div
          className="curved-reflection"
          style={{
            position: 'absolute',
            top: '20px',
            right: '15px',
            width: '200px',
            height: '100px',
            background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.08) 70%, transparent 100%)',
            borderRadius: '50%',
            transform: 'rotate(-25deg)',
            opacity: 0.6,
          }}
        ></div>

        <div
          className="card-texture"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.04) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.03) 0%, transparent 40%)',
            pointerEvents: 'none',
          }}
        ></div>

        {/* Header */}
        <div
          className="card-header"
          style={{
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.1)',
            padding: '8px 0',
            textAlign: 'center',
            borderBottom: '1px solid #FFD700',
          }}
        >
          <div
            className="card-title"
            style={{
              color: '#FFD700',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '2px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            {roleInfo.title}
          </div>
        </div>

        {/* Main content with exact sectional divisions */}
        <div
          className="card-content"
          style={{
            position: 'relative',
            padding: '16px 20px',
            height: 'calc(100% - 36px)',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {/* LEFT SECTION: Profile (following zigzag boundary) */}
          <div className="profile-section" style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 0, position: 'relative' }}>
            <div
              className="profile-container"
              style={{
                width: '85px',
                height: '85px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f5f5f5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: '75px',
                    height: '75px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  className="profile-silhouette"
                  style={{
                    width: '75px',
                    height: '75px',
                    background: '#000000',
                    borderRadius: '50%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="silhouette-head"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '24px',
                      height: '28px',
                      background: '#ffffff',
                      borderRadius: '50% 50% 45% 45%',
                    }}
                  ></div>
                  <div
                    className="silhouette-neck"
                    style={{
                      position: 'absolute',
                      top: '32px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '10px',
                      height: '6px',
                      background: '#ffffff',
                    }}
                  ></div>
                  <div
                    className="silhouette-shoulders"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50px',
                      height: '30px',
                      background: '#ffffff',
                      borderRadius: '25px 25px 0 0',
                    }}
                  ></div>
                </div>
              )}
            </div>
            <div
              className="profile-name"
              style={{
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
                marginTop: '8px',
              }}
            >
              {name}
            </div>
          </div>

          {/* MIDDLE SECTION: Information (main content area) */}
          <div
            className="info-section"
            style={{
              flex: 1,
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '8px',
              position: 'relative',
            }}
          >
            {roleInfo.fields.slice(0, 3).map((field, index) => (
              <div className="info-item" key={index} style={{ marginBottom: '14px' }}>
                <div
                  className="info-label"
                  style={{
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '2px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                    lineHeight: 1.2,
                  }}
                >
                  {field.label}
                </div>
                <div
                  className="info-value"
                  onClick={() => handleEditClick(field)}
                  style={{
                    color: '#FFD700',
                    fontSize: '14px',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                    lineHeight: 1.3,
                    cursor: field.editable ? 'pointer' : 'default',
                  }}
                >
                  {isEditing && field.label === 'Number of Trees' ? (
                    <input
                      type="text"
                      value={editableTreeCount}
                      onChange={(e) => setEditableTreeCount(e.target.value)}
                      onKeyPress={handleSave}
                      onBlur={() => setIsEditing(false)}
                      autoFocus
                      style={{
                        color: '#FFD700',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                      }}
                    />
                  ) : (
                    field.value
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SECTION: Last field (following zigzag boundary) */}
          <div
            className="variety-section"
            style={{
              width: '80px',
              paddingTop: '8px',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            <div
              className="variety-label"
              style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '2px',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              {roleInfo.fields[3].label}
            </div>
            <div
              className="variety-value"
              style={{
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              {roleInfo.fields[3].value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}