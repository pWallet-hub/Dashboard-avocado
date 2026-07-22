import React from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { Bug, CalendarCheck, MapPin, ArrowRight } from "lucide-react";
import "./Service.css"; // Ensure the path matches where you saved your CSS file

export default function Service() {
  const services = [
    {
      id: 1,
      title: "Pest Management",
      description:
        "Comprehensive pest control solutions to protect your avocado crops from diseases and harmful insects.",
      icon: Bug,
      route: "/dashboard/farmer/PestManagement",
      buttonText: "Start Assessment",
    },
    {
      id: 2,
      title: "Harvesting Day",
      description:
        "Expert guidance on optimal harvesting timing and techniques to maximize your avocado yield and quality.",
      icon: CalendarCheck,
      route: "/dashboard/farmer/HarvestingDay",
      buttonText: "Plan Harvest",
    },
    {
      id: 3,
      title: "Property Evaluation",
      description:
        "Professional assessment of your farmland to determine its suitability and potential for avocado cultivation.",
      icon: MapPin,
      route: "/dashboard/farmer/PropertyEvaluation",
      buttonText: "Evaluate Property",
    },
  ];

  return (
    <div className="service-page">
      {/* Header */}
      <DashboardHeader />

      <div className="service-wrapper">
        {/* Page Title & Subtitle */}
        <section className="service-header">
          <h1 className="service-title">
            Our <span className="service-title-gradient">Agronomic Services</span>
          </h1>
          <p className="service-description">
            We offer specialized services to support avocado farmers in Rwanda with expert solutions for successful farming.
          </p>
        </section>

        {/* Grid of Cards */}
        <main className="service-grid">
          {services.map((service) => {
            const IconComponent = service.icon;

            return (
              <div key={service.id} className="service-card">
                <div>
                  <div className="service-icon">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-description">
                    {service.description}
                  </p>
                </div>

                <Link to={service.route}>
                  <button className="service-card-button">
                    <span>{service.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}