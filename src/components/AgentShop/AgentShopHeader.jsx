import React from 'react';
import { Search, ShoppingCart, ArrowLeft } from 'lucide-react';
import './AgentShopHeader.css';

/**
 * AgentShopHeader - Dedicated header component for Agent Shop
 * Includes navigation, cart button, search, and filters with CSS styling
 */
const AgentShopHeader = ({
  purchaseMode,
  selectedFarmer,
  currentStep,
  cartCount,
  searchTerm,
  categoryFilter,
  categories,
  onBackToFarmers,
  onBackToMode,
  onCartOpen,
  onSearchChange,
  onCategoryChange
}) => {
  return (
    <div className="agent-shop-header">
      <div className="agent-shop-header-content">
        {/* Top Row: Navigation and Cart */}
        <div className="agent-shop-header-top">
          <div className="agent-shop-nav-section">
            {/* Back Buttons */}
            {(purchaseMode === 'behalf' && currentStep === 3) && (
              <button onClick={onBackToFarmers} className="agent-shop-back-button">
                <ArrowLeft className="agent-shop-back-icon" />
                Change Farmer
              </button>
            )}
            {currentStep === 3 && (
              <button onClick={onBackToMode} className="agent-shop-back-button">
                <ArrowLeft className="agent-shop-back-icon" />
                Change Mode
              </button>
            )}
            
            {/* Title and Context */}
            <div className="agent-shop-context">
              <h1 className="agent-shop-title">Agent Shop</h1>
              {purchaseMode === 'behalf' && selectedFarmer && (
                <p className="agent-shop-subtitle">
                  Shopping for: <span className="agent-shop-farmer-highlight">{selectedFarmer.full_name}</span>
                </p>
              )}
              {purchaseMode === 'self' && (
                <p className="agent-shop-subtitle">Shopping for yourself</p>
              )}
            </div>
          </div>
          
          {/* Cart Button */}
          <button onClick={onCartOpen} className="agent-shop-cart-button">
            <ShoppingCart className="agent-shop-cart-icon" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="agent-shop-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>

        {/* Search and Filters Row */}
        <div className="agent-shop-search-row">
          <div className="agent-shop-search-wrapper">
            <Search className="agent-shop-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="agent-shop-search-input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="agent-shop-category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AgentShopHeader;

