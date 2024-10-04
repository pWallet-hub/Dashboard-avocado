import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  const role = localStorage.getItem('role'); // Get the role from localStorage

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role={role} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Top Bar */}
        <TopBar onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
