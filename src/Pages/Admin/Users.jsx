import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select';
import { ClipLoader } from "react-spinners";
import { CheckCircle2, XCircle, Edit2, X } from 'lucide-react';
import '../Styles/Growers.css';
import { listFarmers, createFarmer, updateUser, deleteUser } from '../../services/usersService';
import { getFarmerProfileById, updateFarmerProfileById, verifyFarmerProfile } from '../../services/farmer-information';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const Users = () => {
  const toast = useToast();
  const confirm = useConfirm();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Extended farmer profile state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [extendedProfile, setExtendedProfile] = useState(null);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState(null);

  // Get logged-in user info
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userDisplayName = loggedInUser.full_name || loggedInUser.name || 'Admin User';

  // Form state
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
      try {
        const response = await listFarmers();
        setUsers(response?.data || []);
      } catch (error) {
        console.error('Error fetching farmers:', error);
        setError('Failed to load farmers.');
        setUsers([]);
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

  const normalizeExtendedProfile = (response) => {
    const payload = response?.data ?? response ?? {};
    const farmerProfile = payload.farmer_profile || payload.data?.farmer_profile || payload;
    const userInfo = payload.user || payload.data?.user || null;
    return { user: userInfo, farmer_profile: farmerProfile };
  };

  const openExtendedProfile = async (user) => {
    setProfileUser(user);
    setIsProfileModalOpen(true);
    setIsProfileEditMode(false);
    setProfileError(null);
    setExtendedProfile(null);
    setProfileLoading(true);
    try {
      const response = await getFarmerProfileById(user.id);
      const normalized = normalizeExtendedProfile(response);
      setExtendedProfile(normalized);
      setProfileForm({ ...normalized.farmer_profile });
    } catch (err) {
      console.error('Error fetching extended farmer profile:', err);
      setProfileError(err.message || 'Failed to load extended profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const closeExtendedProfile = () => {
    setIsProfileModalOpen(false);
    setProfileUser(null);
    setExtendedProfile(null);
    setIsProfileEditMode(false);
    setProfileForm({});
    setProfileError(null);
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveExtendedProfile = async () => {
    if (!profileUser) return;
    setProfileSaving(true);
    try {
      const updateData = { ...profileForm };
      ['age', 'farm_age', 'mixed_percentage', 'farm_size', 'tree_count'].forEach(field => {
        if (updateData[field] === '' || updateData[field] === undefined) {
          delete updateData[field];
        } else if (['age', 'farm_age', 'tree_count'].includes(field)) {
          updateData[field] = parseInt(updateData[field], 10);
        } else {
          updateData[field] = parseFloat(updateData[field]);
        }
      });
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.verification_status;

      const response = await updateFarmerProfileById(profileUser.id, updateData);
      const normalized = normalizeExtendedProfile(response);
      setExtendedProfile(prev => ({
        user: normalized.user || prev?.user,
        farmer_profile: normalized.farmer_profile || { ...prev?.farmer_profile, ...updateData },
      }));
      setIsProfileEditMode(false);
      toast.success('Farmer profile updated successfully');
    } catch (err) {
      console.error('Error updating extended farmer profile:', err);
      toast.error(err.message || 'Failed to update farmer profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleVerifyFarmerProfile = async (status) => {
    const profileRecordId = extendedProfile?.farmer_profile?.id;
    if (!profileRecordId) {
      toast.error('Unable to determine farmer profile record. Please reopen the profile and try again.');
      return;
    }

    const confirmed = await confirm(
      status === 'verified'
        ? 'Are you sure you want to verify this farmer profile?'
        : 'Are you sure you want to reject this farmer profile?',
      {
        title: status === 'verified' ? 'Verify Farmer Profile' : 'Reject Farmer Profile',
        confirmLabel: status === 'verified' ? 'Verify' : 'Reject',
        danger: status !== 'verified',
      }
    );
    if (!confirmed) return;

    setVerifyingStatus(status);
    try {
      const response = await verifyFarmerProfile(profileRecordId, status);
      const normalized = normalizeExtendedProfile(response);
      setExtendedProfile(prev => ({
        user: normalized.user || prev?.user,
        farmer_profile: {
          ...prev?.farmer_profile,
          ...normalized.farmer_profile,
          verification_status: normalized.farmer_profile?.verification_status || status,
        },
      }));
      toast.success(status === 'verified' ? 'Farmer profile verified successfully' : 'Farmer profile rejected');
    } catch (err) {
      console.error('Error verifying farmer profile:', err);
      toast.error(err.message || 'Failed to update verification status.');
    } finally {
      setVerifyingStatus(null);
    }
  };

  const openAddModal = () => {
    setNewUserForm({
      full_name: '', age: '', telephone: '', email: '', gender: '', marital_status: '',
      education_level: '', province: '', district: '', sector: '', cell: '', village: '',
      farm_province: '', farm_district: '', farm_sector: '', farm_cell: '', farm_village: '',
      farm_age: '', planted: '', avocado_type: '', mixed_percentage: '', farm_size: '',
      tree_count: '', upi_number: '', assistance: []
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const farmerData = {
        full_name: newUserForm.full_name,
        email: newUserForm.email,
        phone: newUserForm.telephone,
        age: newUserForm.age ? parseInt(newUserForm.age) : undefined,
        gender: newUserForm.gender,
        marital_status: newUserForm.marital_status,
        education_level: newUserForm.education_level,
        province: newUserForm.province,
        district: newUserForm.district,
        sector: newUserForm.sector,
        cell: newUserForm.cell,
        village: newUserForm.village,
        farm_province: newUserForm.farm_province,
        farm_district: newUserForm.farm_district,
        farm_sector: newUserForm.farm_sector,
        farm_cell: newUserForm.farm_cell,
        farm_village: newUserForm.farm_village,
        farm_age: newUserForm.farm_age ? parseInt(newUserForm.farm_age) : undefined,
        planted: newUserForm.planted,
        avocado_type: newUserForm.avocado_type,
        mixed_percentage: newUserForm.mixed_percentage ? parseInt(newUserForm.mixed_percentage) : undefined,
        farm_size: newUserForm.farm_size ? parseFloat(newUserForm.farm_size) : undefined,
        tree_count: newUserForm.tree_count ? parseInt(newUserForm.tree_count) : undefined,
        upi_number: newUserForm.upi_number,
        assistance: newUserForm.assistance
      };

      Object.keys(farmerData).forEach(key => {
        if (farmerData[key] === undefined || farmerData[key] === '') {
          delete farmerData[key];
        }
      });

      const response = await createFarmer(farmerData);
      setUsers(prev => [...prev, response]);
      closeAddModal();
      toast.success('Farmer added successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to add farmer.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await updateUser(userId, userData);
      setUsers(prev => prev.map(user => user.id === userId ? response : user));
      closeModal();
    } catch (error) {
      setError('Failed to update farmer.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (await confirm('Are you sure you want to delete this farmer?')) {
      try {
        await deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('Farmer deleted successfully');
      } catch (error) {
        setError('Failed to delete farmer.');
      }
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredUsers.map(user => ({
      'Full Name': user.full_name || 'N/A',
      'Age': user.age || 'N/A',
      'Phone': user.telephone || user.phone || 'N/A',
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
      'Assistance': Array.isArray(user.assistance) ? user.assistance.join(', ') : user.assistance || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Farmers');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(wb, `Farmers_${timestamp}.xlsx`);
  };

  const handleDistrictChange = (opt) => setSelectedDistrict(opt ? opt.value : null);
  const handleProvinceChange = (opt) => setSelectedProvince(opt ? opt.value : null);
  const handleGenderChange = (opt) => setSelectedGender(opt ? opt.value : null);

  const filteredUsers = users.filter(user => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (user.full_name?.toLowerCase().includes(search)) ||
      (user.email?.toLowerCase().includes(search)) ||
      (user.telephone?.toLowerCase().includes(search)) ||
      (user.phone?.toLowerCase().includes(search));

    const matchesDistrict = !selectedDistrict || user.district === selectedDistrict;
    const matchesProvince = !selectedProvince || user.province === selectedProvince;
    const matchesGender = !selectedGender || user.gender === selectedGender;

    return matchesSearch && matchesDistrict && matchesProvince && matchesGender;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const assistanceOptions = [
    { value: 'Training', label: 'Training' },
    { value: 'Financial Support', label: 'Financial Support' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Technical Advice', label: 'Technical Advice' }
  ];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="modern-users-container font-['Poppins']">
      
      <div className="modern-content-wrapper">
        <div className="modern-main-content">
          
          {/* Search & Add */}
          <div className="modern-controls-bar">
            <div className="modern-search-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or phone"
                className="modern-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={openAddModal} className="modern-add-btn cursor-pointer">
              + Add Farmer
            </button>
          </div>

          {/* Filters */}
          <div className="modern-filters-row">
            <div className="filter-group">
              <label>District</label>
              <Select
                options={[...new Set(users.map(u => u.district))].filter(Boolean).map(d => ({ label: d, value: d }))}
                isClearable
                onChange={handleDistrictChange}
                placeholder="All"
                className="modern-select"
                classNamePrefix="modern-select"
              />
            </div>
            <div className="filter-group">
              <label>Province</label>
              <Select
                options={[...new Set(users.map(u => u.province))].filter(Boolean).map(p => ({ label: p, value: p }))}
                isClearable
                onChange={handleProvinceChange}
                placeholder="All"
                className="modern-select"
                classNamePrefix="modern-select"
              />
            </div>
            <div className="filter-group">
              <label>Gender</label>
              <Select
                options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]}
                isClearable
                onChange={handleGenderChange}
                placeholder="All"
                className="modern-select"
                classNamePrefix="modern-select"
              />
            </div>
            <button onClick={exportToExcel} className="modern-filters-btn cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M16 11v4a1 1 0 01-1 1H3a1 1 0 01-1-1v-4M13 6l-4-4m0 0L5 6m4-4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          </div>

          {/* Error */}
          {error && <div className="modern-error-message">{error}</div>}

          {/* Table */}
          <div className="modern-table-container">
            {loading ? (
              <div className="modern-loading">
                <ClipLoader color="#4F46E5" size={50} />
              </div>
            ) : paginatedUsers.length > 0 ? (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Phone Number</th>
                    <th>District</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Province Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(user => (
                    <tr key={user.id}>
                      <td><div className="company-name">{user.full_name || 'N/A'}</div></td>
                      <td className="phone-col">{user.telephone || user.phone || 'N/A'}</td>
                      <td className="department-col">{user.district || 'N/A'}</td>
                      <td><span className="user-email">{user.email || 'N/A'}</span></td>
                      <td className="role-col">{user.gender || 'N/A'}</td>
                      <td>
                        <div className="status-wrapper">
                          <span className={`status-badge ${user.province ? 'active' : 'inactive'}`}>
                            {user.province || 'No Province'}
                          </span>
                          <label className="toggle-switch">
                            <input type="checkbox" defaultChecked={!!user.province} />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="modern-actions-menu">
                          <button className="actions-btn">⋮</button>
                          <div className="actions-dropdown">
                            <button onClick={() => openModal(user, false)}>View Details</button>
                            <button onClick={() => openModal(user, true)}>Edit Farmer</button>
                            <button onClick={() => openExtendedProfile(user)}>Extended Profile</button>
                            <button onClick={() => handleDeleteUser(user.id)} className="delete-action">Delete</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="modern-no-data">No farmers found.</div>
            )}
          </div>

          {/* Pagination */}
          <div className="modern-pagination">
            <div className="pagination-info">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="items-per-page-select"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-arrow"
              >‹</button>
              {getPageNumbers().map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`pagination-number ${currentPage === num ? 'active' : ''}`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-arrow"
              >›</button>
            </div>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditMode ? '✏️ Edit Farmer' : '👤 Farmer Details'}
              </h2>
              <button onClick={closeModal} className="modal-close">&times;</button>
            </div>
            <div className="modal-content">
              <div className="modal-grid">
                {[
                  { label: 'Full Name', value: selectedUser.full_name },
                  { label: 'Age', value: selectedUser.age },
                  { label: 'Phone', value: selectedUser.telephone || selectedUser.phone },
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
                  { label: 'Assistance', value: Array.isArray(selectedUser.assistance) ? selectedUser.assistance.join(', ') : selectedUser.assistance }
                ].map((field, i) => field.value && (
                  <div key={i} className="modal-field">
                    <span className="modal-field-label">{field.label}</span>
                    <span className="modal-field-value">{field.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
              {isEditMode && (
                <button onClick={() => handleUpdateUser(selectedUser.id, selectedUser)} className="btn btn-primary modal-save">
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Farmer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-5 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp">
            <div className="px-7 py-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-b from-white to-gray-50 rounded-t-2xl flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </span>
                Add New Farmer
              </h2>
              <button 
                onClick={closeAddModal} 
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200 hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitNewUser} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-7 py-6 overflow-y-auto flex-1 custom-scrollbar">
                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="full_name" 
                        value={newUserForm.full_name} 
                        onChange={handleInputChange} 
                        required
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:shadow-sm"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Age</label>
                      <input 
                        type="number" 
                        name="age" 
                        value={newUserForm.age} 
                        onChange={handleInputChange} 
                        min="18"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Age"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="telephone" 
                        value={newUserForm.telephone} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={newUserForm.email} 
                        onChange={handleInputChange} 
                        required
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select 
                        name="gender" 
                        value={newUserForm.gender} 
                        onChange={handleInputChange} 
                        required
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                      <select 
                        name="marital_status" 
                        value={newUserForm.marital_status} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white cursor-pointer"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Education Level</label>
                      <select 
                        name="education_level" 
                        value={newUserForm.education_level} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white cursor-pointer"
                      >
                        <option value="">Select Level</option>
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="University">University</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Residence Location */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Residence Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Province</label>
                      <input 
                        type="text" 
                        name="province" 
                        value={newUserForm.province} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Province"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">District</label>
                      <input 
                        type="text" 
                        name="district" 
                        value={newUserForm.district} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="District"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Sector</label>
                      <input 
                        type="text" 
                        name="sector" 
                        value={newUserForm.sector} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Sector"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Cell</label>
                      <input 
                        type="text" 
                        name="cell" 
                        value={newUserForm.cell} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Cell"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Village</label>
                      <input 
                        type="text" 
                        name="village" 
                        value={newUserForm.village} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        placeholder="Village"
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Location */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Farm Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm Province</label>
                      <input 
                        type="text" 
                        name="farm_province" 
                        value={newUserForm.farm_province} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Farm Province"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm District</label>
                      <input 
                        type="text" 
                        name="farm_district" 
                        value={newUserForm.farm_district} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Farm District"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm Sector</label>
                      <input 
                        type="text" 
                        name="farm_sector" 
                        value={newUserForm.farm_sector} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Farm Sector"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm Cell</label>
                      <input 
                        type="text" 
                        name="farm_cell" 
                        value={newUserForm.farm_cell} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Farm Cell"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm Village</label>
                      <input 
                        type="text" 
                        name="farm_village" 
                        value={newUserForm.farm_village} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Farm Village"
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    Farm Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm Age (Years)</label>
                      <input 
                        type="number" 
                        name="farm_age" 
                        value={newUserForm.farm_age} 
                        onChange={handleInputChange} 
                        min="0"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Years"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Planted</label>
                      <input 
                        type="text" 
                        name="planted" 
                        value={newUserForm.planted} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Planted"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Avocado Type</label>
                      <input 
                        type="text" 
                        name="avocado_type" 
                        value={newUserForm.avocado_type} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Avocado Type"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Mixed Percentage</label>
                      <input 
                        type="number" 
                        name="mixed_percentage" 
                        value={newUserForm.mixed_percentage} 
                        onChange={handleInputChange} 
                        min="0" 
                        max="100"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="%"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Farm Size</label>
                      <input 
                        type="text" 
                        name="farm_size" 
                        value={newUserForm.farm_size} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Farm Size"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Tree Count</label>
                      <input 
                        type="number" 
                        name="tree_count" 
                        value={newUserForm.tree_count} 
                        onChange={handleInputChange} 
                        min="0"
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="Number of Trees"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-700 mb-2">UPI Number</label>
                      <input 
                        type="text" 
                        name="upi_number" 
                        value={newUserForm.upi_number} 
                        onChange={handleInputChange}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
                        placeholder="UPI Number"
                      />
                    </div>

                    <div className="flex flex-col md:col-span-2 lg:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-2">Assistance</label>
                      <Select
                        isMulti
                        options={assistanceOptions}
                        value={newUserForm.assistance.map(a => ({ value: a, label: a }))}
                        onChange={(opts) => setNewUserForm(prev => ({
                          ...prev,
                          assistance: opts ? opts.map(o => o.value) : []
                        }))}
                        placeholder="Select assistance types..."
                        className="text-sm"
                        classNamePrefix="select"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-7 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={closeAddModal} 
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {loading ? (
                    <>
                      <ClipLoader color="#fff" size={18} />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Farmer</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extended Farmer Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">
                Extended Profile - {profileUser?.full_name || 'Farmer'}
              </h3>
              <button onClick={closeExtendedProfile} className="text-green-400 hover:text-green-600 text-2xl">
                <X size={24} />
              </button>
            </div>

            {profileLoading ? (
              <div className="flex justify-center py-12">
                <ClipLoader color="#4F46E5" size={40} />
              </div>
            ) : profileError ? (
              <div className="modern-error-message">{profileError}</div>
            ) : extendedProfile?.farmer_profile ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Verification Status:</span>
                    {(() => {
                      const status = extendedProfile.farmer_profile.verification_status || 'pending';
                      const colorClass = status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700';
                      return (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    {extendedProfile.farmer_profile.verification_status !== 'verified' && (
                      <button
                        onClick={() => handleVerifyFarmerProfile('verified')}
                        disabled={verifyingStatus !== null}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        {verifyingStatus === 'verified' ? 'Verifying...' : 'Verify'}
                      </button>
                    )}
                    {extendedProfile.farmer_profile.verification_status !== 'rejected' && (
                      <button
                        onClick={() => handleVerifyFarmerProfile('rejected')}
                        disabled={verifyingStatus !== null}
                        className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        {verifyingStatus === 'rejected' ? 'Rejecting...' : 'Reject'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mb-4">
                  {!isProfileEditMode ? (
                    <button
                      onClick={() => setIsProfileEditMode(true)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50"
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsProfileEditMode(false);
                          setProfileForm({ ...extendedProfile.farmer_profile });
                        }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveExtendedProfile}
                        disabled={profileSaving}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {profileSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {!isProfileEditMode ? (
                  <div className="modal-grid">
                    {[
                      { label: 'Age', value: extendedProfile.farmer_profile.age },
                      { label: 'ID Number', value: extendedProfile.farmer_profile.id_number },
                      { label: 'Gender', value: extendedProfile.farmer_profile.gender },
                      { label: 'Marital Status', value: extendedProfile.farmer_profile.marital_status },
                      { label: 'Education Level', value: extendedProfile.farmer_profile.education_level },
                      { label: 'Province', value: extendedProfile.farmer_profile.province },
                      { label: 'District', value: extendedProfile.farmer_profile.district },
                      { label: 'Sector', value: extendedProfile.farmer_profile.sector },
                      { label: 'Cell', value: extendedProfile.farmer_profile.cell },
                      { label: 'Village', value: extendedProfile.farmer_profile.village },
                      { label: 'Farm Province', value: extendedProfile.farmer_profile.farm_province },
                      { label: 'Farm District', value: extendedProfile.farmer_profile.farm_district },
                      { label: 'Farm Sector', value: extendedProfile.farmer_profile.farm_sector },
                      { label: 'Farm Cell', value: extendedProfile.farmer_profile.farm_cell },
                      { label: 'Farm Village', value: extendedProfile.farmer_profile.farm_village },
                      { label: 'Farm Age', value: extendedProfile.farmer_profile.farm_age ? `${extendedProfile.farmer_profile.farm_age} years` : null },
                      { label: 'Planted', value: extendedProfile.farmer_profile.planted },
                      { label: 'Avocado Type', value: extendedProfile.farmer_profile.avocado_type },
                      { label: 'Mixed Percentage', value: extendedProfile.farmer_profile.mixed_percentage },
                      { label: 'Farm Size', value: extendedProfile.farmer_profile.farm_size },
                      { label: 'Tree Count', value: extendedProfile.farmer_profile.tree_count },
                      { label: 'UPI Number', value: extendedProfile.farmer_profile.upi_number },
                      {
                        label: 'Assistance',
                        value: Array.isArray(extendedProfile.farmer_profile.assistance)
                          ? extendedProfile.farmer_profile.assistance.join(', ')
                          : extendedProfile.farmer_profile.assistance,
                      },
                    ].map((field, i) => field.value && (
                      <div key={i} className="modal-field">
                        <span className="modal-field-label">{field.label}</span>
                        <span className="modal-field-value">{field.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'age', label: 'Age', type: 'number' },
                      { name: 'id_number', label: 'ID Number', type: 'text' },
                      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                      { name: 'marital_status', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
                      { name: 'education_level', label: 'Education Level', type: 'select', options: ['Primary', 'Secondary', 'University', 'None'] },
                      { name: 'province', label: 'Province', type: 'text' },
                      { name: 'district', label: 'District', type: 'text' },
                      { name: 'sector', label: 'Sector', type: 'text' },
                      { name: 'cell', label: 'Cell', type: 'text' },
                      { name: 'village', label: 'Village', type: 'text' },
                      { name: 'farm_province', label: 'Farm Province', type: 'text' },
                      { name: 'farm_district', label: 'Farm District', type: 'text' },
                      { name: 'farm_sector', label: 'Farm Sector', type: 'text' },
                      { name: 'farm_cell', label: 'Farm Cell', type: 'text' },
                      { name: 'farm_village', label: 'Farm Village', type: 'text' },
                      { name: 'farm_age', label: 'Farm Age (Years)', type: 'number' },
                      { name: 'planted', label: 'Planted', type: 'text' },
                      { name: 'avocado_type', label: 'Avocado Type', type: 'text' },
                      { name: 'mixed_percentage', label: 'Mixed Percentage (%)', type: 'number' },
                      { name: 'farm_size', label: 'Farm Size', type: 'number' },
                      { name: 'tree_count', label: 'Tree Count', type: 'number' },
                      { name: 'upi_number', label: 'UPI Number', type: 'text' },
                    ].map((field) => (
                      <div key={field.name} className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            name={field.name}
                            value={profileForm[field.name] || ''}
                            onChange={handleProfileFormChange}
                            className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={profileForm[field.name] ?? ''}
                            onChange={handleProfileFormChange}
                            className="px-4 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none focus:border-indigo-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="modern-no-data">No extended profile found for this farmer.</div>
            )}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-btn">
        <CiLogout size={24} />
      </button>
    </div>
  );
};

export default Users;