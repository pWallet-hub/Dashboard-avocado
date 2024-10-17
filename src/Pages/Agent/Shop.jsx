import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', stock: 0 });

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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://applicanion-api.onrender.com/api/products', newProduct);
      setProducts([...products, response.data]);
      setNewProduct({ name: '', stock: 0 });
    } catch (error) {
      setError('There was an error adding the product!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`https://applicanion-api.onrender.com/api/products/${productId}`, { stock: newStock });
      setProducts(products.map(product => product.id === productId ? response.data : product));
    } catch (error) {
      setError('There was an error updating the stock!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Shop</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold">Products</h2>
          {products.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Product Name</th>
                  <th className="px-4 py-2 border-b">Stock</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{product.name}</td>
                    <td className="px-4 py-2 border-b">{product.stock}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                        onClick={() => handleUpdateStock(product.id, product.stock + 1)}
                      >
                        Add Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products available.</p>
          )}
          <h2 className="mt-6 mb-4 text-xl font-bold">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="mb-4">
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-sm font-bold text-gray-700">Product Name</label>
              <input
                type="text"
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="stock" className="block mb-2 text-sm font-bold text-gray-700">Stock</label>
              <input
                type="number"
                id="stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-700 focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}