import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './Market.css';
import Advertisement from '../../components/advertisement/advertisement';
import DashboardHeader from "../../components/Header/DashboardHeader";
import SlideShow from "../../components/Slide/Slide";
import image1 from '../../assets/image/slide1.jpg'
import image2 from '../../assets/image/slide2.jpg'
import image3 from '../../assets/image/slide3.jpg'
import { Link } from 'react-router-dom';
import product from '../../assets/image/product.jpg';
import { Plus, Edit, Eye, ShoppingCart } from 'lucide-react';

// Local storage helper functions
const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem('farmerProducts')) {
    const demoProducts = [
      {
        id: 'p1',
        farmerId: 'f1',
        name: 'Hass Avocados',
        category: 'Fruits',
        quantity: 50,
        unit: 'kg',
        pricePerUnit: 2.5,
        quality: 'Premium',
        harvestDate: '2024-09-01',
        status: 'available',
        description: 'Fresh organic Hass avocados'
      },
      {
        id: 'p2',
        farmerId: 'f1',
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        quantity: 30,
        unit: 'kg',
        pricePerUnit: 1.8,
        quality: 'Good',
        harvestDate: '2024-08-28',
        status: 'available',
        description: 'Fresh organic tomatoes'
      }
    ];
    localStorage.setItem('farmerProducts', JSON.stringify(demoProducts));
  }
};

const getFarmerProducts = (farmerId) => {
  const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
  return farmerId ? products.filter(p => p.farmerId === farmerId) : products;
};

const addFarmerProduct = (productData) => {
  const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
  const newProduct = {
    ...productData,
    id: 'p' + Date.now(),
    status: 'available',
    harvestDate: new Date().toISOString().split('T')[0]
  };
  products.push(newProduct);
  localStorage.setItem('farmerProducts', JSON.stringify(products));
  return newProduct;
};

export default function Market() {
  const [products, setProducts] = useState([]);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    quality: 'Good',
    description: ''
  });

  // Get current farmer info from localStorage or use default
  const getCurrentFarmer = () => {
    const token = localStorage.getItem('token');
    // In a real app, you'd decode the token to get farmer info
    // For demo, we'll use a default farmer
    return {
      id: 'f1',
      name: 'Jean Uwimana',
      location: 'Gasabo, Remera'
    };
  };

  useEffect(() => {
    initializeStorage();
    loadFarmerProducts();
    fetchExternalProducts();
  }, []);

  const loadFarmerProducts = () => {
    const farmer = getCurrentFarmer();
    const products = getFarmerProducts(farmer.id);
    setFarmerProducts(products);
  };

  const fetchExternalProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://applicanion-api.onrender.com/api/products');
      setProducts(response.data);
    } catch (error) {
      // Fallback to local products if API fails
      setProducts([]);
      console.log('API unavailable, using local products only');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const farmer = getCurrentFarmer();
    
    try {
      const productData = {
        ...newProduct,
        quantity: parseInt(newProduct.quantity),
        pricePerUnit: parseFloat(newProduct.pricePerUnit),
        farmerId: farmer.id,
        farmerName: farmer.name,
        location: farmer.location,
        harvestDate: new Date().toISOString().split('T')[0]
      };

      addFarmerProduct(productData);
      loadFarmerProducts();
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        category: 'Vegetables',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        quality: 'Good',
        description: ''
      });
      alert('Product added successfully!');
    } catch (error) {
      alert('Error adding product: ' + error.message);
    }
  };

  const handleBuyProduct = async (productId) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`https://applicanion-api.onrender.com/api/products/${productId}/buy`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Product bought successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'There was an error buying the product!');
    } finally {
      setLoading(false);
    }
  };

  const text1 = (
    <div className='market-slide' >
      <div className='slide-head'>
      <h2 >Discover the power of pWallet:</h2>
    </div>
    <div className='slide-content'>
      <h2>Empowering Avocado Farmers</h2>
    </div>
    <div className='slide-button'>
      <Link className="shop-now" to="/About">Shop Now</Link></div>
  </div>
  );
  const text2 = (
  <div className='market-slide' >
      <div className='slide-head'>
      <h2 >Negotiations is our carrier</h2>
    </div>
    <div className='slide-content'>
      <h2>To deliver</h2>
    </div>
    <div className='slide-button'>
      <Link className="shop-now" to="/market">Shop Now</Link>
    </div>
  </div>
  );
  const text3 = (
    <div className='market-slide' >
      <div className='slide-head'>
        <h2 >Explore your farming</h2>
      </div>
      <div className='slide-content'>
        <h2>Power harvestment</h2>
      </div>
      <div className='slide-button'>
        <Link className="shop-now" to="/market">Shop Now</Link></div>
    </div>
);

