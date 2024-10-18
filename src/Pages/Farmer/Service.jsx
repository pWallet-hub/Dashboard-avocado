import React from 'react';

export default function Service() {
  const services = [
    {
      id: 1,
      title: 'Consultation',
      description: 'Get expert advice on avocado farming techniques and best practices.',
      icon: '🌱',
    },
    {
      id: 2,
      title: 'Training Programs',
      description: 'Join our training programs to learn about modern avocado farming methods.',
      icon: '📚',
    },
    {
      id: 3,
      title: 'Supply Chain Management',
      description: 'Efficiently manage your supply chain with our comprehensive solutions.',
      icon: '🚚',
    },
    {
      id: 4,
      title: 'Market Access',
      description: 'Gain access to local and international markets for your avocado produce.',
      icon: '🌍',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            Our Services
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            We offer a range of services to support avocado farmers in Rwanda.
          </p>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-2xl bg-green-100 rounded-full">
                {service.icon}
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800">{service.title}</h2>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}