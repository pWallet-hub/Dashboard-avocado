import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Calendar, Bug, MapPin, ClipboardList } from 'lucide-react';

export default function DashboardHeader() {
  const location = useLocation();

  const navigationItems = [
    { 
      icon: "🏪", 
      label: "Farm Input Shop", 
      route: "/dashboard/farmer/market" 
    },
    { 
      icon: "🛠️", 
      label: "Book Harvesting Day", 
      route: "/dashboard/farmer/HarvestingDay" 
    },
    { 
      icon: "📊", 
      label: "Book your IPM Day", 
      route: "/dashboard/farmer/PestManagement" 
    },
    { 
      icon: "👤", 
      label: "Book your PE Day", 
      route: "/dashboard/farmer/PropertyEvaluation" 
    },
    { 
      icon: "📋", 
      label: "My Requests", 
      route: "/dashboard/farmer/my-service-requests" 
    },
  ];

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