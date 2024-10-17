import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function FarmerList() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const agentId = localStorage.getItem('id');
      try {
        const response = await axios.get(`https://pwallet-api.onrender.com/api/farmers/by-agent/${agentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFarmers(response.data);
      } catch (error) {
        setError('There was an error fetching the data!');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-center">Farmer List</h1>
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader"></div>
          <p className="ml-2">Loading data...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {farmers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Full Name</th>
                    <th className="px-4 py-2 border-b">Email</th>
                    <th className="px-4 py-2 border-b">Phone Number</th>
                    <th className="px-4 py-2 border-b">Province</th>
                    <th className="px-4 py-2 border-b">District</th>
                    <th className="px-4 py-2 border-b">Sector</th>
                    <th className="px-4 py-2 border-b">Farm Province</th>
                    <th className="px-4 py-2 border-b">Farm District</th>
                    <th className="px-4 py-2 border-b">Farm Sector</th>
                    <th className="px-4 py-2 border-b">Farm Cell</th>
                    <th className="px-4 py-2 border-b">Farm Village</th>
                    <th className="px-4 py-2 border-b">Farm Age</th>
                    <th className="px-4 py-2 border-b">Planted</th>
                    <th className="px-4 py-2 border-b">Avocado Type</th>
                    <th className="px-4 py-2 border-b">Mixed Percentage</th>
                    <th className="px-4 py-2 border-b">Farm Size</th>
                    <th className="px-4 py-2 border-b">Tree Count</th>
                    <th className="px-4 py-2 border-b">UPI Number</th>
                    <th className="px-4 py-2 border-b">Assistance</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border-b">{farmer.full_name}</td>
                      <td className="px-4 py-2 border-b">{farmer.email}</td>
                      <td className="px-4 py-2 border-b">{farmer.telephone}</td>
                      <td className="px-4 py-2 border-b">{farmer.province}</td>
                      <td className="px-4 py-2 border-b">{farmer.district}</td>
                      <td className="px-4 py-2 border-b">{farmer.sector}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_province}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_district}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_sector}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_cell}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_village}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_age} years</td>
                      <td className="px-4 py-2 border-b">{farmer.planted}</td>
                      <td className="px-4 py-2 border-b">{farmer.avocado_type}</td>
                      <td className="px-4 py-2 border-b">{farmer.mixed_percentage}</td>
                      <td className="px-4 py-2 border-b">{farmer.farm_size}</td>
                      <td className="px-4 py-2 border-b">{farmer.tree_count}</td>
                      <td className="px-4 py-2 border-b">{farmer.upi_number}</td>
                      <td className="px-4 py-2 border-b">{farmer.assistance.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">No farmers available.</p>
          )}
        </div>
      )}
    </div>
  );
}