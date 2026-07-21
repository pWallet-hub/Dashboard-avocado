import React from 'react';
import { Package, ShoppingCart, CheckCircle, Loader2 } from 'lucide-react';
import './AgentShopProductCard.css';

/**
 * AgentShopProductCard - Dedicated product card component for Agent Shop
 * Isolated styling with CSS prevents conflicts with farmer market displays
 */
const AgentShopProductCard = ({ 
  product, 
  onAddToCart, 
  addingToCart, 
  justAdded 
}) => {
  const isAdding = addingToCart === product.id;
  const isJustAdded = justAdded === product.id;

  return (
    <div className="agent-product-card">
      {/* Product Image */}
      <div className="agent-product-image">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="agent-product-image-fallback">
          <Package className="agent-product-image-icon" />
        </div>
        {product.originalPrice && (
          <div className="agent-product-sale-badge">
            SALE
          </div>
        )}
      </div>
      
      {/* Product Details */}
      <div className="agent-product-details">
        <h3 className="agent-product-title">
          {product.name}
        </h3>
        <p className="agent-product-description">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="agent-product-price-section">
          <span className="agent-product-price">
            {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="agent-product-price-original">
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Capacity and Stock */}
        <div className="agent-product-info">
          <span className="agent-product-capacity">{product.capacity}</span>
          <span className="agent-product-stock">Stock</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isAdding || isJustAdded}
          className={`agent-product-button ${
            isJustAdded ? 'added' : isAdding ? 'adding' : 'default'
          }`}
        >
          {isAdding ? (
            <>
              <Loader2 className="agent-product-button-icon spin" />
              <span>Adding...</span>
            </>
          ) : isJustAdded ? (
            <>
              <CheckCircle className="agent-product-button-icon" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="agent-product-button-icon" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AgentShopProductCard;
