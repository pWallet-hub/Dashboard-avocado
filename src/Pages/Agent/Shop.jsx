import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', stock: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://applicanion-api.onrender.com/api/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProducts(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'There was an error fetching the data!');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('https://applicanion-api.onrender.com/api/products', newProduct, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts([...products, response.data]);
      setNewProduct({ name: '', stock: 0 });
    } catch (error) {
      setError(error.response?.data?.message || 'There was an error adding the product!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`https://applicanion-api.onrender.com/api/products/${productId}`, { stock: newStock }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(products.map(product => product.id === productId ? response.data : product));
    } catch (error) {
      setError('There was an error updating the stock!');
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
            Shop Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your shop products and stock levels.
          </p>
        </div>

        {/* Add Product Section */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold">Add New Product</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
              className="p-2 border border-gray-300 rounded"
            />
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Add Product
            </button>
          </div>
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
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.stock}</div>
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateStock(product.id, product.stock + 1)}
                            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleUpdateStock(product.id, product.stock - 1)}
                            className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            -1
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