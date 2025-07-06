import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle, Droplets, Settings, Zap, Shield, Eye, Heart, Filter } from 'lucide-react';

export default function ModernIrrigationKits() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [filterType, setFilterType] = useState('all');

  // Mock product data - replace with your actual data
  const products = [
    {
      _id: '1',
      name: 'Smart Drip Irrigation Kit',
      price: '15,000',
      originalPrice: '18,000',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 124,
      features: ['Water-efficient', 'Smart sensors', 'Easy installation'],
      description: 'Advanced drip irrigation system with IoT sensors for optimal water management.',
      category: 'drip',
      inStock: true,
      discount: 17
    },
    {
      _id: '2',
      name: 'Professional Sprinkler System',
      price: '10,000',
      originalPrice: '12,000',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 89,
      features: ['Wide coverage', 'Adjustable spray', 'Durable build'],
      description: 'Heavy-duty sprinkler system perfect for large agricultural areas.',
      category: 'sprinkler',
      inStock: true,
      discount: 17
    },
    {
      _id: '3',
      name: 'Micro Sprinkler Kit Pro',
      price: '12,500',
      originalPrice: '15,000',
      image: 'https://images.unsplash.com/photo-1595147389795-37094173bfd8?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 156,
      features: ['Precision watering', 'Low pressure', 'Eco-friendly'],
      description: 'Precision micro-sprinkler system for targeted irrigation of sensitive crops.',
      category: 'micro',
      inStock: true,
      discount: 17
    },
    {
      _id: '4',
      name: 'Premium Hose Irrigation Set',
      price: '8,000',
      originalPrice: '10,000',
      image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
      rating: 4.4,
      reviews: 78,
      features: ['Flexible design', 'Multi-pattern nozzle', 'Portable'],
      description: 'Versatile hose irrigation system with multiple spray patterns for various crops.',
      category: 'hose',
      inStock: false,
      discount: 20
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-80 object-cover rounded-2xl"
            />
            <div className="flex space-x-2">
              {[1,2,3,4].map(i => (
                <img 
                  key={i}
                  src={product.image} 
                  alt={`${product.name} view ${i}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-green-500 cursor-pointer transition-colors"
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
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">({product.reviews} reviews)</span>
              </div>
              {product.discount && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
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
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button 
                disabled={!product.inStock}
                className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${
                  product.inStock 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
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
                className={`p-3 rounded-2xl transition-all ${
                  likedProducts.has(product._id) 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-6 h-6 ${likedProducts.has(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Market</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 mb-4">
              Irrigation Kits
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our premium range of irrigation kits designed to optimize water usage and enhance crop growth.
              From smart drip irrigation systems to professional sprinklers, our products ensure efficient water delivery for your farm.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">50+</h3>
            <p className="text-gray-600">Water Efficient</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Easy</h3>
            <p className="text-gray-600">Installation</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Smart</h3>
            <p className="text-gray-600">Technology</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2 Year</h3>
            <p className="text-gray-600">Warranty</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Available Irrigation Kits</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                className="border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="drip">Drip Irrigation</option>
                <option value="sprinkler">Sprinkler Systems</option>
                <option value="micro">Micro Sprinklers</option>
                <option value="hose">Hose Systems</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {product.discount && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {product.discount}% OFF
                        </div>
                      )}
                      
                      <div className="absolute top-4 right-4 space-y-2">
                        <button
                          onClick={() => toggleLike(product._id)}
                          className={`p-2 rounded-full transition-all ${
                            likedProducts.has(product._id)
                              ? 'bg-red-100 text-red-600'
                              : 'bg-white/80 text-gray-600 hover:bg-white'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${likedProducts.has(product._id) ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-white/90 text-sm">({product.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">{product.price} RWF</span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">{product.originalPrice} RWF</span>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        disabled={!product.inStock}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                          product.inStock
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
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
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No irrigation kits found</h3>
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
    </div>
  );
}