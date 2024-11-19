import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users, 
  UserCheck, 
  FileText, 
  ShoppingCart,
  BarChart2,
  Settings,
  ShoppingBag,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import asr from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ to, icon: Icon, children }) => (
    <li className="group">
      <Link 
        to={to}
        className={`nav-item ${isCollapsed ? 'justify-center' : ''}`}
      >
        <Icon className="nav-item-icon" />
        <span className={`nav-item-text ${isCollapsed ? 'hidden hidden-on-collapse' : ''}`}>
          {children}
        </span>
      </Link>
    </li>
  );

  const adminLinks = [
    { to: "/dashboard/admin", icon: User, text: "Profile" },
    { to: "/dashboard/admin/users", icon: Users, text: "Manage Growers" },
    { to: "/dashboard/admin/agents", icon: UserCheck, text: "Manage Agents" },
    { to: "/dashboard/admin/reports", icon: FileText, text: "Manage Account" },
    { to: "/dashboard/admin/shops", icon: ShoppingCart, text: "Manage Shops" }, 
    { to: "/dashboard/admin/statistics", icon: BarChart2, text: "System Usage" },
  ];

  const agentLinks = [
    { to: "/dashboard/agent", icon: User, text: "Profile" },
    { to: "/dashboard/agent/FarmerList", icon: Users, text: "Farmer" },
    { to: "/dashboard/agent/PendingService", icon: Settings, text: "Service" },
    { to: "/dashboard/agent/Shop", icon: ShoppingBag, text: "My Shop" },
    { to: "/dashboard/agent/Report", icon: FileText, text: "Reports" },
  ];

  const farmerLinks = [
    { to: "/dashboard/farmer/market", icon: ShoppingCart, text: "Market" },
    { to: "/dashboard/farmer/service", icon: Settings, text: "Service" },
    { to: "/dashboard/farmer/profile", icon: User, text: "Profile" },
  ];

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return adminLinks;
      case 'agent':
        return agentLinks;
      case 'farmer':
        return farmerLinks;
      default:
        return [];
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="mobile-menu-button"
      >
        {isMobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar 
          ${isMobileOpen ? 'sidebar-mobile-open' : 'sidebar-mobile-closed'} 
          ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Header */}
        <div className="sidebar-header">
        <img
                src={asr}
                alt="Logo"
                className="topbar-logo"
              />
          <h2 className={`sidebar-header-title ${isCollapsed ? 'hidden hidden-on-collapse' : ''}`}>
              AS-Rwanda
          </h2>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block"
          >
            <ChevronRight 
              className={`w-5 h-5 text-gray-400 collapse-button 
                ${isCollapsed ? 'collapse-button-rotated' : ''}`} 
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            <NavItem to="/dashboard" icon={Home}>Home</NavItem>
            {getLinks().map((link) => (
              <NavItem key={link.to} to={link.to} icon={link.icon}>
                {link.text}
              </NavItem>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;