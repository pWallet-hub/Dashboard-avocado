import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select'; // Import react-select

const Dashboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Updated to match react-select
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const openModal = (farmer) => {
    setSelectedFarmer(farmer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
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

  return (
    <div className="dashboard-container">
      <div className="header-section">
        <img src={logo} alt="Logo" className="logo" />
        <div className="header-text">
          <h1 className="main-title">Avocado Society of Rwanda</h1>
          <p className="subtitle">
            Ibarura ry’abahinzi bafite ubutaka bakaba bifuza gutera no gukora Ubuhinzi bw’ avoka by’ umwuga
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}><CiLogout /> Logout</button>
      </div>
      <div className="action-header">
        <h2>Farmers</h2>
        <div className="action-buttons">
          <button className="add-employee-btn">Add Farmer</button>
          <button className="export-btn" onClick={exportToExcel}>Export to Excel</button>
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="district-select">Filter by District: </label>
        <Select
          id="district-select"
          options={districtOptions}
          isClearable
          onChange={handleDistrictChange}
          placeholder="Select or search district"
        />
      </div>
      <div className="table-container">
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p>{error}</p>
        ) : filteredFarmers.length > 0 ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Telephone</th>
                <th>District</th>
                <th>Sector</th>
                <th>Cell</th>
                <th>Village</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map((farmer, index) => (
                <tr key={index}>
                  <td>{farmer.id || 'N/A'}</td>
                  <td>{farmer.firstname || 'N/A'}</td>
                  <td>{farmer.lastname || 'N/A'}</td>
                  <td>{farmer.telephone || 'N/A'}</td>
                  <td>{farmer.district || 'N/A'}</td>
                  <td>{farmer.sector || 'N/A'}</td>
                  <td>{farmer.cell || 'N/A'}</td>
                  <td>{farmer.village || 'N/A'}</td>
                  <td>
                    <button className="view-details-btn" onClick={() => openModal(farmer)}>View</button>
                    <button className="edit-btn"><FiEdit /></button>
                    <button className="delete-btn"><MdOutlineDeleteOutline /></button>
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
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h2>Farmer Details</h2>
            <p><strong>First Name:</strong> {selectedFarmer.firstname}</p>
            <p><strong>Last Name:</strong> {selectedFarmer.lastname}</p>
            <p><strong>Telephone:</strong> {selectedFarmer.telephone}</p>
            <p><strong>ID Number:</strong> {selectedFarmer.idnumber}</p>
            <p><strong>Village:</strong> {selectedFarmer.village}</p>
            <p><strong>Cell:</strong> {selectedFarmer.cell}</p>
            <p><strong>Sector:</strong> {selectedFarmer.sector}</p>
            <p><strong>District:</strong> {selectedFarmer.district}</p>
            <p><strong>Province:</strong> {selectedFarmer.province}</p>
            <p><strong>Planted Date:</strong> {selectedFarmer.planted}</p>
            <p><strong>Avocado Type:</strong> {selectedFarmer.avocadotype}</p>
            <p><strong>Mixed Percentage:</strong> {selectedFarmer.mixedpercentage}</p>
            <p><strong>Farm Size:</strong> {selectedFarmer.farmsize}</p>
            <p><strong>Tree Count:</strong> {selectedFarmer.treecount}</p>
            <p><strong>UPI Number:</strong> {selectedFarmer.upinumber}</p>
            <p><strong>Assistance Needed:</strong> {selectedFarmer.assistance}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;