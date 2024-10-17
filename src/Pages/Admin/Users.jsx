import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select';

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

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
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

  const districtOptions = users
    .map(user => user.district)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(district => ({
      label: district,
      value: district
    }));

  const filteredUsers = selectedDistrict
    ? users.filter(user => user.district === selectedDistrict)
    : users;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleEdit = async (user) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`https://applicanion-api.onrender.com/api/users/${user.id}`, user, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(users.map(u => (u.id === user.id ? response.data : u)));
      closeModal();
    } catch (error) {
      setError('There was an error updating the user!');
    }
  };

  const handleDelete = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://applicanion-api.onrender.com/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      setError('There was an error deleting the user!');
    }
  };

  return (
    <div className="p-5">
      <div className="flex justify-between mb-5">
        <h2 className="text-xl">Users</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-white transition duration-300 bg-green-600 rounded hover:bg-green-700">Add User</button>
          <button className="px-4 py-2 text-white transition duration-300 bg-green-600 rounded hover:bg-green-700" onClick={exportToExcel}>Export to Excel</button>
        </div>
      </div>

      <div className="flex items-center gap-8 mb-5 ml-4">
        <label htmlFor="district-select">Filter by District: </label>
        <Select
          id="district-select"
          options={districtOptions}
          isClearable
          onChange={handleDistrictChange}
          placeholder="Select or search district"
        />
      </div>
      <div className="p-5 bg-white rounded-lg shadow-md">
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredUsers.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-white bg-green-500">Full Name</th>
                <th className="p-3 text-white bg-green-500">Telephone</th>
                <th className="p-3 text-white bg-green-500">Age</th>
                <th className="p-3 text-white bg-green-500">District</th>
                <th className="p-3 text-white bg-green-500">Sector</th>
                <th className="p-3 text-white bg-green-500">Cell</th>
                <th className="p-3 text-white bg-green-500">Village</th>
                <th className="p-3 text-white bg-green-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{user.full_name || 'N/A'}</td>
                  <td className="p-3">{user.telephone || 'N/A'}</td>
                  <td className="p-3">{user.age || 'N/A'}</td>
                  <td className="p-3">{user.district || 'N/A'}</td>
                  <td className="p-3">{user.sector || 'N/A'}</td>
                  <td className="p-3">{user.cell || 'N/A'}</td>
                  <td className="p-3">{user.village || 'N/A'}</td>
                  <td className="flex gap-2 ml-[-1rem]">
                    <button className="px-2 py-1 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600" onClick={() => openModal(user, false)}>View</button>
                    <button className="px-2 py-1 text-white transition duration-300 bg-yellow-500 rounded hover:bg-yellow-600" onClick={() => openModal(user, true)}><FiEdit /></button>
                    <button 
                      className="px-2 py-1 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this user?')) {
                          handleDelete(user.id);
                        }
                      }}
                    >
                      <MdOutlineDeleteOutline />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Users Available</p>
        )}
      </div>
      {isModalOpen && selectedUser && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50" onClick={handleOverlayClick}>
          <div className="bg-white p-8 w-96 rounded-lg shadow-lg relative max-h-[80vh] flex flex-col">
            <span className="absolute text-2xl cursor-pointer top-2 right-5" onClick={closeModal}>&times;</span>
            <h2 className="mb-4 text-xl">User Details</h2>
            <div className="flex-grow overflow-y-auto pr-4 mr-[-1rem]">
              {Object.entries(selectedUser).map(([key, value]) => (
                <p key={key} className="flex items-center justify-between mb-4 text-sm text-green-600">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                  {isEditMode ? (
                    <input
                      type="text"
                      name={key}
                      value={value || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, [key]: e.target.value })}
                      className="flex-grow p-1 ml-4 text-sm border border-gray-300 rounded"
                    />
                  ) : (
                    ` ${value || 'N/A'}`
                  )}
                </p>
              ))}
            </div>
            {isEditMode && (
              <div className="flex justify-center gap-5 mt-4">
                <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={() => handleEdit(selectedUser)}>Save</button>
                <button className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600" onClick={closeModal}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
      <button className="flex items-center gap-1 px-4 py-2 mt-6 text-white bg-green-600 rounded hover:bg-green-700" onClick={handleLogout}>
        Logout <CiLogout size={20} />
      </button>
    </div>
  );
};

export default Users;
