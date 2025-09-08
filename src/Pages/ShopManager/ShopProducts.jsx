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
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../services/productsService';

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
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await listProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Updated hardcoded products for Rwanda avocado farming
  const [fallbackProducts] = useState([
    {
      id: 'PRD-001',
      name: 'Hass Avocado (Large)',
      category: 'Fruits',
      sku: 'HASS-LRG-001',
      description: 'Premium Hass avocados, ripe and ready for export, grown in Rwanda’s fertile highlands',
      price: 2500,
      costPrice: 1500,
      stockQuantity: 120,
      minStockLevel: 20,
      maxStockLevel: 200,
      unit: 'kg',
      status: 'active',
      supplier: {
        id: 'SUP-001',
        name: 'Kigali Avocado Co-op',
        contact: 'Jean-Pierre Nkurunziza',
        phone: '+250788123456',
        email: 'jp@kigaliavocado.rw'
      },
      harvestSeason: 'February-May',
      shelfLife: 30,
      storageTemp: '5-10°C',
      origin: 'Northern Province, Rwanda',
      organic: true,
      images: ['hass-avocado1.jpg', 'hass-avocado2.jpg'],
      nutritionFacts: {
        calories: 160,
        protein: 2.0,
        carbs: 9.0,
        fiber: 7.0,
        vitamins: ['Vitamin K', 'Vitamin E', 'Folate']
      },
      sales: {
        monthlyVolume: 400,
        monthlyRevenue: 1000000,
        avgRating: 4.8,
        totalReviews: 150
      },
      lastRestocked: '2025-08-20',
      expiryDate: '2025-09-26',
      createdDate: '2025-01-15',
      updatedDate: '2025-08-20'
    },
    {
      id: 'PRD-002',
      name: 'Fuerte Avocado (Medium)',
      category: 'Fruits',
      sku: 'FUER-MED-001',
      description: 'Fuerte avocados with smooth texture, ideal for local markets in Rwanda',
      price: 2000,
      costPrice: 1200,
      stockQuantity: 85,
      minStockLevel: 30,
      maxStockLevel: 150,
      unit: 'kg',
      status: 'active',
      supplier: {
        id: 'SUP-002',
        name: 'Musanze Farmers Union',
        contact: 'Marie Mukamana',
        phone: '+250788654321',
        email: 'marie@musanze.rw'
      },
      harvestSeason: 'June-September',
      shelfLife: 35,
      storageTemp: '5-10°C',
      origin: 'Musanze, Rwanda',
      organic: false,
      images: ['fuerte-avocado1.jpg'],
      nutritionFacts: {
        calories: 160,
        protein: 2.0,
        carbs: 9.0,
        fiber: 7.0,
        vitamins: ['Vitamin K', 'Vitamin B5', 'Vitamin E']
      },
      sales: {
        monthlyVolume: 300,
        monthlyRevenue: 600000,
        avgRating: 4.6,
        totalReviews: 90
      },
      lastRestocked: '2025-08-21',
      expiryDate: '2025-09-25',
      createdDate: '2025-02-01',
      updatedDate: '2025-08-21'
    },
    {
      id: 'PRD-003',
      name: 'Organic Avocado Seedlings',
      category: 'Planting Materials',
      sku: 'ORG-AVO-SED-001',
      description: 'Healthy Hass avocado seedlings for sustainable farming in Rwanda',
      price: 1500,
      costPrice: 800,
      stockQuantity: 50,
      minStockLevel: 25,
      maxStockLevel: 100,
      unit: 'pieces',
      status: 'low-stock',
      supplier: {
        id: 'SUP-003',
        name: 'Rwanda Agro Nursery',
        contact: 'Emmanuel Rwamucyo',
        phone: '+250788987654',
        email: 'emmanuel@rwandaagro.rw'
      },
      harvestSeason: 'N/A',
      shelfLife: 90,
      storageTemp: '15-20°C',
      origin: 'Kigali, Rwanda',
      organic: true,
      images: ['avocado-seedling1.jpg', 'avocado-seedling2.jpg'],
      nutritionFacts: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fiber: 0,
        vitamins: []
      },
      sales: {
        monthlyVolume: 100,
        monthlyRevenue: 150000,
        avgRating: 4.9,
        totalReviews: 70
      },
      lastRestocked: '2025-08-19',
      expiryDate: '2025-11-27',
      createdDate: '2025-01-20',
      updatedDate: '2025-08-19'
    },
    {
      id: 'PRD-004',
      name: 'Avocado Harvesting Nets',
      category: 'Equipment',
      sku: 'AVO-NET-001',
      description: 'Durable nets for gentle avocado harvesting in Rwanda’s hilly regions',
      price: 5000,
      costPrice: 3000,
      stockQuantity: 0,
      minStockLevel: 15,
      maxStockLevel: 80,
      unit: 'units',
      status: 'out-of-stock',
      supplier: {
        id: 'SUP-004',
        name: 'Huye Agro Supplies',
        contact: 'Fatuma Uwimana',
        phone: '+250788456789',
        email: 'fatuma@huyeagro.rw'
      },
      harvestSeason: 'N/A',
      shelfLife: 365,
      storageTemp: '10-25°C',
      origin: 'Southern Province, Rwanda',
      organic: false,
      images: ['avocado-net1.jpg'],
      nutritionFacts: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fiber: 0,
        vitamins: []
      },
      sales: {
        monthlyVolume: 50,
        monthlyRevenue: 250000,
        avgRating: 4.7,
        totalReviews: 45
      },
      lastRestocked: '2025-08-15',
      expiryDate: '2026-08-14',
      createdDate: '2025-03-10',
      updatedDate: '2025-08-15'
    },
    {
      id: 'PRD-005',
      name: 'Avocado Oil (Cold-Pressed)',
      category: 'Processed Goods',
      sku: 'AVO-OIL-001',
      description: 'Pure cold-pressed avocado oil from Rwanda’s finest avocados',
      price: 8000,
      costPrice: 4500,
      stockQuantity: 75,
      minStockLevel: 20,
      maxStockLevel: 120,
      unit: 'liters',
      status: 'active',
      supplier: {
        id: 'SUP-005',
        name: 'Gisenyi Oil Processors',
        contact: 'Joseph Niyonzima',
        phone: '+250788321654',
        email: 'joseph@gisenyioil.rw'
      },
      harvestSeason: 'N/A',
      shelfLife: 180,
      storageTemp: '10-20°C',
      origin: 'Western Province, Rwanda',
      organic: true,
      images: ['avocado-oil1.jpg', 'avocado-oil2.jpg'],
      nutritionFacts: {
        calories: 120,
        protein: 0,
        carbs: 0,
        fiber: 0,
        vitamins: ['Vitamin E', 'Omega-9']
      },
      sales: {
        monthlyVolume: 60,
        monthlyRevenue: 480000,
        avgRating: 4.5,
        totalReviews: 80
      },
      lastRestocked: '2025-08-22',
      expiryDate: '2026-02-18',
      createdDate: '2025-01-25',
      updatedDate: '2025-08-22'
    }
  ]);

  const categories = ['Fruits', 'Planting Materials', 'Equipment', 'Processed Goods'];

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        const response = await createProduct(formData);
        setProducts([...products, response.data]);
      } else if (modalType === 'edit') {
        const response = await updateProduct(selectedProduct.id, formData);
        setProducts(products.map(p => 
          p.id === selectedProduct.id ? response.data : p
        ));
        setSelectedProduct(response.data);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      // Fallback to local state if API fails
      if (modalType === 'add') {
        const newProduct = {
          ...formData,
          id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
          createdDate: new Date('2025-08-27T13:29:00+02:00').toISOString().split('T')[0],
          updatedDate: new Date('2025-08-27T13:29:00+02:00').toISOString().split('T')[0],
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
            ? { ...formData, updatedDate: new Date('2025-08-27T13:29:00+02:00').toISOString().split('T')[0] }
            : p
        ));
        setSelectedProduct(formData);
      }
      setShowModal(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
        if (selectedProduct && selectedProduct.id === productId) {
          setActiveView('list');
          setSelectedProduct(null);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        // Fallback to local state if API fails
        setProducts(products.filter(p => p.id !== productId));
        if (selectedProduct && selectedProduct.id === productId) {
          setActiveView('list');
          setSelectedProduct(null);
        }
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
                  placeholder="e.g., Northern Province, Rwanda"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF) *</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (RWF)</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData({...formData, costPrice: parseInt(e.target.value)})}
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
                    <option value="pieces">pieces</option>
                    <option value="units">units</option>
                    <option value="liters">liters</option>
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
                    placeholder="e.g., 5-10°C"
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
                  placeholder="e.g., February-May, Year-round"
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
            Avocado Product Management
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
              placeholder="Search avocado products..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (RWF)</th>
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
                      <div className="text-sm font-medium text-gray-900">{product.price.toLocaleString()} RWF</div>
                      <div className="text-xs text-gray-500">Cost: {product.costPrice.toLocaleString()} RWF</div>
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
                        {product.sales?.monthlyRevenue.toLocaleString()} RWF
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
            <div className="text-xs text-gray-500 mt-1">Active avocado items</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-600 text-sm font-medium">Total Value</div>
            <div className="text-2xl font-bold text-blue-900">
              {filteredProducts.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0).toLocaleString()} RWF
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
              {filteredProducts.reduce((sum, product) => sum + (product.sales?.monthlyRevenue || 0), 0).toLocaleString()} RWF
            </div>
            <div className="text-xs text-gray-500 mt-1">From selected products</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showModal && <ProductModal />}
      <ProductListView />
    </div>
  );
};

export default ShopProducts;
