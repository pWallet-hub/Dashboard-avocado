import { Link, useLocation } from "react-router-dom";

export default function DashboardHeader() {
  const location = useLocation();

  const navigationItems = [
    { 
      icon: "📊", 
      label: " Book Your IPM Day", 
      route: "/dashboard/farmer/PestManagement" 
    },
    { 
      icon: "🛠️", 
      label: "Book Your Harvesting Day", 
      route: "/dashboard/farmer/HarvestingDay" 
    },
    { 
      icon: "🏪", 
      label: " Farm Input Shop", 
      route: "/dashboard/farmer/Market" 
    },
    { 
      icon: "👤", 
      label: "Book Your Farm Property Valuation", 
      route: "/dashboard/farmer/PropertyEvaluation" 
    },
    { 
      icon: "📋", 
      label: "My Service Requests", 
      route: "/dashboard/farmer/my-service-requests" 
    },
  ];

  const isActive = (route) => {
    return location.pathname === route || location.pathname.startsWith(route);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center space-x-8 py-4">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive(item.route)
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              style={isActive(item.route) ? { backgroundColor: '#1F310A' } : {}}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}