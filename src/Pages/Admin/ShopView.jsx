import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ShopView() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('https://api.example.com/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, []);

  const toggleSellingPermission = async (shopId, canSell) => {
    try {
      await axios.put(`https://api.example.com/shops/${shopId}`, { canSell });
      setShops(shops.map(shop => shop.id === shopId ? { ...shop, canSell } : shop));
    } catch (error) {
      console.error('Error updating selling permission:', error);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Shops</h1>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Shop Name</th>
            <th className="px-4 py-2 border-b">Owner</th>
            <th className="px-4 py-2 border-b">Email</th>
            <th className="px-4 py-2 border-b">Phone Number</th>
            <th className="px-4 py-2 border-b">Can Sell</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {shops.map(shop => (
            <tr key={shop.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b">{shop.name}</td>
              <td className="px-4 py-2 border-b">{shop.owner}</td>
              <td className="px-4 py-2 border-b">{shop.email}</td>
              <td className="px-4 py-2 border-b">{shop.phoneNumber}</td>
              <td className="px-4 py-2 border-b">{shop.canSell ? 'Yes' : 'No'}</td>
              <td className="px-4 py-2 border-b">
                <button
                  className={`px-2 py-1 mr-2 text-white rounded ${shop.canSell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  onClick={() => toggleSellingPermission(shop.id, !shop.canSell)}
                >
                  {shop.canSell ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}