const images = [
  { url: image1, text: text1 },
  { url: image2, text: text2 },
  { url: image3, text: text3 },
];

  return (
    <>
    <DashboardHeader />
    <div className="market-container">
      
      <div className="market-wrapper">
        {/* Header Section */}
        <div className="market-header">
         <SlideShow images={images}/>
        </div>
      <div className="market-tabs">
        <button>All Categories</button>
        <div className="market-tabs-grid">
         <Link to="/dashboard/farmer/IrrigationKits">
                <button>Irrigation Kits</button>
              </Link>
              <Link to="/dashboard/farmer/HarvestingKit">
                <button>Harvesting Kits</button>
              </Link>
              <Link to="/dashboard/farmer/Protection">
                <button>Safety & Protection</button>
              </Link>
              <Link to="/dashboard/farmer/Container">
                <button>Container</button>
              </Link>
               <Link to="/dashboard/farmer/Pest">
                <button>Pest Management</button>
              </Link>
        </div>
      </div>

        
      </div>
      <Advertisement/>
    </div>
      {/* My Products Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
          <button 
            onClick={() => setShowAddProduct(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmerProducts.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Quantity:</strong> {product.quantity} {product.unit}</p>
                <p><strong>Price:</strong> ${product.pricePerUnit}/{product.unit}</p>
                <p><strong>Quality:</strong> {product.quality}</p>
                <p><strong>Harvest Date:</strong> {product.harvestDate}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {farmerProducts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products added yet. Click "Add Product" to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="market-products-container">
          <div className="market-products-wrapper">
            {loading ? (
              <div className="products-loader">
                <ClipLoader color="#3498db" loading={loading} size={50} />
              </div>
            ) :  (
              <div className='market-products-listing'>
              <h2>Equipment & Tools</h2>
              <div className="market-products-grid">
                <Link to="/dashboard/farmer/product">
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Sprinkler</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>10,000rwf</p>
                  </div>
                </div>
                </Link>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Irrigation Kit</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>25,000rwf</p>
                  </div>
                </div>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Harvesting Tools</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>15,000rwf</p>
                  </div>
                </div>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Fertilizer</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>8,000rwf</p>
                  </div>
                </div>
                <div className="market-product-card">
                  <div className="product-head">
                    <img src={product} alt="Product Image" />
                    <div className="product-name">
                      <p>Seeds</p>
                    </div>
                  </div>
                  <div className="product-footer">
                    <p>5,000rwf</p>
                  </div>
                </div>
                
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Add New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Grains">Grains</option>
                      <option value="Herbs">Herbs</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      >
                        <option value="kg">kg</option>
                        <option value="pieces">pieces</option>
                        <option value="cobs">cobs</option>
                        <option value="heads">heads</option>
                        <option value="bunches">bunches</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.pricePerUnit}
                      onChange={(e) => setNewProduct({...newProduct, pricePerUnit: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                    <select
                      value={newProduct.quality}
                      onChange={(e) => setNewProduct({...newProduct, quality: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Premium">Premium</option>
                      <option value="Good">Good</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                      rows="3"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    
    </>
  );
}