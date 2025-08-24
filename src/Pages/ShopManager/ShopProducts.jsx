import React, { useState, useEffect } from 'react';
import { 
  Package2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Leaf,
  X,
  Save,
  Image,
  Calendar,
  DollarSign,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  MapPin,
  Thermometer,
  Weight,
  Activity,
  Phone,
  Mail
} from 'lucide-react';
import MarketStorageService from '../../services/marketStorageService';

const ShopProducts = () => {
  const [activeView, setActiveView] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [formData, setFormData] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    MarketStorageService.initializeStorage();
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    try {
      const farmerProducts = MarketStorageService.getFarmerProducts();
      const inventoryData = MarketStorageService.getShopInventory();
      
      // Ensure unique IDs by prefixing with source type
      const uniqueFarmerProducts = farmerProducts.map(product => ({
        ...product,
        id: `farmer-${product.id}`,
        source: 'farmer'
      }));
      
      const uniqueInventoryData = inventoryData.map(product => ({
        ...product,
        id: `inventory-${product.id}`,
        source: 'inventory'
      }));
      
      // Combine farmer products and inventory data with unique IDs
      const allProducts = [...uniqueFarmerProducts, ...uniqueInventoryData];
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep existing hardcoded products as fallback
  const [fallbackProducts] = useState([
    {
      id: 'PRD-001',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      sku: 'ORG-TOM-001',
      description: 'Premium grade vine-ripened organic tomatoes',
      price: 15.00,
      costPrice: 8.50,
      stockQuantity: 125,
      minStockLevel: 20,
      maxStockLevel: 200,
      unit: 'kg',
      status: 'active',
      supplier: {
        id: 'SUP-001',
        name: 'Green Valley Farm',
        contact: 'John Smith',
        phone: '+1-555-0101',
        email: 'john@greenvalley.com'
      },
      harvestSeason: 'Summer',
      shelfLife: 7,
      storageTemp: '10-15°C',
      origin: 'California, USA',
      organic: true,
      images: ['tomato1.jpg', 'tomato2.jpg'],
      nutritionFacts: {
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fiber: 1.2,
        vitamins: ['Vitamin C', 'Vitamin K', 'Folate']
      },
      sales: {
        monthlyVolume: 450,
        monthlyRevenue: 6750.00,
        avgRating: 4.8,
        totalReviews: 124
      },
      lastRestocked: '2024-08-20',
      expiryDate: '2024-08-28',
      createdDate: '2024-01-15',
      updatedDate: '2024-08-20'
    },
    {
      id: 'PRD-002',
      name: 'Free Range Eggs',
      category: 'Dairy & Eggs',
      sku: 'FR-EGG-001',
      description: 'Large brown eggs from free-range hens',
      price: 12.50,
      costPrice: 7.00,
      stockQuantity: 89,
      minStockLevel: 30,
      maxStockLevel: 150,
      unit: 'dozen',
      status: 'active',
      supplier: {
        id: 'SUP-002',
        name: 'Happy Hens Farm',
        contact: 'Sarah Wilson',
        phone: '+1-555-0202',
        email: 'sarah@happyhens.com'
      },
      harvestSeason: 'Year-round',
      shelfLife: 14,
      storageTemp: '4-7°C',
      origin: 'Oregon, USA',
      organic: false,
      images: ['eggs1.jpg'],
      nutritionFacts: {
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fiber: 0,
        vitamins: ['Vitamin D', 'Vitamin B12', 'Selenium']
      },
      sales: {
        monthlyVolume: 280,
        monthlyRevenue: 3500.00,
        avgRating: 4.6,
        totalReviews: 89
      },
      lastRestocked: '2024-08-21',
      expiryDate: '2024-09-03',
      createdDate: '2024-02-01',
      updatedDate: '2024-08-21'
    },
    {
      id: 'PRD-003',
      name: 'Organic Spinach',
      category: 'Vegetables',
      sku: 'ORG-SPN-001',
      description: 'Fresh baby spinach leaves, organically grown',
      price: 6.50,
      costPrice: 3.25,
      stockQuantity: 15,
      minStockLevel: 25,
      maxStockLevel: 100,
      unit: 'bunches',
      status: 'low-stock',
      supplier: {
        id: 'SUP-003',
        name: 'Green Leaf Organics',
        contact: 'Mike Johnson',
        phone: '+1-555-0303',
        email: 'mike@greenleaf.com'
      },
      harvestSeason: 'Spring/Fall',
      shelfLife: 5,
      storageTemp: '0-4°C',
      origin: 'Washington, USA',
      organic: true,
      images: ['spinach1.jpg', 'spinach2.jpg'],
      nutritionFacts: {
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fiber: 2.2,
        vitamins: ['Vitamin K', 'Vitamin A', 'Iron']
      },
      sales: {
        monthlyVolume: 180,
        monthlyRevenue: 1170.00,
        avgRating: 4.9,
        totalReviews: 67
      },
      lastRestocked: '2024-08-19',
      expiryDate: '2024-08-26',
      createdDate: '2024-01-20',
      updatedDate: '2024-08-19'
    },
    {
      id: 'PRD-004',
      name: 'Mixed Herbs Pack',
      category: 'Herbs',
      sku: 'MIX-HRB-001',
      description: 'Assorted fresh herbs: basil, oregano, thyme',
      price: 8.50,
      costPrice: 4.75,
      stockQuantity: 0,
      minStockLevel: 15,
      maxStockLevel: 80,
      unit: 'packages',
      status: 'out-of-stock',
      supplier: {
        id: 'SUP-004',
        name: 'Herb Garden Specialists',
        contact: 'Lisa Chen',
        phone: '+1-555-0404',
        email: 'lisa@herbgarden.com'
      },
      harvestSeason: 'Spring/Summer',
      shelfLife: 4,
      storageTemp: '2-6°C',
      origin: 'California, USA',
      organic: true,
      images: ['herbs1.jpg'],
      nutritionFacts: {
        calories: 5,
        protein: 0.3,
        carbs: 1.1,
        fiber: 0.4,
        vitamins: ['Vitamin C', 'Vitamin A', 'Antioxidants']
      },
      sales: {
        monthlyVolume: 120,
        monthlyRevenue: 1020.00,
        avgRating: 4.7,
        totalReviews: 45
      },
      lastRestocked: '2024-08-15',
      expiryDate: '2024-08-25',
      createdDate: '2024-03-10',
      updatedDate: '2024-08-15'
    },
    {
      id: 'PRD-005',
      name: 'Cherry Tomatoes',
      category: 'Vegetables',
      sku: 'CHR-TOM-001',
      description: 'Sweet cherry tomatoes, mixed variety pack',
      price: 11.25,
      costPrice: 6.50,
      stockQuantity: 78,
      minStockLevel: 20,
      maxStockLevel: 120,
      unit: 'pints',
      status: 'active',
      supplier: {
        id: 'SUP-005',
        name: 'Cherry Hill Farm',
        contact: 'Tom Davis',
        phone: '+1-555-0505',
        email: 'tom@cherryhill.com'
      },
      harvestSeason: 'Summer',
      shelfLife: 8,
      storageTemp: '10-15°C',
      origin: 'California, USA',
      organic: false,
      images: ['cherry-tomatoes1.jpg', 'cherry-tomatoes2.jpg'],
      nutritionFacts: {
        calories: 20,
        protein: 1.0,
        carbs: 4.3,
        fiber: 1.3,
        vitamins: ['Vitamin C', 'Vitamin K', 'Lycopene']
      },
      sales: {
        monthlyVolume: 200,
        monthlyRevenue: 2250.00,
        avgRating: 4.5,
        totalReviews: 72
      },
      lastRestocked: '2024-08-22',
      expiryDate: '2024-08-26',
      createdDate: '2024-01-25',
      updatedDate: '2024-08-22'
    }
  ]);

  const categories = ['Vegetables', 'Fruits', 'Herbs', 'Dairy & Eggs', 'Grains', 'Nuts & Seeds'];

  // Initialize form data for editing
  useEffect(() => {
    if (modalType === 'edit' && selectedProduct) {
      setFormData(selectedProduct);
    } else if (modalType === 'add') {
      setFormData({
        name: '',
        category: '',
        sku: '',
        description: '',
        price: '',
        costPrice: '',
        stockQuantity: '',
        minStockLevel: '',
        maxStockLevel: '',
        unit: 'kg',
        status: 'active',
        supplier: {
          name: '',
          contact: '',
          phone: '',
          email: ''
        },
        harvestSeason: '',
        shelfLife: '',
        storageTemp: '',
        origin: '',
        organic: false
      });
    }
  }, [modalType, selectedProduct, showModal]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price': return a.price - b.price;
        case 'stock': return a.stockQuantity - b.stockQuantity;
        case 'sales': return (b.sales?.monthlyRevenue || 0) - (a.sales?.monthlyRevenue || 0);
        default: return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out-of-stock': return 'bg-red-100 text-red-800 border-red-200';
      case 'discontinued': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'low-stock': return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock': return <X className="h-4 w-4" />;
      case 'discontinued': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      const newProduct = {
        ...formData,
        id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
        sales: {
          monthlyVolume: 0,
          monthlyRevenue: 0,
          avgRating: 0,
          totalReviews: 0
        },
        nutritionFacts: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fiber: 0,
          vitamins: []
        }
      };
      setProducts([...products, newProduct]);
    } else if (modalType === 'edit') {
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...formData, updatedDate: new Date().toISOString().split('T')[0] }
          : p
      ));
      setSelectedProduct(formData);
    }
    setShowModal(false);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      if (selectedProduct && selectedProduct.id === productId) {
        setActiveView('list');
        setSelectedProduct(null);
      }
    }
  };

  const ProductModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {modalType === 'add' ? 'Add New Product' : 'Edit Product'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  required
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={formData.sku || ''}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input
                  type="text"
                  value={formData.origin || ''}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.organic || false}
                  onChange={(e) => setFormData({...formData, organic: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Organic Certified</label>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Pricing & Inventory</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity || ''}
                    onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
                  <input
                    type="number"
                    value={formData.minStockLevel || ''}
                    onChange={(e) => setFormData({...formData, minStockLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Level</label>
                  <input
                    type="number"
                    value={formData.maxStockLevel || ''}
                    onChange={(e) => setFormData({...formData, maxStockLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit || 'kg'}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="dozen">dozen</option>
                    <option value="bunches">bunches</option>
                    <option value="packages">packages</option>
                    <option value="pints">pints</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Life (days)</label>
                  <input
                    type="number"
                    value={formData.shelfLife || ''}
                    onChange={(e) => setFormData({...formData, shelfLife: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Storage Temperature</label>
                  <input
                    type="text"
                    value={formData.storageTemp || ''}
                    onChange={(e) => setFormData({...formData, storageTemp: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 4-7°C"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Season</label>
                <input
                  type="text"
                  value={formData.harvestSeason || ''}
                  onChange={(e) => setFormData({...formData, harvestSeason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Spring, Summer, Year-round"
                />
              </div>
            </div>

            {/* Supplier Information */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Supplier Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={formData.supplier?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      supplier: {...(formData.supplier || {}), name: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.supplier?.contact || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      supplier: {...(formData.supplier || {}), contact: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.supplier?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      supplier: {...(formData.supplier || {}), phone: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.supplier?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      supplier: {...(formData.supplier || {}), email: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {modalType === 'add' ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ProductListView = () => (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 lg:mb-0">
            <Package2 className="h-7 w-7 mr-3 text-green-600" />
            Product Management
          </h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                setModalType('add');
                setShowModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="sales">Sort by Sales</option>
          </select>

          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
            <Filter className="h-4 w-4 mr-2" />
            Advanced
          </button>
        </div>

        {/* Products Grid/Table Toggle */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <BarChart3 className="h-4 w-4" />
            </button>
            <button className="p-2 bg-green-100 rounded-lg">
              <Package2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <Package2 className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        <div className="flex items-center mt-1">
                          {product.organic && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full mr-2">
                              <Leaf className="h-3 w-3 mr-1" />
                              Organic
                            </span>
                          )}
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500 ml-1">{product.sales?.avgRating || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">{product.category}</div>
                      <div className="text-xs text-gray-500">{product.supplier?.name || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.stockQuantity} {product.unit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            product.stockQuantity <= product.minStockLevel 
                              ? 'bg-red-500' 
                              : product.stockQuantity <= product.minStockLevel * 1.5 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((product.stockQuantity / product.maxStockLevel) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: {product.minStockLevel} | Max: {product.maxStockLevel}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">${(product.price || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Cost: ${(product.costPrice || 0).toFixed(2)}</div>
                      <div className="text-xs text-green-600 font-medium">
                        Margin: {product.price && product.costPrice ? (((product.price - product.costPrice) / product.price) * 100).toFixed(1) : '0.0'}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        <span className="ml-1 capitalize">{product.status.replace('-', ' ')}</span>
                      </span>
                      <div className="text-xs text-gray-500">
                        Expires: {product.expiryDate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        ${(product.sales?.monthlyRevenue || 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.sales?.monthlyVolume || 0} {product.unit}/month
                      </div>
                      <div className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {product.sales?.totalReviews || 0} reviews
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setActiveView('detail');
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setModalType('edit');
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900" title="Duplicate Product">
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900" 
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-600 text-sm font-medium">Total Products</div>
            <div className="text-2xl font-bold text-green-900">{filteredProducts.length}</div>
            <div className="text-xs text-gray-500 mt-1">Active inventory items</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Total Value</div>
            <div className="text-2xl font-bold text-blue-900">
              ${filteredProducts.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Current inventory value</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-600 text-sm font-medium">Low Stock Items</div>
            <div className="text-2xl font-bold text-yellow-900">
              {filteredProducts.filter(product => product.status === 'low-stock' || product.status === 'out-of-stock').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Need restocking</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-purple-600 text-sm font-medium">Monthly Revenue</div>
            <div className="text-2xl font-bold text-purple-900">
              ${filteredProducts.reduce((sum, product) => sum + (product.sales?.monthlyRevenue || 0), 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">From selected products</div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductDetailView = () => {
    if (!selectedProduct) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => setActiveView('list')}
                className="mr-4 text-gray-600 hover:text-gray-800"
              >
                ← Back to Products
              </button>
              <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setModalType('edit');
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Order
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Status and Key Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusColor(selectedProduct.status)}`}>
              {getStatusIcon(selectedProduct.status)}
              <span className="ml-2 capitalize">{selectedProduct.status.replace('-', ' ')}</span>
            </span>
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              SKU: {selectedProduct.sku}
            </span>
            {selectedProduct.organic && (
              <span className="px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                <Leaf className="h-4 w-4 mr-1" />
                Organic Certified
              </span>
            )}
            <div className="flex items-center px-4 py-2 bg-yellow-50 rounded-full">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">{selectedProduct.sales?.avgRating || 'N/A'} ({selectedProduct.sales?.totalReviews || 0} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package2 className="h-5 w-5 mr-2 text-green-600" />
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Product Name</label>
                  <p className="text-gray-900 font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SKU</label>
                  <p className="text-gray-900">{selectedProduct.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Origin</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    {selectedProduct.origin}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{selectedProduct.description}</p>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Pricing & Inventory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-green-600">Selling Price</label>
                  <p className="text-2xl font-bold text-green-900">${(selectedProduct.price || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">per {selectedProduct.unit}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-blue-600">Cost Price</label>
                  <p className="text-2xl font-bold text-blue-900">${(selectedProduct.costPrice || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">per {selectedProduct.unit}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-purple-600">Profit Margin</label>
                  <p className="text-2xl font-bold text-purple-900">
                    {selectedProduct.price && selectedProduct.costPrice ? (((selectedProduct.price - selectedProduct.costPrice) / selectedProduct.price) * 100).toFixed(1) : '0.0'}%
                  </p>
                  <p className="text-xs text-gray-500">${selectedProduct.price && selectedProduct.costPrice ? (selectedProduct.price - selectedProduct.costPrice).toFixed(2) : '0.00'} profit</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Stock Levels</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className="text-lg font-bold text-gray-900">{selectedProduct.stockQuantity} {selectedProduct.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        selectedProduct.stockQuantity <= selectedProduct.minStockLevel 
                          ? 'bg-red-500' 
                          : selectedProduct.stockQuantity <= selectedProduct.minStockLevel * 1.5 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((selectedProduct.stockQuantity / selectedProduct.maxStockLevel) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Min: {selectedProduct.minStockLevel}</span>
                    <span>Max: {selectedProduct.maxStockLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage & Handling */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-green-600" />
                Storage & Handling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Storage Temperature</label>
                  <p className="text-gray-900 flex items-center">
                    <Thermometer className="h-4 w-4 mr-1 text-blue-500" />
                    {selectedProduct.storageTemp}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Shelf Life</label>
                  <p className="text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-orange-500" />
                    {selectedProduct.shelfLife} days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Harvest Season</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-green-500" />
                    {selectedProduct.harvestSeason}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Restocked</label>
                  <p className="text-gray-900">{selectedProduct.lastRestocked}</p>
                </div>
              </div>
            </div>

            {/* Nutrition Facts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Nutrition Facts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{selectedProduct.nutritionFacts.calories}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedProduct.nutritionFacts.protein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedProduct.nutritionFacts.carbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedProduct.nutritionFacts.fiber}g</p>
                  <p className="text-xs text-gray-500">Fiber</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Key Vitamins & Minerals</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProduct.nutritionFacts.vitamins.map((vitamin, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {vitamin}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Reorder Stock
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Pricing
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Delivery
                </button>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Supplier Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Supplier Name</label>
                  <p className="text-gray-900 font-medium">{selectedProduct.supplier?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Person</label>
                  <p className="text-gray-900">{selectedProduct.supplier?.contact || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                    {selectedProduct.supplier?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    {selectedProduct.supplier?.email || 'N/A'}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">
                    Contact Supplier
                  </button>
                </div>
              </div>
            </div>

            {/* Sales Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Sales Performance
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-green-600">Monthly Revenue</label>
                  <p className="text-xl font-bold text-green-900">${(selectedProduct.sales?.monthlyRevenue || 0).toFixed(0)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-blue-600">Monthly Volume</label>
                  <p className="text-xl font-bold text-blue-900">{selectedProduct.sales?.monthlyVolume || 0} {selectedProduct.unit}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-yellow-600">Customer Rating</label>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <p className="text-xl font-bold text-yellow-900">{selectedProduct.sales?.avgRating || 'N/A'}</p>
                    <span className="text-sm text-gray-500 ml-2">({selectedProduct.sales?.totalReviews || 0})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Important Dates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium">{selectedProduct.createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">{selectedProduct.updatedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Restocked</span>
                  <span className="text-sm font-medium">{selectedProduct.lastRestocked}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-red-600">Expires</span>
                  <span className="text-sm font-medium text-red-600">{selectedProduct.expiryDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {activeView === 'list' && <ProductListView />}
      {activeView === 'detail' && <ProductDetailView />}
      {showModal && <ProductModal />}
    </div>
  );
};

export default ShopProducts;