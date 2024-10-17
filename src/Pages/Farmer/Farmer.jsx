import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Farmer() {
  const [farmerProfile, setFarmerProfile] = useState({});
  const [productsForSale, setProductsForSale] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0 });

  useEffect(() => {
    const fetchFarmerProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const profileResponse = await axios.get('https://applicanion-api.onrender.com/api/farmer/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFarmerProfile(profileResponse.data);

        const productsResponse = await axios.get('https://applicanion-api.onrender.com/api/farmer/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProductsForSale(productsResponse.data);

        const availableProductsResponse = await axios.get('https://applicanion-api.onrender.com/api/products');
        setAvailableProducts(availableProductsResponse.data);
      } catch (error) {
        setError('There was an error fetching the data!');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerProfile();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('https://applicanion-api.onrender.com/api/farmer/products', newProduct, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProductsForSale([...productsForSale, response.data]);
      setNewProduct({ name: '', price: 0, stock: 0 });
    } catch (error) {
      setError('There was an error adding the product!');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Farmer Account</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-bold">Profile Information</h2>
            <p><strong>Full Name:</strong> {farmerProfile.fullname || 'N/A'}</p>
            <p><strong>Email:</strong> {farmerProfile.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {farmerProfile.phonenumber || 'N/A'}</p>
            <p><strong>Province:</strong> {farmerProfile.province || 'N/A'}</p>
            <p><strong>District:</strong> {farmerProfile.district || 'N/A'}</p>
            <p><strong>Sector:</strong> {farmerProfile.sector || 'N/A'}</p>
          </div>

          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-bold">Products for Sale</h2>
            {productsForSale.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Product Name</th>
                    <th className="px-4 py-2 border-b">Price</th>
                    <th className="px-4 py-2 border-b">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {productsForSale.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border-b">{product.name}</td>
                      <td className="px-4 py-2 border-b">{product.price}</td>
                      <td className="px-4 py-2 border-b">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No products for sale.</p>
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
                <label htmlFor="price" className="block mb-2 text-sm font-bold text-gray-700">Price</label>
                <input
                  type="number"
                  id="price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
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

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-bold">Available Products</h2>
            {availableProducts.length > 0 ? (
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Product Name</th>
                    <th className="px-4 py-2 border-b">Price</th>
                    <th className="px-4 py-2 border-b">Stock</th>
                    <th className="px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border-b">{product.name}</td>
                      <td className="px-4 py-2 border-b">{product.price}</td>
                      <td className="px-4 py-2 border-b">{product.stock}</td>
                      <td className="px-4 py-2 border-b">
                        <button
                          className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
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
              <p>No available products.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}