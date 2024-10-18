import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function Reports() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null); // To handle modal selection
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`https://pwallet-api.onrender.com/api/farmers/approve/${selectedFarmer.id}`);
      setFarmers(farmers.filter(farmer => farmer.id !== selectedFarmer.id));
      alert('Farmer approved successfully!');
      setIsModalOpen(false); // Close modal after approval
    } catch (error) {
      console.error('Error approving farmer:', error);
      setError('There was an error approving the farmer!');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (farmer) => {
    setSelectedFarmer(farmer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Farmers Without Account
            </h1>
            <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:mt-0">
              <button
                onClick={() => alert('Add New Farmer')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                + Add New Farmer
              </button>
              <button 
                onClick={() => alert('Export to Excel')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Total Farmers</p>
              <p className="text-2xl font-bold text-gray-800">{farmers.length}</p>
            </div>
            {/* Add more stats as needed */}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {loading ? (
                <div className="p-6 text-center">
                  <ClipLoader color="#3498db" loading={loading} size={50} />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : farmers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Full Name</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Telephone</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {farmers.map(farmer => (
                      <tr key={farmer.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                {farmer.full_name ? farmer.full_name.charAt(0) : 'U'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{farmer.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{farmer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{farmer.telephone}</div>
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => openModal(farmer)}
                            className="inline-flex items-center px-3 py-1 text-blue-600 transition-colors bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">No farmers without account.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for approving farmers */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="relative w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Approve Farmer</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="mt-4 overflow-y-auto max-h-96"> {/* Set fixed height and enable scrolling */}
              {selectedFarmer && (
                <div className="grid gap-4">
                  <p className="text-sm text-gray-500">Are you sure you want to approve <span className="font-bold">{selectedFarmer.full_name}</span>?</p>
                </div>
              )}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="inline-flex items-center px-4 py-2 ml-4 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}