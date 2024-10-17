import React from 'react';
import { CiLogout } from "react-icons/ci";
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

const TopBar = ({ onLogout }) => {
  return (
    <div className="flex items-center justify-between p-4 text-white bg-teal-700 topbar">
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="w-12 h-12 mr-2" />
        <span className="text-xl font-bold">Avocado Society of Rwanda</span>
      </div>
      <button onClick={onLogout} className="flex items-center px-4 py-2 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600">
        <CiLogout className="mr-2 text-2xl" /> Logout
      </button>
    </div>
  );
};

export default TopBar;
