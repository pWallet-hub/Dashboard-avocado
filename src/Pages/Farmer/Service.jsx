import { Link } from "react-router-dom";
// import Advertisement from "../../components/advertisement/advertisement";
import DashboardHeader from "../../components/Header/DashboardHeader";

export default function Service() {
  const services = [
    {
      id: 1,
      title: "Pest Management",
      description:
        "Comprehensive pest control solutions to protect your avocado crops from diseases and harmful insects.",
      icon: "🐛",
      route: "/dashboard/farmer/PestManagement",
      buttonText: "Start Assessment"
    },
    {
      id: 2,
      title: "Harvesting Day",
      description:
        "Expert guidance on optimal harvesting timing and techniques to maximize your avocado yield and quality.",
      icon: "🥑",
      route: "/dashboard/farmer/HarvestingDay",
      buttonText: "Plan Harvest"
    },
    {
      id: 3,
      title: "Property Evaluation",
      description:
        "Professional assessment of your farmland to determine its suitability and potential for avocado cultivation.",
      icon: "🏞️",
      route: "/dashboard/farmer/PropertyEvaluation",
      buttonText: "Evaluate Property"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 font-poppins">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Page Content */}
      <div className="relative bg-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in-down">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Our Services
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We offer specialized services to support avocado farmers in Rwanda with expert solutions for successful farming.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 p-8 border border-gray-100 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-emerald-100 rounded-full text-3xl group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>
              <Link to={service.route}>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform group-hover:scale-105">
                  {service.buttonText}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* <Advertisement /> */}

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}