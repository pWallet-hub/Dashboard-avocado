import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './market.css';
import Advertisement from '../../components/advertisement/advertisement';
import SlideShow from "../../components/Slide/Slide";
import image1 from '../../assets/image/slide1.jpg'
import image2 from '../../assets/image/slide2.jpg'
import image3 from '../../assets/image/slide3.jpg'
import { Link } from 'react-router-dom';



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
      <Link className="shop-now" to="/About">Shop Now</Link></div>
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
    <div className="market-container">
      <div className="market-wrapper">
        {/* Header Section */}
        <div className="market-header">
         <SlideShow images={images}/>
        </div>
      <div className="market-tabs">
        <button>All Categories</button>
        <div className="market-tabs-grid">
          <button>Irrigation Kits</button>
          <button>Harvesting Kits</button>
          <button>Safety & Protection</button>
          <button>Container</button>
          <button>Pest Management</button>
          <button>Bee Keeping</button>
        </div>
      </div>

        {/* Products Section */}
        <div className="market-table-container">
          <div className="market-table-wrapper">
            {loading ? (
              <div className="market-loader">
                <ClipLoader color="#3498db" loading={loading} size={50} />
              </div>
            ) : error ? (
              <div className="market-error">{error}</div>
            ) : products.length > 0 ? (
              <table className="market-table">
                <thead>
                  <tr>
                    <th className="market-table-header">Product Name</th>
                    <th className="market-table-header">Price</th>
                    <th className="market-table-header">Stock</th>
                    <th className="market-table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="market-row">
                      <td className="market-cell">{product.name}</td>
                      <td className="market-cell">${product.price.toFixed(2)}</td>
                      <td className="market-cell">{product.stock}</td>
                      <td className="market-cell">
                        <button
                          className="market-button"
                          onClick={() => handleBuyProduct(product.id)}
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="market-no-products">No products available.</div>
            )}
          </div>
        </div>
      </div>
      <Advertisement/>
    </div>
  );
}
