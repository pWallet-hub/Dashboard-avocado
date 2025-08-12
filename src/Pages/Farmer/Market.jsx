import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './Market.css';
import Advertisement from '../../components/advertisement/advertisement';
import SlideShow from "../../components/Slide/Slide";
import image1 from '../../assets/image/slide1.jpg'
import image2 from '../../assets/image/slide2.jpg'
import image3 from '../../assets/image/slide3.jpg'
import { Link } from 'react-router-dom';
import product from '../../assets/image/product.jpg';


export default function Market() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://applicanion-api.onrender.com/api/products');
        setProducts(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'There was an error fetching the data!');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuyProduct = async (productId) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`https://applicanion-api.onrender.com/api/products/${productId}/buy`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Product bought successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'There was an error buying the product!');
    } finally {
      setLoading(false);
    }
  };



  const text1 = (
    <div className='market-slide' >
      <div className='slide-head'>
      <h2 >Discover the power of pWallet:</h2>
    </div>
    <div className='slide-content'>
      <h2>Empowering Avocado Farmers</h2>
    </div>
    <div className='slide-button'>
      <Link className="shop-now" to="/About">Shop Now</Link></div>
  </div>
  );
  const text2 = (
  <div className='market-slide' >
      <div className='slide-head'>
      <h2 >Negotiations is our carrier</h2>
    </div>
    <div className='slide-content'>
      <h2>To deliver</h2>
    </div>
    <div className='slide-button'>
      <Link className="shop-now" to="/market">Shop Now</Link>
    </div>
  </div>
  );
  const text3 = (
    <div className='market-slide' >
      <div className='slide-head'>
        <h2 >Explore your farming</h2>
      </div>
      <div className='slide-content'>
        <h2>Power harvestment</h2>
      </div>
      <div className='slide-button'>
        <Link className="shop-now" to="/market">Shop Now</Link></div>
    </div>
);

const images = [
  { url: image1, text: text1 },
  { url: image2, text: text2 },
  { url: image3, text: text3 },
];

  return (
    <>
    <div className="market-container">
      <div className="market-wrapper">
        {/* Header Section */}
        <div className="market-header">
         <SlideShow images={images}/>
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
      <Advertisement/>
    </div>
      {/* Products Section */}
      <div className="market-products-container">
          <div className="market-products-wrapper">
            {loading ? (
              <div className="products-loader">
                <ClipLoader color="#3498db" loading={loading} size={50} />
              </div>
            ) :  (
              <div className='market-products-listing'>
              <h2>Get yours</h2>
              <div className="market-products-grid">
                <Link to="/dashboard/farmer/product">
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Sprinkler</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>10,000rwf</p>
                  </div>
                </div>
                </Link>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Sprinkler</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>10,000rwf</p>
                  </div>
                </div>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Sprinkler</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>10,000rwf</p>
                  </div>
                </div>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Sprinkler</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>10,000rwf</p>
                  </div>
                </div>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Sprinkler</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>10,000rwf</p>
                  </div>
                </div>
                
              </div>
            </div>
            )}
          </div>
        </div>
    
    </>
  );
}
