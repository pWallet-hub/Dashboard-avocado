// import './Service.css';
import Advertisement from "../../components/advertisement/advertisement";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header Section */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We offer specialized services to support avocado farmers in Rwanda
              with expert solutions for successful farming.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="mt-6">
                <Link to={service.route}>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    {service.buttonText}
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <Advertisement /> */}
    </div>
  );
}