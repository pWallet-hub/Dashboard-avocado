import { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye, 
  Heart, 
  Package, 
  Truck, 
  Shield, 
  Award,
  TrendingUp,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  Download,
  Share2,
  Settings
} from 'lucide-react';

export default function ProfessionalContainerPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState(new Set());

  // Mock data for containers/products
  const containers = [
    {
      id: 1,
      title: 'Premium Storage Solutions',
      category: 'storage',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      description: 'Industrial-grade storage containers with advanced security features and climate control systems.',
      metrics: { capacity: '500 units', efficiency: '99.8%', rating: 4.9 },
      price: 'From $2,999',
      status: 'available',
      features: ['Climate Control', 'Security Lock', 'Modular Design', 'Smart Monitoring']
    },
    {
      id: 2,
      title: 'Logistics Hub Container',
      category: 'logistics',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
      description: 'Streamlined logistics management with real-time tracking and automated inventory systems.',
      metrics: { capacity: '1000 units', efficiency: '98.5%', rating: 4.8 },
      price: 'From $4,599',
      status: 'available',
      features: ['Real-time Tracking', 'Automated Sorting', 'API Integration', 'Multi-platform Support']
    },
    {
      id: 3,
      title: 'Data Processing Center',
      category: 'technology',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      description: 'High-performance computing containers with advanced cooling and redundant power systems.',
      metrics: { capacity: '50 TB', efficiency: '99.9%', rating: 4.9 },
      price: 'From $8,999',
      status: 'premium',
      features: ['High Performance', 'Redundant Systems', 'Advanced Cooling', '24/7 Monitoring']
    },
    {
      id: 4,
      title: 'Manufacturing Unit',
      category: 'manufacturing',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      description: 'Portable manufacturing solutions with precision machinery and quality control systems.',
      metrics: { capacity: '200 units/day', efficiency: '97.2%', rating: 4.7 },
      price: 'From $12,499',
      status: 'available',
      features: ['Precision Machinery', 'Quality Control', 'Flexible Setup', 'Remote Operation']
    },
    {
      id: 5,
      title: 'Research Laboratory',
      category: 'research',
      image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=300&fit=crop',
      description: 'State-of-the-art research facilities with specialized equipment and safety protocols.',
      metrics: { capacity: '50 projects', efficiency: '99.1%', rating: 4.8 },
      price: 'From $15,999',
      status: 'premium',
      features: ['Specialized Equipment', 'Safety Protocols', 'Clean Environment', 'Data Security']
    },
    {
      id: 6,
      title: 'Mobile Office Suite',
      category: 'office',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
      description: 'Professional office containers with modern amenities and collaborative workspaces.',
      metrics: { capacity: '25 workstations', efficiency: '96.8%', rating: 4.6 },
      price: 'From $6,999',
      status: 'available',
      features: ['Modern Amenities', 'Collaborative Space', 'High-speed Internet', 'Ergonomic Design']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Grid },
    { id: 'storage', name: 'Storage', icon: Package },
    { id: 'logistics', name: 'Logistics', icon: Truck },
    { id: 'technology', name: 'Technology', icon: Globe },
    { id: 'manufacturing', name: 'Manufacturing', icon: Settings },
    { id: 'research', name: 'Research', icon: Award },
    { id: 'office', name: 'Office', icon: Users }
  ];

  const filteredContainers = containers.filter(container => {
    const matchesCategory = selectedCategory === 'all' || container.category === selectedCategory;
    const matchesSearch = container.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         container.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (id) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedItems(newLiked);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'premium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'available': return 'bg-gradient-to-r from-green-500 to-yellow-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-green-800 to-yellow-600 mb-6" style={{backgroundImage: 'linear-gradient(to right, #ea580c, #1F310A, #d97706)'}}>
            Professional Containers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive collection of professional-grade container solutions designed for 
            maximum efficiency, scalability, and performance across various industries.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slideInUp">
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
            <p className="text-gray-600">Active Containers</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slideInUp" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" style={{color: '#1F310A'}} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">99.9%</h3>
            <p className="text-gray-600">Uptime Guarantee</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slideInUp" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
            <p className="text-gray-600">Satisfied Clients</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 animate-slideInUp" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
            <p className="text-gray-600">Support Available</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900">Filter & Search</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={selectedCategory === category.id ? {backgroundColor: '#fef3c7', color: '#1F310A'} : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search containers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  style={{'--tw-ring-color': '#1F310A'}}
                />
              </div>
              
              <div className="flex items-center space-x-2 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={viewMode === 'grid' ? {backgroundColor: '#fef3c7', color: '#1F310A'} : {}}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={viewMode === 'list' ? {backgroundColor: '#fef3c7', color: '#1F310A'} : {}}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Containers Grid/List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="p-8">
            {filteredContainers.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8' : 'space-y-6'}>
                {filteredContainers.map((container, index) => (
                  <div
                    key={container.id}
                    className={`group bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2 animate-slideInUp ${
                      viewMode === 'list' ? 'flex items-center space-x-6' : ''
                    }`}
                    style={{animationDelay: `${index * 0.1}s`, '--hover-border-color': '#1F310A'}}
                  >
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : ''}`}>
                      <img
                        src={container.image}
                        alt={container.title}
                        className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-64'
                        }`}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className={`absolute ${viewMode === 'list' ? 'top-2 left-2' : 'top-4 left-4'} ${getStatusColor(container.status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {container.status === 'premium' ? 'Premium' : 'Available'}
                      </div>
                      
                      <div className={`absolute ${viewMode === 'list' ? 'top-2 right-2' : 'top-4 right-4'} space-y-2`}>
                        <button
                          onClick={() => toggleLike(container.id)}
                          className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                            likedItems.has(container.id)
                              ? 'bg-red-100 text-red-600 scale-110'
                              : 'bg-white/80 text-gray-600 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedItems.has(container.id) ? 'fill-current animate-pulse' : ''}`} />
                        </button>
                        
                        <button className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-all duration-300 transform hover:scale-110">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors" style={{'--hover-color': '#1F310A'}}>
                          {container.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">{container.metrics.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{container.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-orange-600">{container.metrics.capacity}</p>
                          <p className="text-xs text-gray-500">Capacity</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold" style={{color: '#1F310A'}}>{container.metrics.efficiency}</p>
                          <p className="text-xs text-gray-500">Efficiency</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-yellow-600">{container.price}</p>
                          <p className="text-xs text-gray-500">Pricing</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {container.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center space-x-2 opacity-0 animate-slideInLeft" style={{animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards'}}>
                            <CheckCircle className="w-4 h-4" style={{color: '#1F310A'}} />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        className="w-full text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
                        style={{
                          background: 'linear-gradient(to right, #ea580c, #1F310A)',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #dc2626, #1F310A)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #ea580c, #1F310A)';
                        }}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span>Explore Details</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-fadeIn">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No containers found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}