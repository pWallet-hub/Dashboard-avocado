import { useEffect, useState } from 'react';
import axios from 'axios';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select'; 

const Dashboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Updated to match react-select
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://applicanion-api.onrender.com/api/users', {
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

  const openModal = (farmer, editMode = false) => {
    setSelectedFarmer(farmer);
    setIsEditMode(editMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
    setIsEditMode(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(farmers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmers');
    XLSX.writeFile(workbook, 'FarmersData.xlsx');
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : '');
  };

  const districtOptions = farmers
    .map(farmer => farmer.district)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(district => ({
      label: district,
      value: district
    }));

  const filteredFarmers = selectedDistrict
    ? farmers.filter(farmer => farmer.district === selectedDistrict)
    : farmers;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleEdit = async (farmer) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`https://applicanion-api.onrender.com/api/users/${farmer.id}`, farmer, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFarmers(farmers.map(f => (f.id === farmer.id ? response.data : f)));
      closeModal();
    } catch (error) {
      setError('There was an error updating the farmer!');
    }
  };

  const handleDelete = async (farmerId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://applicanion-api.onrender.com/api/users/${farmerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFarmers(farmers.filter(f => f.id !== farmerId));
    } catch (error) {
      setError('There was an error deleting the farmer!');
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-center p-5 mb-5 text-white bg-teal-700 rounded-lg">
        <img src={logo} alt="Logo" className="w-24 mr-5" />
        <div className="flex-grow">
          <h1 className="mb-1 text-2xl font-bold">Avocado Society of Rwanda</h1>
          <p className="text-lg opacity-80">
            Ibarura ry'abahinzi bafite ubutaka bakaba bifuza gutera no gukora Ubuhinzi bw' avoka by' umwuga
          </p>
        </div>
        <button className="flex items-center px-4 py-2 ml-auto text-white transition duration-300 bg-green-500 rounded hover:bg-green-600" onClick={handleLogout}>
          <CiLogout className="mr-2 text-2xl" /> Logout
        </button>
      </div>
      <div className="flex justify-between mb-5">
        <h2 className="text-xl">Farmers</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-white transition duration-300 bg-green-600 rounded hover:bg-green-700">Add Farmer</button>
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
        ) : filteredFarmers.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-white bg-green-500">First Name</th>
                <th className="p-3 text-white bg-green-500">Last Name</th>
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
              {filteredFarmers.map((farmer, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{farmer.firstname || 'N/A'}</td>
                  <td className="p-3">{farmer.lastname || 'N/A'}</td>
                  <td className="p-3">{farmer.telephone || 'N/A'}</td>
                  <td className="p-3">{farmer.age || 'N/A'}</td>
                  <td className="p-3">{farmer.district || 'N/A'}</td>
                  <td className="p-3">{farmer.sector || 'N/A'}</td>
                  <td className="p-3">{farmer.cell || 'N/A'}</td>
                  <td className="p-3">{farmer.village || 'N/A'}</td>
                  <td className="flex gap-2 ml-[-1rem]">
                    <button className="px-2 py-1 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600" onClick={() => openModal(farmer, false)}>View</button>
                    <button className="px-2 py-1 text-white transition duration-300 bg-yellow-500 rounded hover:bg-yellow-600" onClick={() => openModal(farmer, true)}><FiEdit /></button>
                    <button 
                      className="px-2 py-1 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600" 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this farmer?')) {
                          handleDelete(farmer.id);
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
          <p>No Farmers Available</p>
        )}
      </div>
      {isModalOpen && selectedFarmer && (
        <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50" onClick={handleOverlayClick}>
          <div className="bg-white p-8 w-96 rounded-lg shadow-lg relative max-h-[80vh] flex flex-col">
            <span className="absolute text-2xl cursor-pointer top-2 right-5" onClick={closeModal}>&times;</span>
            <h2 className="mb-4 text-xl">Farmer Details</h2>
            <div className="flex-grow overflow-y-auto pr-4 mr-[-1rem]">
              {Object.entries(selectedFarmer).map(([key, value]) => (
                <p key={key} className="flex items-center justify-between mb-4 text-sm text-green-600">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                  {isEditMode ? (
                    <input
                      type="text"
                      name={key}
                      value={value || ''}
                      onChange={(e) => setSelectedFarmer({ ...selectedFarmer, [key]: e.target.value })}
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
                <button className="px-4 py-2 text-white transition duration-300 bg-yellow-500 rounded hover:bg-yellow-600" onClick={() => handleEdit(selectedFarmer)} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="px-4 py-2 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600" onClick={closeModal}>Cancel</button>
              </div>
            )}
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;