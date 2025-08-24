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
  ChevronRight,
  ClipboardList,
  Package,
  TrendingUp,
  Truck,
  Store
} from 'lucide-react';
import asr from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get shop info from localStorage if available
  const getShopInfo = () => {
    const shopInfo = localStorage.getItem('shopInfo');
    return shopInfo ? JSON.parse(shopInfo) : { shopName: 'Shop Manager' };
  };

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
    { to: "/dashboard/admin/service-requests", icon: ClipboardList, text: "Service Requests" },
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
    { to: "/dashboard/farmer/my-service-requests", icon: ClipboardList, text: "My Requests" },
    { to: "/dashboard/farmer/profile", icon: User, text: "Profile" },
  ];

  const shopManagerLinks = [
    { to: "/dashboard/shop-manager", icon: Store, text: "Shop Manager" },
    { to: "/dashboard/shop-manager/inventory", icon: Package, text: "Inventory" },
    { to: "/dashboard/shop-manager/orders", icon: ShoppingCart, text: "Orders" },
    { to: "/dashboard/shop-manager/products", icon: ShoppingBag, text: "Products" },
    { to: "/dashboard/shop-manager/customers", icon: Users, text: "Customers" },
    { to: "/dashboard/shop-manager/suppliers", icon: Truck, text: "Suppliers" },
    { to: "/dashboard/shop-manager/sales", icon: TrendingUp, text: "Sales" },
    { to: "/dashboard/shop-manager/analytics", icon: BarChart2, text: "Analytics" },
    { to: "/dashboard/shop-manager/profile", icon: User, text: "Shop Profile" },
  ];

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return adminLinks;
      case 'agent':
        return agentLinks;
      case 'farmer':
        return farmerLinks;
      case 'shop-manager':
        return shopManagerLinks;
      default:
        return [];
    }
  };

  const getSidebarTitle = () => {
    switch (role) {
      case 'admin':
        return 'AS-Rwanda';
      case 'agent':
        return 'AS-Rwanda';
      case 'farmer':
        return 'AS-Rwanda';
      case 'shop-manager':
        return 'AS-Rwanda';
      default:
        return 'AS-Rwanda';
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
            {getSidebarTitle()}
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

        {/* Shop Manager Info Panel (only for shop-manager role) */}
        {/* {role === 'shop-manager' && !isCollapsed && (
          <div className="px-4 py-3 mx-4 mb-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {getShopInfo().shopName || 'Shop Manager'}
                </p>
                <p className="text-xs text-green-600">
                  ID: {getShopInfo().shopId || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )} */}

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

        {/* Role Badge at Bottom */}
        {/* <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
              role === 'admin' ? 'bg-red-100 text-red-800' :
              role === 'agent' ? 'bg-blue-100 text-blue-800' :
              role === 'farmer' ? 'bg-green-100 text-green-800' :
              role === 'shop-manager' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {role === 'shop-manager' ? 'Shop Manager' : role?.charAt(0).toUpperCase() + role?.slice(1)}
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;