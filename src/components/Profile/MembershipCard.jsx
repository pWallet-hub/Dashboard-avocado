import React from 'react';
import './MembershipCard.css';

export default function MembershipCard({
  name = 'Nkusi John',
  treeCount = '1,234',
  propertyId = '038297U4',
  location = 'Gatsibo District',
  variety = 'Many',
  profileImage
}) {
  return (
    <div className="membership-card">
      <div className="card-background"></div>
      <div className="diagonal-shine"></div>
      <div className="curved-reflection"></div>
      <div className="card-texture"></div>
      <div className="card-header">
        <div className="card-title">FARMERS MEMBERSHIP CARD</div>
      </div>
      <div className="card-content">
        {/* LEFT SECTION: Profile */}
        <div className="profile-section">
          <div className="profile-container">
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{width:75,height:75,borderRadius:'50%'}} />
            ) : (
              <div className="profile-silhouette">
                <div className="silhouette-head"></div>
                <div className="silhouette-neck"></div>
                <div className="silhouette-shoulders"></div>
              </div>
            )}
          </div>
          <div className="profile-name">{name}</div>
        </div>
        {/* MIDDLE SECTION: Info */}
        <div className="info-section">
          <div className="info-item">
            <div className="info-label">Number of Trees</div>
            <div className="info-value">{treeCount}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Farmers Property ID</div>
            <div className="info-value">{propertyId}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Location</div>
            <div className="info-value">{location}</div>
          </div>
        </div>
        {/* RIGHT SECTION: Variety */}
        <div className="variety-section">
          <div className="variety-label">Variety</div>
          <div className="variety-value">{variety}</div>
        </div>
      </div>
    </div>
  );
}
