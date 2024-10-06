import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ role }) => {
  return (
    <div className="w-64 h-full text-white bg-gray-800 sidebar">
      <div className="p-4 text-xl font-bold sidebar-header">
        Dashboard
      </div>
      <ul className="p-4 sidebar-menu">
        <li className="mb-2 sidebar-item">
          <Link to="/dashboard" className="sidebar-link">Home</Link>
        </li>
        {role === 'admin' && (
          <>
            <li className="mb-2 sidebar-item">
                <Link to="/dashboard/admin" className="sidebar-link">Profile</Link>
            </li>
             <li className="mb-2 sidebar-item">
                <Link to="/dashboard/admin/users" className="sidebar-link">Manage Users</Link>
            </li>
             <li className="mb-2 sidebar-item">
                <Link to="/dashboard/admin/agents" className="sidebar-link">Manage Agents</Link>
            </li>
             <li className="mb-2 sidebar-item">
                <Link to="/dashboard/admin/reports" className="sidebar-link">Manage Account</Link>
            </li>
             <li className="mb-2 sidebar-item">
                <Link to="/dashboard/admin/shops" className="sidebar-link">Manage shops</Link>
            </li>
            <li className="mb-2 sidebar-item">
                <Link to="/dashboard/admin/statistics" className="sidebar-link">System usage</Link>
            </li>
           
          </>
        )}
        {role === 'agent' && (
          <>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/agent" className="sidebar-link">Profile</Link>
            </li>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/agent/FarmerList" className="sidebar-link">Farmer</Link>
            </li>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/agent/PendingService" className="sidebar-link">Service</Link>
            </li>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/agent/Shop" className="sidebar-link">My shop</Link>
            </li>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/agent/Report" className="sidebar-link">Reports</Link>
            </li>
          </>
        )}
        {role === 'farmer' && (
          <>
            {/* <li className="mb-2 sidebar-item">
              <Link to="/farmer" className="sidebar-link">News</Link>
            </li> */}
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/farmer/market" className="sidebar-link">Market</Link>
            </li>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/farmer/service" className="sidebar-link">service</Link>
            </li>
            <li className="mb-2 sidebar-item">
              <Link to="/dashboard/farmer/profile" className="sidebar-link">Profile</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;