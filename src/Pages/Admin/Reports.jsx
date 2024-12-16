import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import '../Styles/Report.css';

export default function Reports() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isAddFarmerModalOpen, setIsAddFarmerModalOpen] = useState(false);
  
  // New state for add farmer form
  const [newFarmer, setNewFarmer] = useState({
    full_name: '',
    email: '',
    telephone: ''
  });

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
      setIsApproveModalOpen(false);
    } catch (error) {
      console.error('Error approving farmer:', error);
      setError('There was an error approving the farmer!');
    } finally {
      setLoading(false);
    }
  };

  // New function to handle adding a new farmer
  const handleAddFarmer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://pwallet-api.onrender.com/api/farmers', newFarmer);
      setFarmers([...farmers, response.data]);
      alert('Farmer added successfully!');
      setIsAddFarmerModalOpen(false);
      // Reset form
      setNewFarmer({
        full_name: '',
        email: '',
        telephone: ''
      });
    } catch (error) {
      console.error('Error adding farmer:', error);
      setError('There was an error adding the farmer!');
      alert('Failed to add farmer. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (farmer) => {
    setSelectedFarmer(farmer);
    setIsApproveModalOpen(true);
  };

  const closeApproveModal = () => {
    setIsApproveModalOpen(false);
    setSelectedFarmer(null);
  };

  const openAddFarmerModal = () => {
    setIsAddFarmerModalOpen(true);
  };

  const closeAddFarmerModal = () => {
    setIsAddFarmerModalOpen(false);
    // Reset form when closing
    setNewFarmer({
      full_name: '',
      email: '',
      telephone: ''
    });
  };

  // Handle input changes for new farmer form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFarmer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container">
      <div className="reports-wrapper">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <h1>Farmers Without Account</h1>
            <div className="action-buttons">
              <button
                onClick={openAddFarmerModal}
                className="btn btn-primary"
              >
                + Add New Farmer
              </button>
              <button 
                onClick={() => alert('Export to Excel')}
                className="btn btn-export"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total Farmers</p>
              <p className="stat-value">{farmers.length}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center p-6">
                <ClipLoader color="#3498db" loading={loading} size={50} />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-6">{error}</div>
            ) : farmers.length > 0 ? (
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Telephone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map(farmer => (
                    <tr key={farmer.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="user-avatar">
                            {farmer.full_name ? farmer.full_name.charAt(0) : 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{farmer.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{farmer.email}</td>
                      <td className="table-cell">{farmer.telephone}</td>
                      <td className="table-cell action-cell">
                        <button
                          onClick={() => openApproveModal(farmer)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-6">No farmers without account.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for approving farmers */}
      {isApproveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Approve Farmer</h2>
              <button onClick={closeApproveModal} className="modal-close">&times;</button>
            </div>
            <div className="mt-4 overflow-y-auto max-h-96">
              {selectedFarmer && (
                <p className="text-sm text-gray-500">
                  Are you sure you want to approve <span className="font-bold">{selectedFarmer.full_name}</span>?
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                onClick={closeApproveModal}
                className="btn btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="btn btn-confirm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding new farmer */}
      {isAddFarmerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Farmer</h2>
              <button onClick={closeAddFarmerModal} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleAddFarmer} className="p-4">
              <div className="mb-4">
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={newFarmer.full_name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newFarmer.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">
                  Telephone
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={newFarmer.telephone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeAddFarmerModal}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-confirm"
                >
                  Add Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}