import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle, Shield, Settings, Zap, Eye, Heart, Filter, Package, Timer, AlertTriangle, HardHat, Layers, Wrench } from 'lucide-react';

export default function SafetyProtectionEquipment() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');

  // Mock product data for safety equipment
  const products = [
    {
      _id: '1',
      name: 'Professional Safety Helmet Pro',
      price: '15,000',
      originalPrice: '18,000',
      image: 'https://images.unsplash.com/photo-1581092335297-0a5d3b6b8e5c?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 234,
      features: ['Impact resistant', 'UV protection', 'Adjustable fit', 'Ventilation system'],
      description: 'Premium safety helmet with advanced impact protection and comfort features for all-day wear.',
      category: 'head',
      inStock: true,
      discount: 17,
      capacity: 'CE certified'
    },
    {
      _id: '2',
      name: 'Heavy-Duty Work Gloves Set',
      price: '8,500',
      originalPrice: '10,000',
      image: 'https://images.unsplash.com/photo-1583484963886-cfe2bff2945f?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 189,
      features: ['Cut resistant', 'Grip coating', 'Waterproof', 'Breathable fabric'],
      description: 'Multi-purpose work gloves with superior grip and protection for various agricultural tasks.',
      category: 'hands',
      inStock: true,
      discount: 15,
      capacity: 'Level 5 protection'
    },
    {
      _id: '3',
      name: 'Safety Goggles & Eyewear Kit',
      price: '12,000',
      originalPrice: '15,000',
      image: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 156,
      features: ['Anti-fog coating', 'UV protection', 'Adjustable strap', 'Scratch resistant'],
      description: 'Complete eye protection kit with multiple lens options for different working conditions.',
      category: 'eyes',
      inStock: true,
      discount: 20,
      capacity: 'UV400 protection'
    },
    {
      _id: '4',
      name: 'Respiratory Protection Mask',
      price: '22,000',
      originalPrice: '26,000',
      image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 142,
      features: ['N95 filtration', 'Comfortable fit', 'Reusable filters', 'Lightweight design'],
      description: 'Professional respiratory protection with high-efficiency filtration for dust and particles.',
      category: 'respiratory',
      inStock: false,
      discount: 15,
      capacity: 'N95 standard'
    },
    {
      _id: '5',
      name: 'High-Visibility Safety Vest',
      price: '6,500',
      originalPrice: '8,000',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 198,
      features: ['Reflective strips', 'Breathable mesh', 'Multiple pockets', 'Adjustable size'],
      description: 'High-visibility safety vest with reflective strips for enhanced visibility in low-light conditions.',
      category: 'clothing',
      inStock: true,
      discount: 19,
      capacity: 'Class 2 visibility'
    },
    {
      _id: '6',
      name: 'Steel Toe Safety Boots',
      price: '35,000',
      originalPrice: '42,000',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 167,
      features: ['Steel toe cap', 'Slip resistant', 'Waterproof', 'Puncture resistant'],
      description: 'Premium safety boots with steel toe protection and superior comfort for long working hours.',
      category: 'feet',
      inStock: true,
      discount: 17,
      capacity: 'ASTM certified'
    },
    {
      _id: '7',
      name: 'First Aid Emergency Kit',
      price: '18,000',
      originalPrice: '22,000',
      image: 'https://images.unsplash.com/photo-1603398938747-d3b2c1f3f5ff?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 203,
      features: ['Comprehensive supplies', 'Portable case', 'Emergency guide', 'Organized compartments'],
      description: 'Complete first aid kit with essential medical supplies for workplace emergencies.',
      category: 'medical',
      inStock: true,
      discount: 18,
      capacity: '50+ items'
    },
    {
      _id: '8',
      name: 'Emergency Warning System',
      price: '45,000',
      originalPrice: '55,000',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 89,
      features: ['LED warning lights', 'Loud siren', 'Battery backup', 'Weather resistant'],
      description: 'Advanced emergency warning system with multiple alert modes for workplace safety.',
      category: 'emergency',
      inStock: true,
      discount: 18,
      capacity: '120dB siren'
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
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-red-500 cursor-pointer transition-all duration-200 hover:scale-110"
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
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full animate-bounce">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-red-600">{product.price} RWF</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">{product.originalPrice} RWF</span>
                )}
              </div>
              <p className="text-gray-600">{product.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Standard: {product.capacity}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Safety Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
                    <CheckCircle className="w-5 h-5 text-red-600" />
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
                  background: 'linear-gradient(to right, #dc2626, #7f1d1d)',
                } : {}}
                onMouseEnter={(e) => {
                  if (product.inStock) {
                    e.target.style.background = 'linear-gradient(to right, #b91c1c, #7f1d1d)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.inStock) {
                    e.target.style.background = 'linear-gradient(to right, #dc2626, #7f1d1d)';
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
                    ? 'bg-red-100 text-red-600 scale-110' 
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 group mb-4">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Market</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-800 via-orange-600 to-yellow-600 mb-4 animate-fadeIn">
              Safety & Protection
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slideUp">
              Protect yourself and your team with our comprehensive range of safety equipment and protective gear.
              From personal protective equipment to emergency systems, we ensure your workplace safety is never compromised.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" style={{color: '#1F310A'}} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">200+</h3>
            <p className="text-gray-600">Safety Products</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <HardHat className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Certified</h3>
            <p className="text-gray-600">Standards</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
            <p className="text-gray-600">Protection</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slideInLeft" style={{animationDelay: '0.3s'}}>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Layers className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">5 Year</h3>
            <p className="text-gray-600">Warranty</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Safety Equipment Categories</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="head">Head Protection</option>
                <option value="hands">Hand Protection</option>
                <option value="eyes">Eye Protection</option>
                <option value="respiratory">Respiratory</option>
                <option value="clothing">Safety Clothing</option>
                <option value="feet">Foot Protection</option>
                <option value="medical">Medical & First Aid</option>
                <option value="emergency">Emergency Systems</option>
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
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2 animate-slideInUp"
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
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse" style={{background: 'linear-gradient(to right, #ea580c, #1F310A)'}}>
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
                            <Shield className="w-4 h-4" />
                            <span>{product.capacity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold" style={{color: '#1F310A'}}>{product.price} RWF</span>
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
                            <CheckCircle className="w-4 h-4 text-red-600" />
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
                          background: 'linear-gradient(to right, #dc2626, #7f1d1d)',
                        } : {}}
                        onMouseEnter={(e) => {
                          if (product.inStock) {
                            e.target.style.background = 'linear-gradient(to right, #b91c1c, #7f1d1d)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (product.inStock) {
                            e.target.style.background = 'linear-gradient(to right, #dc2626, #7f1d1d)';
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
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No safety equipment found</h3>
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