import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users, 
  UserCheck, 
  FileText, 
  ShoppingCart, // Replaced Shopping with ShoppingCart
  BarChart2,
  Settings,
  ShoppingBag,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ to, icon: Icon, children }) => (
    <li className="group">
      <Link 
        to={to}
        className="flex items-center p-3 space-x-3 transition-all duration-200 rounded-lg hover:bg-gray-700"
      >
        <Icon className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-white" />
        <span className={`text-gray-300 group-hover:text-white ${isCollapsed ? 'lg:hidden' : ''}`}>
          {children}
        </span>
      </Link>
    </li>
  );

  const adminLinks = [
    { to: "/dashboard/admin", icon: User, text: "Profile" },
    { to: "/dashboard/admin/users", icon: Users, text: "Manage Users" },
    { to: "/dashboard/admin/agents", icon: UserCheck, text: "Manage Agents" },
    { to: "/dashboard/admin/reports", icon: FileText, text: "Manage Account" },
    { to: "/dashboard/admin/shops", icon: ShoppingCart, text: "Manage Shops" }, // Replaced Shopping with ShoppingCart
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
    { to: "/dashboard/farmer/market", icon: ShoppingCart, text: "Market" }, // Replaced Shopping with ShoppingCart
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
        className="fixed p-2 bg-gray-800 rounded-lg top-4 left-4 lg:hidden"
      >
        {isMobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-gray-800 border-r border-gray-700
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className={`text-xl font-bold text-white ${isCollapsed ? 'lg:hidden' : ''}`}>
            Dashboard
          </h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block"
          >
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
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