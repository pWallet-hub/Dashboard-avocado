import { useEffect, useState } from 'react';
import axios from 'axios';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select';
import { ClipLoader } from "react-spinners"; // Add spinner for loading state

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Users Management
            </h1>
            <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:mt-0">
              <button
                onClick={() => openModal(null, true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                + Add New User
              </button>
              <button 
                onClick={exportToExcel}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            </div>
            {/* Add more stats as needed */}
          </div>

          {/* Filter Section */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <label className="text-gray-600 whitespace-nowrap">Filter by District:</label>
              <div className="w-full md:w-64">
                <Select
                  options={users.map(user => ({
                    label: user.district, 
                    value: user.district
                  }))}
                  isClearable
                  onChange={handleDistrictChange}
                  placeholder="Select or search district"
                  className="text-sm"
                />
              </div>
            </div>
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
              ) : filteredUsers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">User Details</th>
                      <th className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase md:table-cell">Contact</th>
                      <th className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase lg:table-cell">Location</th>
                      {/* <th className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase lg:table-cell">Farm Details</th> */}
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                {user.full_name ? user.full_name.charAt(0) : 'U'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Age: {user.age || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Gender: {user.gender || 'N/A'}</div>
                              <div className="text-sm text-gray-500">Marital Status: {user.marital_status || 'N/A'}</div>
                              {/* <div className="text-sm text-gray-500">Education Level: {user.education_level || 'N/A'}</div> */}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
                          <div className="text-sm text-gray-900">{user.telephone || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                        </td>
                        <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                          <div className="text-sm text-gray-900">{user.province || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.district || 'N/A'}, {user.sector || 'N/A'}, {user.cell || 'N/A'}, {user.village || 'N/A'}</div>
                        </td>
                        {/* <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                          <div className="text-sm text-gray-900">Farm Province: {user.farm_province || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Farm District: {user.farm_district || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Farm Sector: {user.farm_sector || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Farm Cell: {user.farm_cell || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Farm Village: {user.farm_village || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Farm Age: {user.farm_age || 'N/A'} years</div>
                          <div className="text-sm text-gray-500">Planted: {user.planted || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Avocado Type: {user.avocado_type || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Mixed Percentage: {user.mixed_percentage || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Farm Size: {user.farm_size || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Tree Count: {user.tree_count || 'N/A'}</div>
                          <div className="text-sm text-gray-500">UPI Number: {user.upi_number || 'N/A'}</div>
                          <div className="text-sm text-gray-500">Assistance: {user.assistance.join(', ') || 'N/A'}</div>
                        </td> */}
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => openModal(user, false)}
                            className="inline-flex items-center px-3 py-1 text-blue-600 transition-colors bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openModal(user, true)}
                            className="inline-flex items-center px-3 py-1 text-indigo-600 transition-colors bg-indigo-100 rounded-md hover:bg-indigo-200"
                          >
                            <FiEdit className="mr-2" /> Edit
                          </button>
                          <button className="inline-flex items-center px-3 py-1 text-red-600 transition-colors bg-red-100 rounded-md hover:bg-red-200">
                            <MdOutlineDeleteOutline className="mr-2" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">No users found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for viewing/editing users */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="relative w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-700">{isEditMode ? 'Edit User' : 'User Details'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="mt-4 overflow-y-auto max-h-96"> {/* Set fixed height and enable scrolling */}
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
            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              {isEditMode && (
                <button className="inline-flex items-center px-4 py-2 ml-4 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
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
        className="fixed p-4 text-white bg-red-600 rounded-full shadow-lg bottom-4 right-4 hover:bg-red-700"
      >
        <CiLogout size={24} />
      </button>
    </div>
  );
};

export default Users;