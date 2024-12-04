import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select';
import { ClipLoader } from "react-spinners";
import '../Styles/Growers.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
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
    // Export filtered users
    const dataToExport = filteredUsers.map(user => ({
      'Full Name': user.full_name || 'N/A',
      'Age': user.age || 'N/A',
      'Phone': user.telephone || 'N/A',
      'Email': user.email || 'N/A',
      'Gender': user.gender || 'N/A',
      'Marital Status': user.marital_status || 'N/A',
      'Education Level': user.education_level || 'N/A',
      'Province': user.province || 'N/A',
      'District': user.district || 'N/A',
      'Sector': user.sector || 'N/A',
      'Cell': user.cell || 'N/A',
      'Village': user.village || 'N/A',
      'Farm Province': user.farm_province || 'N/A',
      'Farm District': user.farm_district || 'N/A',
      'Farm Sector': user.farm_sector || 'N/A',
      'Farm Cell': user.farm_cell || 'N/A',
      'Farm Village': user.farm_village || 'N/A',
      'Farm Age': user.farm_age ? `${user.farm_age} years` : 'N/A',
      'Planted': user.planted || 'N/A',
      'Avocado Type': user.avocado_type || 'N/A',
      'Mixed Percentage': user.mixed_percentage || 'N/A',
      'Farm Size': user.farm_size || 'N/A',
      'Tree Count': user.tree_count || 'N/A',
      'UPI Number': user.upi_number || 'N/A',
      'Assistance': user.assistance?.join(', ') || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Users');
    
    // Generate filename with filter details
    const filename = generateExportFilename();
    XLSX.writeFile(workbook, filename);
  };

  // Generate a descriptive filename based on applied filters
  const generateExportFilename = () => {
    const filters = [];
    if (selectedDistrict) filters.push(`District-${selectedDistrict}`);
    if (selectedProvince) filters.push(`Province-${selectedProvince}`);
    if (selectedGender) filters.push(`Gender-${selectedGender}`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filterSuffix = filters.length > 0 ? `_${filters.join('_')}` : '';
    
    return `UsersData_${timestamp}${filterSuffix}.xlsx`;
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : null);
  };

  const handleProvinceChange = (selectedOption) => {
    setSelectedProvince(selectedOption ? selectedOption.value : null);
  };

  const handleGenderChange = (selectedOption) => {
    setSelectedGender(selectedOption ? selectedOption.value : null);
  };

  const filteredUsers = users.filter(user => 
    (!selectedDistrict || user.district === selectedDistrict) &&
    (!selectedProvince || user.province === selectedProvince) &&
    (!selectedGender || user.gender === selectedGender)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="users-container">
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
                Export Filtered Users
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stats-card2">
              <p className="stats-card-label">Total Users</p>
              <p className="stats-card-value">{filteredUsers.length}</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-container">
              <div className="filter-row">
                <div className="filter-item">
                  <label className="filter-label">Filter by District:</label>
                  <Select
                    options={[...new Set(users.map(user => user.district))]
                      .filter(Boolean)
                      .map(district => ({
                        label: district, 
                        value: district
                      }))}
                    isClearable
                    onChange={handleDistrictChange}
                    placeholder="Select District"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Filter by Province:</label>
                  <Select
                    options={[...new Set(users.map(user => user.province))]
                      .filter(Boolean)
                      .map(province => ({
                        label: province, 
                        value: province
                      }))}
                    isClearable
                    onChange={handleProvinceChange}
                    placeholder="Select Province"
                  />
                </div>
                <div className="filter-item">
                  <label className="filter-label">Filter by Gender:</label>
                  <Select
                    options={[
                      { label: 'Male', value: 'Male' },
                      { label: 'Female', value: 'Female' }
                    ]}
                    isClearable
                    onChange={handleGenderChange}
                    placeholder="Select Gender"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-container">
                <ClipLoader color="#3498db" loading={loading} size={50} />
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : filteredUsers.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th className="contact-column">Contact</th>
                    <th className="location-column">Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-details">
                          <div className="user-avatar">
                            {user.full_name ? user.full_name.charAt(0) : 'U'}
                          </div>
                          <div className="user-info">
                            <div className="user-name">{user.full_name || 'N/A'}</div>
                            <div className="user-meta">Age: {user.age || 'N/A'}</div>
                            <div className="user-meta">Gender: {user.gender || 'N/A'}</div>
                            <div className="user-meta">Marital Status: {user.marital_status || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="contact-column">
                        <div className="contact-primary">{user.telephone || 'N/A'}</div>
                        <div className="contact-secondary">{user.email || 'N/A'}</div>
                      </td>
                      <td className="location-column">
                        <div className="location-primary">{user.province || 'N/A'}</div>
                        <div className="location-secondary">
                          {user.district || 'N/A'}, {user.sector || 'N/A'}, {user.cell || 'N/A'}, {user.village || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openModal(user, false)}
                            className="btn btn-view"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openModal(user, true)}
                            className="btn btn-edit"
                          >
                            <FiEdit className="btn-icon" /> Edit
                          </button>
                          <button className="btn btn-delete">
                            <MdOutlineDeleteOutline className="btn-icon" /> Delete
                          </button>
                        </div>
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
                <div className="modal-grid">
                  {[
                    { label: 'Full Name', value: selectedUser.full_name },
                    { label: 'Age', value: selectedUser.age },
                    { label: 'Phone', value: selectedUser.telephone },
                    { label: 'Email', value: selectedUser.email },
                    { label: 'Gender', value: selectedUser.gender },
                    { label: 'Marital Status', value: selectedUser.marital_status },
                    { label: 'Education Level', value: selectedUser.education_level },
                    { label: 'Province', value: selectedUser.province },
                    { label: 'District', value: selectedUser.district },
                    { label: 'Sector', value: selectedUser.sector },
                    { label: 'Cell', value: selectedUser.cell },
                    { label: 'Village', value: selectedUser.village },
                    { label: 'Farm Province', value: selectedUser.farm_province },
                    { label: 'Farm District', value: selectedUser.farm_district },
                    { label: 'Farm Sector', value: selectedUser.farm_sector },
                    { label: 'Farm Cell', value: selectedUser.farm_cell },
                    { label: 'Farm Village', value: selectedUser.farm_village },
                    { label: 'Farm Age', value: selectedUser.farm_age ? `${selectedUser.farm_age} years` : null },
                    { label: 'Planted', value: selectedUser.planted },
                    { label: 'Avocado Type', value: selectedUser.avocado_type },
                    { label: 'Mixed Percentage', value: selectedUser.mixed_percentage },
                    { label: 'Farm Size', value: selectedUser.farm_size },
                    { label: 'Tree Count', value: selectedUser.tree_count },
                    { label: 'UPI Number', value: selectedUser.upi_number },
                    { label: 'Assistance', value: selectedUser.assistance?.join(', ') }
                  ].map((field, index) => (
                    field.value && (
                      <p key={index} className="modal-field">
                        <span className="modal-field-label">{field.label}:</span> 
                        <span className="modal-field-value">{field.value || 'N/A'}</span>
                      </p>
                    )
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={closeModal}
                className="btn btn-view"
              >
                Close
              </button>
              {isEditMode && (
                <button className="btn btn-primary modal-save">
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