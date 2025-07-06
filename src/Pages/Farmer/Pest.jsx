import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle, Shield, Bug, Zap, Eye, Heart, Filter, Package, Timer, AlertTriangle, Leaf, Droplets, Home } from 'lucide-react';

export default function PestManagement() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');

  // Mock product data for pest management
  const products = [
    {
      _id: '1',
      name: 'Bio-Organic Insect Spray',
      price: '12,500',
      originalPrice: '15,000',
      image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 156,
      features: ['100% Organic', 'Non-toxic formula', 'Long-lasting protection', 'Safe for crops'],
      description: 'Eco-friendly organic insect spray that effectively controls pests while being safe for your crops and environment.',
      category: 'organic',
      inStock: true,
      discount: 17,
      capacity: '500ml bottle',
      effectiveness: '95% pest control'
    },
    {
      _id: '2',
      name: 'Professional Rodent Control Kit',
      price: '25,000',
      originalPrice: '30,000',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 203,
      features: ['Humane traps', 'Bait stations', 'Monitoring system', 'Reusable design'],
      description: 'Complete rodent control solution with professional-grade traps and monitoring system.',
      category: 'rodent',
      inStock: true,
      discount: 17,
      capacity: '12-piece kit',
      effectiveness: '98% capture rate'
    },
    {
      _id: '3',
      name: 'Aphid & Mite Control Spray',
      price: '8,500',
      originalPrice: '11,000',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 134,
      features: ['Targeted formula', 'Quick action', 'Leaf-safe', 'Residue-free'],
      description: 'Specialized spray for controlling aphids and mites without harming beneficial insects.',
      category: 'spray',
      inStock: true,
      discount: 23,
      capacity: '250ml concentrate',
      effectiveness: '92% elimination'
    },
    {
      _id: '4',
      name: 'Termite Protection System',
      price: '45,000',
      originalPrice: '55,000',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 89,
      features: ['Underground barriers', 'Monitoring stations', 'Long-term protection', 'Professional grade'],
      description: 'Complete termite protection system with underground barriers and monitoring technology.',
      category: 'termite',
      inStock: false,
      discount: 18,
      capacity: 'Full property kit',
      effectiveness: '99% prevention'
    },
    {
      _id: '5',
      name: 'Mosquito Larvicide Tablets',
      price: '6,500',
      originalPrice: '8,500',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 178,
      features: ['Water-soluble', 'Prevents breeding', 'Safe for fish', '30-day protection'],
      description: 'Effective larvicide tablets that prevent mosquito breeding in water sources.',
      category: 'mosquito',
      inStock: true,
      discount: 24,
      capacity: '20 tablets',
      effectiveness: '96% larvae control'
    },
    {
      _id: '6',
      name: 'Ant Colony Elimination Kit',
      price: '18,000',
      originalPrice: '22,000',
      image: 'https://images.unsplash.com/photo-1585951736442-0b5ee8c6f9a6?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 145,
      features: ['Gel baits', 'Bait stations', 'Colony targeting', 'Weather resistant'],
      description: 'Complete ant elimination system that targets entire colonies at their source.',
      category: 'ant',
      inStock: true,
      discount: 18,
      capacity: '8-station kit',
      effectiveness: '94% colony elimination'
    },
    {
      _id: '7',
      name: 'Fungal Disease Control Solution',
      price: '15,000',
      originalPrice: '19,000',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 112,
      features: ['Broad spectrum', 'Preventive action', 'Crop safe', 'Systemic protection'],
      description: 'Advanced fungal control solution that prevents and treats plant diseases effectively.',
      category: 'fungal',
      inStock: true,
      discount: 21,
      capacity: '1L concentrate',
      effectiveness: '91% disease prevention'
    },
    {
      _id: '8',
      name: 'Smart Pest Monitoring System',
      price: '85,000',
      originalPrice: '100,000',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 67,
      features: ['IoT sensors', 'Mobile alerts', 'Real-time monitoring', 'Data analytics'],
      description: 'Advanced IoT-based pest monitoring system with real-time alerts and analytics.',
      category: 'technology',
      inStock: true,
      discount: 15,
      capacity: '5-sensor system',
      effectiveness: '99% detection accuracy'
    }
  ];

  const filteredProducts = filterType === 'all' 
    ? products 
    : products.filter(product => product.category === filterType);

  const toggleLike = (productId) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(productId)) {
      newLiked.delete(productId);
    } else {
      newLiked.add(productId);
    }
    setLikedProducts(newLiked);
  };

  const ProductModal = ({ product, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative group">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex space-x-2">
              {[1,2,3,4].map(i => (
                <img 
                  key={i}
                  src={product.image} 
                  alt={`${product.name} view ${i}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-green-500 cursor-pointer transition-all duration-200 hover:scale-110"
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 transition-all duration-200 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400 animate-pulse' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
              </div>
              {product.discount && (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full animate-bounce">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-green-600">{product.price} RWF</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">{product.originalPrice} RWF</span>
                )}
              </div>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>Size: {product.capacity}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{product.effectiveness}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button 
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
                  product.inStock 
                    ? 'text-white transform hover:scale-105 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                style={product.inStock ? {
                  background: 'linear-gradient(to right, #16a34a, #15803d)',
                } : {}}
                onMouseEnter={(e) => {
                  if (product.inStock) {
                    e.target.style.background = 'linear-gradient(to right, #15803d, #166534)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.inStock) {
                    e.target.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
                  }
                }}
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    Buy Now
                  </>
                ) : (
                  'Out of Stock'
                )}
              </button>
              <button 
                onClick={() => toggleLike(product._id)}
                className={`p-3 rounded-2xl transition-all duration-300 ${
                  likedProducts.has(product._id) 
                    ? 'bg-green-100 text-green-600 scale-110' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <Heart className={`w-6 h-6 ${likedProducts.has(product._id) ? 'fill-current animate-pulse' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 group mb-4">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Market</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-emerald-600 mb-4 animate-fadeIn">
              Pest Management Solutions
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slideUp">
              Protect your crops and property with our comprehensive pest management solutions.
              From organic sprays to smart monitoring systems, we provide effective and eco-friendly pest control.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Bug className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">150+</h3>
            <p className="text-gray-600">Pest Solutions</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Eco-Safe</h3>
            <p className="text-gray-600">Organic Options</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">95%</h3>
            <p className="text-gray-600">Effectiveness</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
            <p className="text-gray-600">Protection</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Pest Control Categories</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="organic">Organic Solutions</option>
                <option value="rodent">Rodent Control</option>
                <option value="spray">Insect Sprays</option>
                <option value="termite">Termite Control</option>
                <option value="mosquito">Mosquito Control</option>
                <option value="ant">Ant Control</option>
                <option value="fungal">Fungal Control</option>
                <option value="technology">Smart Systems</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="p-8">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-green-200 transform hover:-translate-y-2 animate-slideInUp"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {product.discount && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                          {product.discount}% OFF
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 space-y-2">
                        <button
                          onClick={() => toggleLike(product._id)}
                          className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                            likedProducts.has(product._id)
                              ? 'bg-green-100 text-green-600 scale-110'
                              : 'bg-white/80 text-gray-600 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedProducts.has(product._id) ? 'fill-current animate-pulse' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-all duration-300 transform hover:scale-110"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-white/90 text-sm ml-1">({product.reviews})</span>
                          </div>
                          <div className="flex items-center space-x-1 text-white/80 text-sm">
                            <Zap className="w-4 h-4" />
                            <span>{product.effectiveness}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">{product.price} RWF</span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">{product.originalPrice} RWF</span>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800 animate-pulse' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center space-x-2 opacity-0 animate-slideInLeft" style={{animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards'}}>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        disabled={!product.inStock}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                          product.inStock
                            ? 'text-white hover:scale-105 shadow-lg hover:shadow-xl transform'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        style={product.inStock ? {
                          background: 'linear-gradient(to right, #16a34a, #15803d)',
                        } : {}}
                        onMouseEnter={(e) => {
                          if (product.inStock) {
                            e.target.style.background = 'linear-gradient(to right, #15803d, #166534)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (product.inStock) {
                            e.target.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
                          }
                        }}
                      >
                        {product.inStock ? (
                          <>
                            <ShoppingCart className="w-5 h-5 inline mr-2" />
                            Buy Now
                          </>
                        ) : (
                          'Out of Stock'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 animate-fadeIn">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bug className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No pest control products found</h3>
                <p className="text-gray-600">Try adjusting your filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}