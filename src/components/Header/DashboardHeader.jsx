import { Link, useLocation } from "react-router-dom";
import { Store, Calendar, Bug, MapPin, ClipboardList } from 'lucide-react';

export default function DashboardHeader() {
  const location = useLocation();

  const navigationItems = [
    { 
      icon: Store, 
      label: "Farm Market", 
      route: "/dashboard/farmer/market" 
    },
    { 
      icon: Calendar, 
      label: "Book Harvesting Day", 
      route: "/dashboard/farmer/HarvestingDay" 
    },
    { 
      icon: Bug, 
      label: "Book your IPM Day", 
      route: "/dashboard/farmer/PestManagement" 
    },
    { 
      icon: MapPin, 
      label: "Book your PE Day", 
      route: "/dashboard/farmer/PropertyEvaluation" 
    },
    { 
      icon: ClipboardList, 
      label: "My Requests", 
      route: "/dashboard/farmer/my-service-requests" 
    },
  ];

  const isActive = (route) => {
    return location.pathname === route || location.pathname.startsWith(route);
  };

  return (
    <header className="bg-white border-b border-[#eaecf0] sticky top-0 z-40 font-['Poppins']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const active = isActive(item.route);

            return (
              <Link
                key={index}
                to={item.route}
                className={`
                  group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
                  transition-all duration-200 ease-in-out whitespace-nowrap cursor-pointer select-none
                  ${active
                    ? 'bg-[#ecfdf3] text-[#15803d] border border-[#d1fadf] shadow-2xs'
                    : 'text-[#475467] hover:text-[#101828] hover:bg-gray-50 border border-transparent'
                  }
                `}
              >
                <IconComponent 
                  className={`
                    w-4 h-4 transition-transform duration-200
                    ${active ? 'text-[#15803d] scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'}
                  `} 
                />
                <span className="tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}