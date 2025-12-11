import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth.jsx';

export default function DashboardHeader() {
  const location = useLocation();
  const { user } = useAuth();

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'farmer':
        return [
          { 
            icon: "🏪", 
            label: "Market", 
            route: "/dashboard/farmer/market" 
          },
          { 
            icon: "🌾", 
            label: "Harvest Request", 
            route: "/dashboard/farmer/harvest-request" 
          },
          { 
            icon: "🐛", 
            label: "Pest Management", 
            route: "/dashboard/farmer/pest-management-request" 
          },
          { 
            icon: "🏡", 
            label: "Property Evaluation", 
            route: "/dashboard/farmer/property-evaluation" 
          },
          { 
            icon: "📋", 
            label: "My Requests", 
            route: "/dashboard/farmer/service-requests" 
          },
          { 
            icon: "👤", 
            label: "Profile", 
            route: "/dashboard/farmer/profile" 
          },
        ];
      
      case 'agent':
        return [
          { 
            icon: "👥", 
            label: "Farmers", 
            route: "/dashboard/agent/farmers" 
          },
          { 
            icon: "🌾", 
            label: "Harvest Plans", 
            route: "/dashboard/agent/harvest-plan" 
          },
          { 
            icon: "🐛", 
            label: "IPM Routine", 
            route: "/dashboard/agent/ipm-routine" 
          },
          { 
            icon: "📊", 
            label: "Reports", 
            route: "/dashboard/agent/reports" 
          },
          { 
            icon: "🏪", 
            label: "Shop", 
            route: "/dashboard/agent/shop" 
          },
          { 
            icon: "📱", 
            label: "QR Management", 
            route: "/dashboard/agent/qr-management" 
          },
        ];
      
      case 'admin':
        return [
          { 
            icon: "👥", 
            label: "Users", 
            route: "/dashboard/admin/users" 
          },
          { 
            icon: "🤝", 
            label: "Agents", 
            route: "/dashboard/admin/agents" 
          },
          { 
            icon: "🏪", 
            label: "Shops", 
            route: "/dashboard/admin/shops" 
          },
          { 
            icon: "📋", 
            label: "Service Requests", 
            route: "/dashboard/admin/service-requests" 
          },
          { 
            icon: "📊", 
            label: "Statistics", 
            route: "/dashboard/admin/statistics" 
          },
          { 
            icon: "🔧", 
            label: "Monitoring", 
            route: "/dashboard/admin/monitoring" 
          },
        ];
      
      case 'shop_manager':
        return [
          { 
            icon: "📦", 
            label: "Inventory", 
            route: "/dashboard/shop-manager/inventory" 
          },
          { 
            icon: "🛒", 
            label: "Orders", 
            route: "/dashboard/shop-manager/orders" 
          },
          { 
            icon: "📈", 
            label: "Sales", 
            route: "/dashboard/shop-manager/sales" 
          },
          { 
            icon: "👥", 
            label: "Customers", 
            route: "/dashboard/shop-manager/customers" 
          },
          { 
            icon: "📊", 
            label: "Analytics", 
            route: "/dashboard/shop-manager/analytics" 
          },
          { 
            icon: "⚙️", 
            label: "Profile", 
            route: "/dashboard/shop-manager/profile" 
          },
        ];
      
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (route) => {
    return location.pathname === route || location.pathname.startsWith(route);
  };

  return (
    <header className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <nav className="flex justify-center items-center gap-4 flex-wrap">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className={`
                group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                font-medium text-xs transition-all duration-300 ease-out
                ${isActive(item.route)
                  ? 'bg-gradient-to-r from-green-900 to-green-800 text-white shadow-md shadow-green-900/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm hover:scale-102 border border-gray-200'
                }
              `}
            >
              <span 
                className={`
                  text-sm transition-transform duration-300
                  ${isActive(item.route) ? 'scale-110' : 'group-hover:scale-110'}
                `}
              >
                {item.icon}
              </span>
              <span className="whitespace-nowrap font-semibold tracking-tight">
                {item.label}
              </span>
              {isActive(item.route) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}