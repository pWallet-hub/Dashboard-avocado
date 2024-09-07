import React from 'react';
import './Dashboard.css'; 
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineDeleteOutline } from "react-icons/md";

const Dashboard = ({ userData }) => {
  // Ensure userData is an object, use an empty object as fallback
  const data = userData || {};

  const rows = [
    { label: 'Name', value: data.name || 'N/A' },
    { label: 'Age', value: data.age != null ? data.age : 'N/A' },
    { label: 'Village', value: data.village || 'N/A' },
    { label: 'Cell', value: data.cell || 'N/A' },
    { label: 'Sector', value: data.sector || 'N/A' },
    { label: 'District', value: data.district || 'N/A' },
    { label: 'Phone Number', value: data.phone || 'N/A' },
    { label: 'Area in Ha', value: data.area || 'N/A' },
  ];

  return (
    <div className="table-container">
         <div className="header-section">
        <img src={logo} alt="Logo" className="logo" />
        <div className="header-text">
          <h1 className="main-title">Avocado Society of Rwanda</h1>
          <p className="subtitle">
            Ibarura ry’abahinzi bafite ubutaka bakaba bifuza gutera no gukora
            Ubuhinzi bw’ avoka by’ umwuga
          </p>
        </div>
      </div>
    <table className="styled-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Amazina</th>
          <th>Imyaka</th>
          <th>Umudugudu</th>
          <th>Akagari</th>
          <th>Umurenge</th>
          <th>Akarere</th>
          <th>Telefone</th>
          <th>Ubuso (Ha)</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((num) => (
          <tr key={num}>
            <td>{num}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className='button-container'>
    <button>
        <IoAddCircleOutline />
        <span>Edit User</span>
    </button>
    <button className='delete'>
        <MdOutlineDeleteOutline />
        <span>Delete User</span>
    </button>
</div>

  </div>
);
};
export default Dashboard;