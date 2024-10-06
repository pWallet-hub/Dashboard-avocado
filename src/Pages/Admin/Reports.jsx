import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Reports() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://pwallet-api.onrender.com/api/farmers/without-account');
        setFarmers(response.data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
        setError('There was an error fetching the farmers!');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleApprove = async (farmerId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`https://pwallet-api.onrender.com/api/farmers/approve/${farmerId}`);
      setFarmers(farmers.filter(farmer => farmer.id !== farmerId));
      alert('Farmer approved successfully!');
    } catch (error) {
      console.error('Error approving farmer:', error);
      setError('There was an error approving the farmer!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Farmers Without Account</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          {farmers.length > 0 ? (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Full Name</th>
                  <th className="px-4 py-2 border-b">Email</th>
                  <th className="px-4 py-2 border-b">Telephone</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map(farmer => (
                  <tr key={farmer.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{farmer.full_name}</td>
                    <td className="px-4 py-2 border-b">{farmer.email}</td>
                    <td className="px-4 py-2 border-b">{farmer.telephone}</td>
                    <td className="px-4 py-2 border-b">
                      <button
                        className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        onClick={() => handleApprove(farmer.id)}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No farmers without account.</p>
          )}
        </div>
      )}
    </div>
  );
}