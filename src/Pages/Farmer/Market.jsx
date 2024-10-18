import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

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
        setError('There was an error fetching the products!');
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
          Authorization: `Bearer ${token}`
        }
      });
      alert('Product bought successfully!');
    } catch (error) {
      setError('There was an error buying the product!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            Market
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Browse and buy products available in the market.
          </p>
        </div>

        {/* Products Section */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {loading ? (
                <div className="p-6 text-center">
                  <ClipLoader color="#3498db" loading={loading} size={50} />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : products.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Product Name</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                          <button
                            className="inline-flex items-center px-3 py-1 text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
                <div className="p-6 text-center">No products available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}