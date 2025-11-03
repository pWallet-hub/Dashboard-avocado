import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import './Market.css';

import DashboardHeader from "../../components/Header/DashboardHeader";
import { Link } from 'react-router-dom';
import product from '../../assets/image/product.jpg';
import { getAllProducts } from '../../services/productsService';

export default function Market() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Get featured products (limit to 3, sorted by most recent)
        const featuredResponse = await getAllProducts({ 
          limit: 3,
          sort: '-created_at'
        });
        
        console.log('Featured products response:', featuredResponse);
        
        // Handle featured products
        if (Array.isArray(featuredResponse)) {
          setFeaturedProducts(featuredResponse);
        } else if (featuredResponse.data && Array.isArray(featuredResponse.data)) {
          setFeaturedProducts(featuredResponse.data);
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Fallback featured products
        setFeaturedProducts([
          {
            id: 1,
            name: 'Drip Irrigation System',
            price: 199.99,
            image: product,
            category: 'irrigation',
            description: 'Complete drip irrigation kit for small to medium farms'
          },
          {
            id: 2,
            name: 'Professional Harvesting Kit',
            price: 89.99,
            image: product,
            category: 'harvesting',
            description: 'All-in-one harvesting tools for efficient farming'
          },
          {
            id: 3,
            name: 'Organic Pest Control Set',
            price: 34.99,
            image: product,
            category: 'pest-management',
            description: 'Eco-friendly pest management solutions'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <DashboardHeader />
      <div className="market-container">
        <div className="market-wrapper">
          {/* Featured Products Section */}
          <div className="featured-products-section">
            <h2 className="section-titles">Featured Products</h2>
            {loading ? (
              <div className="loader-container">
                <ClipLoader color="#4CAF50" size={50} />
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="no-products">
                <p>No featured products available at the moment.</p>
              </div>
            ) : (
              <div className="featured-products-grid">
                {featuredProducts.map((productItem) => (
                  <div key={productItem.id || productItem._id} className="featured-product-card">
                    <div className="featured-product-image">
                      <img 
                        src={productItem.images?.[0] || productItem.image || product} 
                        alt={productItem.name}
                        onError={(e) => { e.target.src = product; }}
                      />
                    </div>
                    <div className="featured-product-info">
                      <span className="featured-product-category">
                        {productItem.category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Uncategorized'}
                      </span>
                      <h3 className="featured-product-name">{productItem.name}</h3>
                      <p className="featured-product-description">
                        {productItem.description || 'Quality product for your farming needs'}
                      </p>
                      <p className="featured-product-price">
                        {productItem.price ? `RWF ${parseFloat(productItem.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Price unavailable'}
                      </p>
                      <button className="shop-now-btn">Shop Now</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="market-tabs">
            <button>All Categories</button>
            <div className="market-tabs-grid">
              <Link to="/dashboard/farmer/IrrigationKits">
                <button>Irrigation Kits</button>
              </Link>
              <Link to="/dashboard/farmer/HarvestingKit">
                <button>Harvesting Kits</button>
              </Link>
              <Link to="/dashboard/farmer/Protection">
                <button>Safety & Protection</button>
              </Link>
              <Link to="/dashboard/farmer/Container">
                <button>Container</button>
              </Link>
              <Link to="/dashboard/farmer/Pest">
                <button>Pest Management</button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}