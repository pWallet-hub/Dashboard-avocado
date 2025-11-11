import React from 'react';
import { Loader2, Package } from 'lucide-react';
import AgentShopProductCard from './AgentShopProductCard';
import './AgentShopProductGrid.css';

/**
 * AgentShopProductGrid - Dedicated product grid component for Agent Shop
 * Isolated styling with CSS and layout for agent-specific product display
 */
const AgentShopProductGrid = ({
  loading,
  filteredProducts,
  searchTerm,
  categoryFilter,
  addingToCart,
  justAdded,
  onAddToCart
}) => {
  return (
    <div className="agent-shop-product-grid-container">
      {loading ? (
        <div className="agent-shop-product-loading">
          <Loader2 className="agent-shop-loading-icon" />
          <p className="agent-shop-loading-text">Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="agent-shop-product-grid">
          {filteredProducts.map((product) => (
            <AgentShopProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              addingToCart={addingToCart}
              justAdded={justAdded}
            />
          ))}
        </div>
      ) : (
        <div className="agent-shop-product-empty">
          <Package className="agent-shop-empty-icon" />
          <h3 className="agent-shop-empty-text">No Products Found</h3>
          <p className="agent-shop-empty-text">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'No products available at the moment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentShopProductGrid;

