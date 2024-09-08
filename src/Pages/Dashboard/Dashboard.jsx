import React from 'react';
import './Dashboard.css'; 
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";

const Dashboard = ({ userData }) => {
  // Ensure userData is an object, use an empty object as fallback
  const data = userData || [];

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
      </div>

      <div className="action-header">
        <h2>Farmers</h2>
        <button className="add-employee-btn">
          Add Farmer
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Amazina</th>
            <th>Imyaka</th>
            <th>Umudugudu</th>
            <th>Akagari</th>
            <th>Umurenge</th>
            <th>Akarere</th>
            <th>Telefone</th>
            <th>Ubuso (Ha)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((farmer, index) => (
              <tr key={index}>
                <td><input type="checkbox" /></td>
                <td>{farmer.amazina || 'N/A'}</td>
                <td>{farmer.imyaka || 'N/A'}</td>
                <td>{farmer.umudugudu || 'N/A'}</td>
                <td>{farmer.akagari || 'N/A'}</td>
                <td>{farmer.umurenge || 'N/A'}</td>
                <td>{farmer.akarere || 'N/A'}</td>
                <td>{farmer.telefone || 'N/A'}</td>
                <td>{farmer.ubuso || 'N/A'}</td>
                <td>
                  <button className="edit-btn"><FiEdit /></button>
                  <button className="delete-btn"><MdOutlineDeleteOutline /></button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No Farmers Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
