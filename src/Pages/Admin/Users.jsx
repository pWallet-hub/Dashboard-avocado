import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select';
import { ClipLoader } from "react-spinners";
import '../Styles/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://pwallet-api.onrender.com/api/farmers/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        setError('There was an error fetching the data!');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openModal = (user, editMode = false) => {
    setSelectedUser(user);
    setIsEditMode(editMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'UsersData.xlsx');
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : '');
  };

  const filteredUsers = selectedDistrict
    ? users.filter(user => user.district === selectedDistrict)
    : users;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <div className="container">
        {/* Header Section */}
        <div className="header">
          <div className="header-content">
            <h1 className="header-title">
              Growers Management
            </h1>
            <div className="header-buttons">
              <button
                onClick={() => openModal(null, true)}
                className="btn btn-primary"
              >
                + Add New User
              </button>
              <button 
                onClick={exportToExcel}
                className="btn btn-success"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stats-card">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-container">
              <label className="filter-label">Filter by District:</label>
              <div className="filter-select">
                <Select
                  options={users.map(user => ({
                    label: user.district, 
                    value: user.district
                  }))}
                  isClearable
                  onChange={handleDistrictChange}
                  placeholder="Select or search district"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {loading ? (
                <div className="loading-container">
                  <ClipLoader color="#3498db" loading={loading} size={50} />
                </div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredUsers.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>User Details</th>
                      <th className="hidden md:table-cell">Contact</th>
                      <th className="hidden lg:table-cell">Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="user-avatar">
                              {user.full_name ? user.full_name.charAt(0) : 'U'}
                            </div>
                            <div style={{ marginLeft: '1rem' }}>
                              <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Age: {user.age || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Gender: {user.gender || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Marital Status: {user.marital_status || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          <div className="text-sm text-gray-900">{user.telephone || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                        </td>
                        <td className="hidden lg:table-cell">
                          <div className="text-sm text-gray-900">{user.province || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {user.district || 'N/A'}, {user.sector || 'N/A'}, {user.cell || 'N/A'}, {user.village || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => openModal(user, false)}
                            className="btn-view"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openModal(user, true)}
                            className="btn-edit"
                          >
                            <FiEdit style={{ marginRight: '0.5rem' }} /> Edit
                          </button>
                          <button className="btn-delete">
                            <MdOutlineDeleteOutline style={{ marginRight: '0.5rem' }} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="loading-container">No users found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{isEditMode ? 'Edit User' : 'User Details'}</h2>
              <button onClick={closeModal} className="modal-close">
                &times;
              </button>
            </div>
            <div className="modal-content">
              {selectedUser && (
                <div className="grid gap-4">
                  <p className="text-sm text-gray-500">Full Name: {selectedUser.full_name}</p>
                  <p className="text-sm text-gray-500">Age: {selectedUser.age || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Phone: {selectedUser.telephone || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Email: {selectedUser.email || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Gender: {selectedUser.gender || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Marital Status: {selectedUser.marital_status || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Education Level: {selectedUser.education_level || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Province: {selectedUser.province || 'N/A'}</p>
                  <p className="text-sm text-gray-500">District: {selectedUser.district || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Sector: {selectedUser.sector || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Cell: {selectedUser.cell || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Village: {selectedUser.village || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm Province: {selectedUser.farm_province || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm District: {selectedUser.farm_district || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm Sector: {selectedUser.farm_sector || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm Cell: {selectedUser.farm_cell || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm Village: {selectedUser.farm_village || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm Age: {selectedUser.farm_age || 'N/A'} years</p>
                  <p className="text-sm text-gray-500">Planted: {selectedUser.planted || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Avocado Type: {selectedUser.avocado_type || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Mixed Percentage: {selectedUser.mixed_percentage || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Farm Size: {selectedUser.farm_size || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Tree Count: {selectedUser.tree_count || 'N/A'}</p>
                  <p className="text-sm text-gray-500">UPI Number: {selectedUser.upi_number || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Assistance: {selectedUser.assistance.join(', ') || 'N/A'}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={closeModal}
                className="btn-view"
              >
                Close
              </button>
              {isEditMode && (
                <button className="btn-primary" style={{ marginLeft: '0.5rem' }}>
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="logout-btn"
      >
        <CiLogout size={24} />
      </button>
    </div>
  );
};

export default Users;