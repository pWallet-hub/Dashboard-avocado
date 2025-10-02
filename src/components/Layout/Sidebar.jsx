import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import asr from '../../assets/image/pwallet-logo-new.png';
import './Sidebar.css';

const Sidebar = ({ role: propRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const location = useLocation();

  // Enhanced role detection
  useEffect(() => {
    const detectRole = () => {
      // Priority 1: Use prop role if provided
      if (propRole) {
        setCurrentRole(propRole);
        return;
      }

      // Priority 2: Detect from current path
      const path = location.pathname;
      if (path.includes('/admin')) {
        setCurrentRole('admin');
        return;
      }
      if (path.includes('/agent')) {
        setCurrentRole('agent');
        return;
      }
      if (path.includes('/farmer')) {
        setCurrentRole('farmer');
        return;
      }
      if (path.includes('/shop-manager') || path.includes('/shop_manager')) {
        setCurrentRole('shop-manager');
        return;
      }

      // Priority 3: Check localStorage
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        // Normalize role format (convert underscore to hyphen if needed)
        const normalizedRole = storedRole.replace('_', '-');
        setCurrentRole(normalizedRole);
        return;
      }

      // Priority 4: Check user data in localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const userRole = user.role?.replace('_', '-');
          setCurrentRole(userRole);
          return;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // Fallback
      setCurrentRole('farmer');
    };

    detectRole();
  }, [propRole, location.pathname]);

  // Get shop info from localStorage if available
  const getShopInfo = () => {
    const shopInfo = localStorage.getItem('shopInfo');
    return shopInfo ? JSON.parse(shopInfo) : { shopName: 'Shop Manager' };
  };

  const NavItem = ({ to, icon: Icon, children, isActive = false }) => (
    <li className="group">
      <Link 
        to={to}
        className={`nav-item ${isCollapsed ? 'justify-center' : ''} ${
          isActive ? 'nav-item-active' : ''
        }`}
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
    { to: "/dashboard/shop-manager", icon: Store, text: "Dashboard" },
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
    console.log('Current role in sidebar:', currentRole); // Debug log
    
    switch (currentRole) {
      case 'admin':
        return adminLinks;
      case 'agent':
        return agentLinks;
      case 'farmer':
        return farmerLinks;
      case 'shop-manager':
      case 'shop_manager': // Handle both formats
        return shopManagerLinks;
      default:
        console.log('No matching role found, defaulting to farmer links');
        return farmerLinks; // Default fallback
    }
  };

  const getSidebarTitle = () => {
    switch (currentRole) {
      case 'admin':
        return 'AS-Rwanda Admin';
      case 'agent':
        return 'AS-Rwanda Agent';
      case 'farmer':
        return 'AS-Rwanda Farmer';
      case 'shop-manager':
      case 'shop_manager':
        return 'AS-Rwanda Shop';
      default:
        return 'AS-Rwanda';
    }
  };

  // Show loading state while role is being determined
  if (!currentRole) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={asr} alt="Logo" className="topbar-logo" />
          <h2 className="sidebar-header-title">Loading...</h2>
        </div>
      </div>
    );
  }

  const currentLinks = getLinks();

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
        {currentRole === 'shop-manager' && !isCollapsed && (
          <div className="px-4 py-3 mx-4 mb-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {getShopInfo().shopName || 'Shop Manager'}
                </p>
                <p className="text-xs text-green-600">
                  Active Shop
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            <NavItem 
              to="/dashboard" 
              icon={Home}
              isActive={location.pathname === '/dashboard'}
            >
              Home
            </NavItem>
            {currentLinks.map((link) => (
              <NavItem 
                key={link.to} 
                to={link.to} 
                icon={link.icon}
                isActive={location.pathname === link.to}
              >
                {link.text}
              </NavItem>
            ))}
          </ul>
        </nav>

        {/* Role Badge at Bottom */}
        <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
              currentRole === 'admin' ? 'bg-red-100 text-red-800' :
              currentRole === 'agent' ? 'bg-blue-100 text-blue-800' :
              currentRole === 'farmer' ? 'bg-green-100 text-green-800' :
              currentRole === 'shop-manager' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentRole === 'shop-manager' ? 'Shop Manager' : 
               currentRole?.charAt(0).toUpperCase() + currentRole?.slice(1)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;