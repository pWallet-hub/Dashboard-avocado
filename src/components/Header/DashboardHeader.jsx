import { Link, useLocation } from "react-router-dom";

export default function DashboardHeader() {
  const location = useLocation();

  const navigationItems = [
    { 
      icon: "📊", 
      label: "Book your IPM Day", 
      route: "/dashboard/farmer/PestManagement" 
    },
    { 
      icon: "🛠️", 
      label: "Book your Harvesting Day", 
      route: "/dashboard/farmer/HarvestingDay" 
    },
    { 
      icon: "🏪", 
      label: "Book your Farm Shop", 
      route: "/dashboard/farmer/Market" 
    },
    { 
      icon: "👤", 
      label: "Book your Property Valuation", 
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
    <header className="bg-white shadow-sm border-b border-gray-200" style={{ padding: '8px 0' }}>
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex justify-center items-center gap-3">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.route}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 ${
                isActive(item.route)
                  ? 'shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={isActive(item.route) ? { 
                backgroundColor: '#1F310A',
                color: 'white'
              } : {}}
            >
              <span style={{ fontSize: '0.875rem' }}>{item.icon}</span>
              <span className="font-medium" style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}