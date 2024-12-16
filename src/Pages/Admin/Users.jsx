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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // New state for add/edit form
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    age: '',
    telephone: '',
    email: '',
    gender: '',
    marital_status: '',
    education_level: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    farm_province: '',
    farm_district: '',
    farm_sector: '',
    farm_cell: '',
    farm_village: '',
    farm_age: '',
    planted: '',
    avocado_type: '',
    mixed_percentage: '',
    farm_size: '',
    tree_count: '',
    upi_number: '',
    assistance: []
  });

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

  const openAddModal = () => {
    // Reset form when opening add modal
    setNewUserForm({
      full_name: '',
      age: '',
      telephone: '',
      email: '',
      gender: '',
      marital_status: '',
      education_level: '',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      farm_province: '',
      farm_district: '',
      farm_sector: '',
      farm_cell: '',
      farm_village: '',
      farm_age: '',
      planted: '',
      avocado_type: '',
      mixed_percentage: '',
      farm_size: '',
      tree_count: '',
      upi_number: '',
      assistance: []
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmitNewUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'https://pwallet-api.onrender.com/api/farmers/', 
        newUserForm, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update users list with new user
      setUsers(prevUsers => [...prevUsers, response.data]);
      
      // Close modal and reset form
      closeAddModal();
    } catch (error) {
      setError('Error adding new user: ' + (error.response?.data?.message || error.message));
      console.error('Error adding user:', error);
    } finally {
      setLoading(false);
    }
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

  const assistanceOptions = [
    { value: 'Training', label: 'Training' },
    { value: 'Financial Support', label: 'Financial Support' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Technical Advice', label: 'Technical Advice' }
  ];

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
                onClick={openAddModal}
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

      {/* View/Edit User Modal */}
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
                   // Continuing the previous code...
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

     {/* Add User Modal */}
     {isAddModalOpen && (
       <div className="modal-overlay">
         <div className="modal-container">
           <div className="modal-header1">
             <h2 className="modal-title">+ Add New User</h2>
             <button onClick={closeAddModal} className="modal-close">
               &times;
             </button>
           </div>
           <form onSubmit={handleSubmitNewUser} className="modal-content">
             <div className="modal-grid">
               {/* Personal Information */}
               <div className="form-group">
                 <label>Full Name *</label>
                 <input 
                   type="text" 
                   name="full_name" 
                   value={newUserForm.full_name}
                   onChange={handleInputChange}
                   required 
                 />
               </div>
               <div className="form-group">
                 <label>Age</label>
                 <input 
                   type="number" 
                   name="age" 
                   value={newUserForm.age}
                   onChange={handleInputChange}
                   min="18"
                   max="120"
                 />
               </div>
               <div className="form-group">
                 <label>Phone Number</label>
                 <input 
                   type="tel" 
                   name="telephone" 
                   value={newUserForm.telephone}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Email</label>
                 <input 
                   type="email" 
                   name="email" 
                   value={newUserForm.email}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Gender *</label>
                 <select 
                   name="gender" 
                   value={newUserForm.gender}
                   onChange={handleInputChange}
                   required
                 >
                   <option value="">Select Gender</option>
                   <option value="Male">Male</option>
                   <option value="Female">Female</option>
                   <option value="Other">Other</option>
                 </select>
               </div>
               <div className="form-group">
                 <label>Marital Status</label>
                 <select 
                   name="marital_status" 
                   value={newUserForm.marital_status}
                   onChange={handleInputChange}
                 >
                   <option value="">Select Marital Status</option>
                   <option value="Single">Single</option>
                   <option value="Married">Married</option>
                   <option value="Divorced">Divorced</option>
                   <option value="Widowed">Widowed</option>
                 </select>
               </div>
               <div className="form-group">
                 <label>Education Level</label>
                 <select 
                   name="education_level" 
                   value={newUserForm.education_level}
                   onChange={handleInputChange}
                 >
                   <option value="">Select Education Level</option>
                   <option value="Primary">Primary</option>
                   <option value="Secondary">Secondary</option>
                   <option value="Tertiary">University</option>
                   <option value="None">None</option>
                 </select>
               </div>

               {/* Personal Location */}
               <div className="form-group">
                 <label>Province</label>
                 <input 
                   type="text" 
                   name="province" 
                   value={newUserForm.province}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>District</label>
                 <input 
                   type="text" 
                   name="district" 
                   value={newUserForm.district}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Sector</label>
                 <input 
                   type="text" 
                   name="sector" 
                   value={newUserForm.sector}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Cell</label>
                 <input 
                   type="text" 
                   name="cell" 
                   value={newUserForm.cell}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Village</label>
                 <input 
                   type="text" 
                   name="village" 
                   value={newUserForm.village}
                   onChange={handleInputChange}
                 />
               </div>

               {/* Farm Details */}
               <div className="form-group">
                 <label>Farm Province</label>
                 <input 
                   type="text" 
                   name="farm_province" 
                   value={newUserForm.farm_province}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Farm District</label>
                 <input 
                   type="text" 
                   name="farm_district" 
                   value={newUserForm.farm_district}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Farm Sector</label>
                 <input 
                   type="text" 
                   name="farm_sector" 
                   value={newUserForm.farm_sector}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Farm Cell</label>
                 <input 
                   type="text" 
                   name="farm_cell" 
                   value={newUserForm.farm_cell}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Farm Village</label>
                 <input 
                   type="text" 
                   name="farm_village" 
                   value={newUserForm.farm_village}
                   onChange={handleInputChange}
                 />
               </div>

               {/* Additional Farm Details */}
               <div className="form-group">
                 <label>Farm Age (Years)</label>
                 <input 
                   type="number" 
                   name="farm_age" 
                   value={newUserForm.farm_age}
                   onChange={handleInputChange}
                   min="0"
                 />
               </div>
               <div className="form-group">
                 <label>Planted</label>
                 <input 
                   type="text" 
                   name="planted" 
                   value={newUserForm.planted}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Avocado Type</label>
                 <input 
                   type="text" 
                   name="avocado_type" 
                   value={newUserForm.avocado_type}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Mixed Percentage</label>
                 <input 
                   type="number" 
                   name="mixed_percentage" 
                   value={newUserForm.mixed_percentage}
                   onChange={handleInputChange}
                   min="0"
                   max="100"
                 />
               </div>
               <div className="form-group">
                 <label>Farm Size</label>
                 <input 
                   type="text" 
                   name="farm_size" 
                   value={newUserForm.farm_size}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group">
                 <label>Tree Count</label>
                 <input 
                   type="number" 
                   name="tree_count" 
                   value={newUserForm.tree_count}
                   onChange={handleInputChange}
                   min="0"
                 />
               </div>
               <div className="form-group">
                 <label>UPI Number</label>
                 <input 
                   type="text" 
                   name="upi_number" 
                   value={newUserForm.upi_number}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="form-group full-width">
                 <label>Assistance</label>
                 <Select
                   isMulti
                   name="assistance"
                   options={assistanceOptions}
                   value={newUserForm.assistance.map(item => ({ 
                     value: item, 
                     label: item 
                   }))}
                   onChange={(selectedOptions) => {
                     setNewUserForm(prevState => ({
                       ...prevState,
                       assistance: selectedOptions 
                         ? selectedOptions.map(option => option.value) 
                         : []
                     }));
                   }}
                   placeholder="Select Assistance Types"
                 />
               </div>

               <div className="modal-footer full-width">
                 <button 
                   type="button" 
                   onClick={closeAddModal} 
                   className="btn btn-secondary"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="btn btn-primary"
                   disabled={loading}
                 >
                   {loading ? <ClipLoader color="#fff" size={20} /> : 'Add User'}
                 </button>
               </div>
             </div>
           </form>
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