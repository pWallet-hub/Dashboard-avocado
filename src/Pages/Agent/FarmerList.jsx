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
      try {
        const response = await axios.get('https://applicanion-api.onrender.com/api/farmers', {
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
      <h1 className="mb-4 text-2xl font-bold">Farmer List</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          {farmers.length > 0 ? (
            <ul>
              {farmers.map((farmer) => (
                <li key={farmer.id} className="mb-2">
                  <p><strong>Name:</strong> {farmer.name}</p>
                  <p><strong>Email:</strong> {farmer.email}</p>
                  <p><strong>Phone Number:</strong> {farmer.phoneNumber}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No farmers available.</p>
          )}
        </div>
      )}
    </div>
  );
}