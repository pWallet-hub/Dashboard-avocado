import React, { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import {
  getPendingFarmers,
  addPendingFarmer,
  approvePendingFarmer,
  rejectPendingFarmer,
} from '../../services/pendingFarmersService';
import '../Styles/Report.css';

export default function Reports() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isAddFarmerModalOpen, setIsAddFarmerModalOpen] = useState(false);
  const [approvedCredentials, setApprovedCredentials] = useState(null);

  // New state for add farmer form
  const [newFarmer, setNewFarmer] = useState({
    full_name: '',
    email: '',
    telephone: ''
  });

  const fetchFarmers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPendingFarmers('pending');
      setFarmers(response.success ? response.data : []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setError('There was an error fetching the farmers!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await approvePendingFarmer(selectedFarmer.id);
      setFarmers(farmers.filter(farmer => farmer.id !== selectedFarmer.id));
      setApprovedCredentials(response.data);
      setIsApproveModalOpen(false);
    } catch (error) {
      console.error('Error approving farmer:', error);
      setError(error.message || 'There was an error approving the farmer!');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (farmer) => {
    setLoading(true);
    setError(null);
    try {
      await rejectPendingFarmer(farmer.id);
      setFarmers(farmers.filter(f => f.id !== farmer.id));
    } catch (error) {
      console.error('Error rejecting farmer:', error);
      setError(error.message || 'There was an error rejecting the farmer!');
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
      const response = await addPendingFarmer({
        full_name: newFarmer.full_name,
        email: newFarmer.email,
        phone: newFarmer.telephone,
      });
      setFarmers([response.data, ...farmers]);
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
      setError(error.message || 'There was an error adding the farmer!');
      alert(error.message || 'Failed to add farmer. Please check the details and try again.');
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
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card-R">
              <p className="stat-R-label">Total Farmers</p>
              <p className="stat-R-value">{farmers.length}</p>
            </div>
          </div>
        </div>

        {/* Approved credentials banner */}
        {approvedCredentials && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            <p className="font-semibold">
              {approvedCredentials.user.full_name} approved successfully.
            </p>
            <p className="text-sm mt-1">
              Share these login details with the farmer:
              <br />
              Email: <span className="font-mono">{approvedCredentials.user.email}</span>
              <br />
              Temporary password: <span className="font-mono">{approvedCredentials.temp_password}</span>
            </p>
            <button
              onClick={() => setApprovedCredentials(null)}
              className="text-sm underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

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
                      <td className="table-cell">{farmer.phone}</td>
                      <td className="table-cell action-cell">
                        <button
                          onClick={() => openApproveModal(farmer)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(farmer)}
                          className="btn-approve"
                          style={{ backgroundColor: '#ef4444', marginLeft: '0.5rem' }}
                        >
                          Reject
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
                  Are you sure you want to approve <span className="font-bold">{selectedFarmer.full_name}</span>? This will create a real login account for them.
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
