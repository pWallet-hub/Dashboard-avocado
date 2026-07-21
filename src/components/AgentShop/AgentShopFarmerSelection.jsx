import React from 'react';
import { ArrowLeft, Search, User, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import './AgentShopFarmerSelection.css';

/**
 * AgentShopFarmerSelection - Farmer selection component for Agent Shop
 * Allows agent to search and select a farmer to shop on behalf of
 * Isolated styling with CSS prevents conflicts with other farmer selection pages
 */
const AgentShopFarmerSelection = ({
  farmers,
  loading,
  searchTerm,
  onSearchChange,
  districts,
  selectedDistrict,
  onDistrictChange,
  sectors,
  selectedSector,
  onSectorChange,
  cells,
  selectedCell,
  onCellChange,
  onClearFilters,
  onSelectFarmer,
  onBack
}) => {
  return (
    <div className="agent-farmer-selection">
      <div className="agent-farmer-container">
        {/* Header */}
        <div className="agent-farmer-header">
          <button onClick={onBack} className="agent-shop-back-button">
            <ArrowLeft className="agent-shop-back-icon" />
            Back to Mode Selection
          </button>
          <h1 className="agent-farmer-title">Select a Farmer</h1>
          <p className="agent-farmer-subtitle">
            Choose a farmer from your territory to shop on their behalf
          </p>
        </div>

        {/* Search and Filters */}
        <div className="agent-farmer-filters">
          {/* Search Bar */}
          <div className="agent-farmer-search-wrapper">
            <label className="agent-farmer-search-label">
              Search Farmers
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="agent-farmer-search-input"
            />
          </div>

          {/* Location Filters */}
          <div className="agent-farmer-location-filters">
            <div className="agent-farmer-filter-group">
              <label className="agent-farmer-filter-label">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="agent-farmer-filter-select"
              >
                <option value="">All Districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="agent-farmer-filter-group">
              <label className="agent-farmer-filter-label">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => onSectorChange(e.target.value)}
                className="agent-farmer-filter-select"
                disabled={!selectedDistrict}
              >
                <option value="">All Sectors</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

            <div className="agent-farmer-filter-group">
              <label className="agent-farmer-filter-label">Cell</label>
              <select
                value={selectedCell}
                onChange={(e) => onCellChange(e.target.value)}
                className="agent-farmer-filter-select"
                disabled={!selectedSector}
              >
                <option value="">All Cells</option>
                {cells.map((cell) => (
                  <option key={cell} value={cell}>
                    {cell}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedDistrict || selectedSector || selectedCell) && (
            <button onClick={onClearFilters} className="agent-farmer-clear-button">
              Clear all filters
            </button>
          )}
        </div>

        {/* Farmers List */}
        {loading ? (
          <div className="agent-farmer-loading">
            <Loader2 className="agent-farmer-loading-icon" />
            <p className="agent-farmer-loading-text">Loading farmers...</p>
          </div>
        ) : farmers.length > 0 ? (
          <div className="agent-farmer-grid">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                onClick={() => onSelectFarmer(farmer)}
                className="agent-farmer-card"
              >
                <div className="agent-farmer-card-content">
                  {/* Avatar */}
                  <div className="agent-farmer-avatar">
                    <User className="agent-farmer-avatar-icon" />
                  </div>

                  {/* Farmer Details */}
                  <div className="agent-farmer-details">
                    <h3 className="agent-farmer-name">
                      {farmer.full_name}
                    </h3>
                    
                    {farmer.email && (
                      <div className="agent-farmer-contact">
                        <Mail style={{ width: '0.75rem', height: '0.75rem', display: 'inline', marginRight: '0.25rem' }} />
                        {farmer.email}
                      </div>
                    )}
                    
                    {farmer.phone && (
                      <div className="agent-farmer-contact">
                        <Phone style={{ width: '0.75rem', height: '0.75rem', display: 'inline', marginRight: '0.25rem' }} />
                        {farmer.phone}
                      </div>
                    )}
                    
                    {(farmer.district || farmer.sector || farmer.cell) && (
                      <div className="agent-farmer-location">
                        <MapPin style={{ width: '0.75rem', height: '0.75rem', display: 'inline', marginRight: '0.25rem' }} />
                        {[farmer.cell, farmer.sector, farmer.district]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="agent-farmer-empty">
            <User className="agent-farmer-empty-icon" />
            <h3 className="agent-farmer-name">No Farmers Found</h3>
            <p className="agent-farmer-empty-text">
              {searchTerm || selectedDistrict || selectedSector || selectedCell
                ? 'Try adjusting your search or filters'
                : 'No farmers available in your territory'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentShopFarmerSelection;
