import React from 'react';
import { User, Users } from 'lucide-react';
import './AgentShopModeSelection.css';

/**
 * AgentShopModeSelection - Purchase mode selection component for Agent Shop
 * Allows agent to choose between buying for themselves or on behalf of a farmer
 * Isolated styling with CSS prevents conflicts with other selection pages
 */
const AgentShopModeSelection = ({ onSelectMode }) => {
  return (
    <div className="agent-shop-mode-selection">
      <div className="mode-selection-container">
        {/* Title Section */}
        <div className="mode-selection-header">
          <h1 className="mode-selection-title">Agent Shop</h1>
          <p className="mode-selection-subtitle">
            Purchase products for yourself or on behalf of farmers
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="mode-selection-grid">
          {/* Buy for Myself Card */}
          <div className="mode-card" onClick={() => onSelectMode('self')}>
            <div className="mode-card-content">
              {/* Icon */}
              <div className="mode-icon-circle green">
                <User className="mode-icon" />
              </div>

              {/* Title */}
              <h2 className="mode-card-title">Buy for Myself</h2>

              {/* Description */}
              <p className="mode-card-description">
                Purchase products for your own use as an agent
              </p>

              {/* Button */}
              <button className="mode-card-button green">
                Continue
              </button>
            </div>
          </div>

          {/* Buy for a Farmer Card */}
          <div className="mode-card" onClick={() => onSelectMode('behalf')}>
            <div className="mode-card-content">
              {/* Icon */}
              <div className="mode-icon-circle blue">
                <Users className="mode-icon" />
              </div>

              {/* Title */}
              <h2 className="mode-card-title">Buy for a Farmer</h2>

              {/* Description */}
              <p className="mode-card-description">
                Purchase products on behalf of a farmer in your territory
              </p>

              {/* Button */}
              <button className="mode-card-button blue">
                Select Farmer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentShopModeSelection;
