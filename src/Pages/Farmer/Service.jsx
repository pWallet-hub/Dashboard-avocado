import './Service.css';
import Advertisement from '../../components/advertisement/advertisement';

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
    <div className="service-page">
      <div className="service-wrapper">
        {/* Header Section */}
        <div className="service-header">
          <h1 className="service-title">Our Services</h1>
          <p className="service-description">
            We offer a range of services to support avocado farmers in Rwanda.
          </p>
        </div>

        {/* Services Section */}
        <div className="service-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h2 className="service-card-title">{service.title}</h2>
              <p className="service-card-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
      <Advertisement/>
      
    </div>
  );
}
