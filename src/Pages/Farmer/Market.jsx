import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './market.css';
import Advertisement from '../../components/advertisement/advertisement';

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

  return (
    <div className="market-container">
      <div className="market-wrapper">
        {/* Header Section */}
        <div className="market-header">
          <h1 className="market-title">Market</h1>
          <p className="market-subtitle">Browse and buy products available in the market.</p>
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
