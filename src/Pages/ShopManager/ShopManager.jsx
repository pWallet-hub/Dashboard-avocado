import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  User, 
  Truck,
  Apple,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Thermometer,
  Droplets,
  Sun,
  CloudRain,
  Sprout,
  Clock
} from 'lucide-react';

const RwandaAvocadoManager = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [avocadoFarms, setAvocadoFarms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample Rwanda Avocado data
  useEffect(() => {
    setDashboardData({
      totalRevenue: 4750000,
      totalOrders: 89,
      totalCustomers: 45,
      totalTrees: 2850,
      harvestReady: 320,
      recentOrders: [
        { id: 'AVO-2024-001', customer: 'Kigali Premium Foods', date: '2024-09-03', amount: 450000, status: 'completed', variety: 'Hass' },
        { id: 'AVO-2024-002', customer: 'Hotel des Mille Collines', date: '2024-09-02', amount: 280000, status: 'processing', variety: 'Fuerte' },
        { id: 'AVO-2024-003', customer: 'Nakumatt Supermarket', date: '2024-09-02', amount: 180000, status: 'pending', variety: 'Hass' },
        { id: 'AVO-2024-004', customer: 'Rwanda Export Co.', date: '2024-09-01', amount: 650000, status: 'completed', variety: 'Mixed' }
      ],
      topVarieties: [
        { name: 'Hass Avocado', sold: 850, revenue: 1700000, pricePerKg: 2000 },
        { name: 'Fuerte Avocado', sold: 620, revenue: 1240000, pricePerKg: 2000 },
        { name: 'Ettinger Avocado', sold: 450, revenue: 810000, pricePerKg: 1800 },
        { name: 'Pinkerton Avocado', sold: 380, revenue: 684000, pricePerKg: 1800 }
      ],
      weatherData: {
        temperature: '24°C',
        humidity: '68%',
        rainfall: '15mm',
        soilMoisture: '72%'
      }
    });

    setInventory([
      { id: 1, name: 'Hass Avocado - Grade A', variety: 'Hass', quantity: 450, unit: 'kg', price: 2200, status: 'in-stock', quality: 'Premium', harvestDate: '2024-08-28' },
      { id: 2, name: 'Hass Avocado - Grade B', variety: 'Hass', quantity: 280, unit: 'kg', price: 1800, status: 'in-stock', quality: 'Standard', harvestDate: '2024-08-28' },
      { id: 3, name: 'Fuerte Avocado - Grade A', variety: 'Fuerte', quantity: 75, unit: 'kg', price: 2000, status: 'low-stock', quality: 'Premium', harvestDate: '2024-08-30' },
      { id: 4, name: 'Ettinger Avocado', variety: 'Ettinger', quantity: 320, unit: 'kg', price: 1800, status: 'in-stock', quality: 'Standard', harvestDate: '2024-09-01' },
      { id: 5, name: 'Pinkerton Avocado', variety: 'Pinkerton', quantity: 185, unit: 'kg', price: 1900, status: 'in-stock', quality: 'Premium', harvestDate: '2024-08-26' },
      { id: 6, name: 'Avocado Seedlings', variety: 'Various', quantity: 25, unit: 'plants', price: 15000, status: 'low-stock', quality: 'Premium', harvestDate: 'N/A' }
    ]);

    setOrders([
      { id: 'AVO-2024-001', customer: 'Kigali Premium Foods', orderDate: '2024-09-03', status: 'completed', totalAmount: 450000, variety: 'Hass Grade A', quantity: '220kg' },
      { id: 'AVO-2024-002', customer: 'Hotel des Mille Collines', orderDate: '2024-09-02', status: 'processing', totalAmount: 280000, variety: 'Fuerte Grade A', quantity: '140kg' },
      { id: 'AVO-2024-003', customer: 'Nakumatt Supermarket', orderDate: '2024-09-02', status: 'pending', totalAmount: 180000, variety: 'Hass Grade B', quantity: '100kg' },
      { id: 'AVO-2024-004', customer: 'Rwanda Export Co.', orderDate: '2024-09-01', status: 'completed', totalAmount: 650000, variety: 'Mixed Premium', quantity: '325kg' },
      { id: 'AVO-2024-005', customer: 'Serena Hotel Rwanda', orderDate: '2024-08-31', status: 'completed', totalAmount: 320000, variety: 'Hass Grade A', quantity: '160kg' }
    ]);

    setCustomers([
      { id: 1, name: 'Kigali Premium Foods', email: 'orders@kigalipremium.rw', phone: '+250 788 123 456', totalOrders: 18, totalSpent: 2850000, status: 'Premium Export', location: 'Kigali City', preferredVariety: 'Hass Grade A' },
      { id: 2, name: 'Hotel des Mille Collines', email: 'procurement@millecollines.rw', phone: '+250 788 234 567', totalOrders: 12, totalSpent: 1650000, status: 'Hospitality', location: 'Kigali', preferredVariety: 'Fuerte' },
      { id: 3, name: 'Rwanda Export Co.', email: 'exports@rwandaexport.rw', phone: '+250 788 345 678', totalOrders: 25, totalSpent: 4200000, status: 'International Export', location: 'Kigali', preferredVariety: 'Mixed Premium' },
      { id: 4, name: 'Nakumatt Supermarket', email: 'fresh@nakumatt.rw', phone: '+250 788 456 789', totalOrders: 15, totalSpent: 1890000, status: 'Retail Chain', location: 'Multiple Locations', preferredVariety: 'All Varieties' },
      { id: 5, name: 'Serena Hotel Rwanda', email: 'kitchen@serena.rw', phone: '+250 788 567 890', totalOrders: 20, totalSpent: 2450000, status: 'Hospitality', location: 'Kigali', preferredVariety: 'Hass Premium' }
    ]);

    setAvocadoFarms([
      { 
        id: 1, 
        farmerId: 'AF001', 
        farmerName: 'Jean Claude Nzeyimana', 
        farmName: 'Volcano View Avocado Farm',
        location: 'Musanze District', 
        totalTrees: 450, 
        varieties: ['Hass', 'Fuerte'], 
        plantingDate: '2019-03-15',
        expectedHarvest: '2024-10-15',
        currentYield: '8.5 tons/year',
        soilType: 'Volcanic Loam',
        altitude: '1,650m',
        irrigationSystem: 'Drip Irrigation',
        organicCertified: true,
        status: 'producing',
        nextHarvest: '25 days',
        description: 'Premium avocado farm in the foothills of Volcanoes National Park with ideal climate conditions'
      },
      { 
        id: 2, 
        farmerId: 'AF002', 
        farmerName: 'Rose Mukamana', 
        farmName: 'Sunrise Avocado Cooperative',
        location: 'Huye District', 
        totalTrees: 320, 
        varieties: ['Ettinger', 'Pinkerton'], 
        plantingDate: '2020-01-20',
        expectedHarvest: '2024-11-01',
        currentYield: '6.2 tons/year',
        soilType: 'Clay Loam',
        altitude: '1,450m',
        irrigationSystem: 'Sprinkler',
        organicCertified: false,
        status: 'producing',
        nextHarvest: '42 days',
        description: 'Women cooperative specializing in high-quality avocado varieties with sustainable farming practices'
      },
      { 
        id: 3, 
        farmerId: 'AF003', 
        farmerName: 'Paul Uwimana', 
        farmName: 'Highland Avocado Estate',
        location: 'Nyanza District', 
        totalTrees: 280, 
        varieties: ['Hass', 'Ettinger'], 
        plantingDate: '2018-09-10',
        expectedHarvest: '2024-09-20',
        currentYield: '7.8 tons/year',
        soilType: 'Red Clay',
        altitude: '1,720m',
        irrigationSystem: 'Manual Watering',
        organicCertified: true,
        status: 'harvest-ready',
        nextHarvest: '5 days',
        description: 'Established avocado farm with mature trees producing premium export-quality fruit'
      },
      { 
        id: 4, 
        farmerId: 'AF004', 
        farmerName: 'Marie Therese Uwimana', 
        farmName: 'Green Hills Avocado Farm',
        location: 'Kayonza District', 
        totalTrees: 180, 
        varieties: ['Fuerte', 'Pinkerton'], 
        plantingDate: '2021-05-12',
        expectedHarvest: '2024-12-10',
        currentYield: '4.5 tons/year',
        soilType: 'Sandy Loam',
        altitude: '1,380m',
        irrigationSystem: 'Drip Irrigation',
        organicCertified: false,
        status: 'developing',
        nextHarvest: '68 days',
        description: 'Young avocado plantation with modern irrigation and sustainable farming techniques'
      }
    ]);
  }, []);

  const handlePurchaseFromFarm = (farmerId, quantity, variety) => {
    const farm = avocadoFarms.find(f => f.farmerId === farmerId);
    if (farm) {
      const pricePerKg = variety === 'Premium' ? 2000 : 1800;
      const totalCost = quantity * pricePerKg;
      alert(`Purchase Agreement Successful!\nFarm: ${farm.farmName}\nFarmer: ${farm.farmerName}\nQuantity: ${quantity} kg\nVariety: ${variety}\nTotal Cost: ${totalCost.toLocaleString()} RWF\nHarvest Date: ${farm.expectedHarvest}`);
    }
  };

  const DashboardSection = () => (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-700 to-green-800 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-6">
              <Apple className="h-12 w-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Rwanda Avocado Farm Hub</h1>
              <p className="text-green-100 text-lg">Premium Avocado Production & Distribution Network</p>
              <div className="flex items-center mt-2 text-green-100">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Connecting Avocado Farms Across Rwanda's Districts</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">🥑</div>
              <div className="text-sm opacity-80">Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather & Farm Conditions */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <CloudRain className="h-6 w-6 mr-3 text-blue-600" />
          Current Farm Conditions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{dashboardData.weatherData?.temperature}</div>
            <div className="text-sm text-gray-600">Temperature</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{dashboardData.weatherData?.humidity}</div>
            <div className="text-sm text-gray-600">Humidity</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <CloudRain className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{dashboardData.weatherData?.rainfall}</div>
            <div className="text-sm text-gray-600">Daily Rainfall</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <Sprout className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{dashboardData.weatherData?.soilMoisture}</div>
            <div className="text-sm text-gray-600">Soil Moisture</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mb-1">{(dashboardData.totalRevenue || 0).toLocaleString()} RWF</p>
              <p className="text-green-100 text-xs flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +22.5% from last season
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mb-1">{dashboardData.totalOrders || 0}</p>
              <p className="text-blue-100 text-xs flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18.3% this month
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Avocado Trees</p>
              <p className="text-3xl font-bold mb-1">{dashboardData.totalTrees || 0}</p>
              <p className="text-orange-100 text-xs flex items-center">
                <Sprout className="h-3 w-3 mr-1" />
                Across all farms
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
              <Sprout className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Harvest Ready</p>
              <p className="text-3xl font-bold mb-1">{dashboardData.harvestReady || 0}</p>
              <p className="text-emerald-100 text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Trees ready to harvest
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3 group-hover:scale-110 transition-transform duration-300">
              <Apple className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
            <div className="bg-blue-100 rounded-lg p-2 mr-3">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            Recent Avocado Orders
          </h3>
          <div className="space-y-4">
            {(dashboardData.recentOrders || []).map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200">
                <div>
                  <p className="font-semibold text-gray-800">{order.customer}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {order.date} • {order.variety}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{order.amount.toLocaleString()} RWF</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
            <div className="bg-green-100 rounded-lg p-2 mr-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            Top Avocado Varieties
          </h3>
          <div className="space-y-4">
            {(dashboardData.topVarieties || []).map((variety, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-green-200">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 shadow-md">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{variety.name}</p>
                    <p className="text-sm text-gray-600">{variety.sold} kg sold • {variety.pricePerKg.toLocaleString()} RWF/kg</p>
                  </div>
                </div>
                <p className="font-bold text-gray-800">{variety.revenue.toLocaleString()} RWF</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Manage Stock', icon: Package, gradient: 'from-green-500 to-green-600', section: 'inventory' },
            { label: 'New Order', icon: ShoppingCart, gradient: 'from-blue-500 to-blue-600', section: 'orders' },
            { label: 'Customers', icon: Users, gradient: 'from-purple-500 to-purple-600', section: 'customers' },
            { label: 'Avocado Farms', icon: Sprout, gradient: 'from-emerald-500 to-emerald-600', section: 'farms' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button 
                key={index}
                onClick={() => setActiveSection(action.section)}
                className={`group p-6 bg-gradient-to-br ${action.gradient} rounded-xl text-white hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
              >
                <Icon className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                <span className="text-sm font-semibold block">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const InventorySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <div className="bg-green-100 rounded-lg p-2 mr-4">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            Avocado Inventory Management
          </h2>
          <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg flex items-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Add Avocado Stock
          </button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by avocado variety, grade, or harvest date..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Variety</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price (RWF)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quality</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Harvest Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{item.variety}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">{item.quantity} {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.price.toLocaleString()} RWF</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      item.quality === 'Premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.harvestDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'low-stock' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'low-stock' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-full transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 hover:bg-green-100 p-2 rounded-full transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 hover:bg-red-100 p-2 rounded-full transition-all duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const OrdersSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <div className="bg-blue-100 rounded-lg p-2 mr-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            Avocado Orders Management
          </h2>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            New Avocado Order
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Variety & Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total (RWF)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.variety}</div>
                    <div className="text-xs text-gray-500">{order.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{order.totalAmount.toLocaleString()} RWF</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-full transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 hover:bg-green-100 p-2 rounded-full transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CustomersSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <div className="bg-purple-100 rounded-lg p-2 mr-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            Avocado Customer Management
          </h2>
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg flex items-center shadow-lg transform hover:scale-105 transition-all duration-200">
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 hover:border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  customer.status === 'International Export' ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900' :
                  customer.status === 'Premium Export' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                  customer.status === 'Hospitality' ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900' :
                  'bg-gradient-to-r from-green-400 to-green-500 text-green-900'
                }`}>
                  {customer.status}
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <strong>Email:</strong> <span className="ml-2">{customer.email}</span>
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <strong>Phone:</strong> <span className="ml-2">{customer.phone}</span>
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <strong>Location:</strong> <span className="ml-2">{customer.location}</span>
                </p>
                <p className="flex items-center">
                  <Apple className="h-4 w-4 mr-2 text-gray-400" />
                  <strong>Preferred:</strong> <span className="ml-2">{customer.preferredVariety}</span>
                </p>
                <p><strong>Orders:</strong> {customer.totalOrders}</p>
                <p><strong>Total Spent:</strong> <span className="font-bold text-green-600">{customer.totalSpent.toLocaleString()} RWF</span></p>
              </div>
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FarmsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <div className="bg-green-100 rounded-lg p-2 mr-4">
              <Sprout className="h-8 w-8 text-green-600" />
            </div>
            Rwandan Avocado Farms Network
          </h2>
          <button 
            onClick={() => setLoading(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg flex items-center shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Search className="h-5 w-5 mr-2" />
            Refresh Farm Data
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading avocado farm data from across Rwanda...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {avocadoFarms.map((farm) => (
              <div key={farm.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-green-500 hover:border-green-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{farm.farmName}</h3>
                  <div className="flex items-center space-x-2">
                    {farm.organicCertified && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                        🌱 Organic
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      farm.status === 'harvest-ready' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900' :
                      farm.status === 'producing' ? 'bg-gradient-to-r from-green-400 to-green-500 text-green-900' :
                      'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900'
                    }`}>
                      {farm.status === 'harvest-ready' ? 'Ready to Harvest' : 
                       farm.status === 'producing' ? 'Producing' : 'Developing'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <strong>Owner:</strong> <span className="ml-2 text-green-700 font-semibold">{farm.farmerName}</span>
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <strong>Location:</strong> <span className="ml-2">{farm.location}</span>
                    </p>
                    <p><strong>Altitude:</strong> {farm.altitude}</p>
                    <p><strong>Soil Type:</strong> {farm.soilType}</p>
                    <p><strong>Irrigation:</strong> {farm.irrigationSystem}</p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Total Trees:</strong> <span className="font-semibold text-gray-800">{farm.totalTrees}</span></p>
                    <p><strong>Varieties:</strong> <span className="text-green-600">{farm.varieties.join(', ')}</span></p>
                    <p><strong>Annual Yield:</strong> {farm.currentYield}</p>
                    <p><strong>Planted:</strong> {farm.plantingDate}</p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <strong>Next Harvest:</strong> <span className="ml-1 text-orange-600 font-semibold">{farm.nextHarvest}</span>
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 italic text-sm mb-4">"{farm.description}"</p>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      const quantity = prompt(`How many kg of avocados would you like to pre-order from ${farm.farmName}?\n\nFarmer: ${farm.farmerName}\nLocation: ${farm.location}\nVarieties: ${farm.varieties.join(', ')}\nNext Harvest: ${farm.nextHarvest}\nExpected Date: ${farm.expectedHarvest}`);
                      if (quantity && !isNaN(quantity) && quantity > 0) {
                        const variety = prompt(`Which grade would you prefer?\n1. Premium Grade (2000 RWF/kg)\n2. Standard Grade (1800 RWF/kg)\n\nEnter '1' or '2':`);
                        const gradeType = variety === '1' ? 'Premium' : 'Standard';
                        handlePurchaseFromFarm(farm.farmerId, parseInt(quantity), gradeType);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center shadow-md transform hover:scale-105 transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {farm.status === 'harvest-ready' ? 'Purchase Now' : 'Pre-Order'}
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
                    <Phone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const AnalyticsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center mb-8">
          <div className="bg-indigo-100 rounded-lg p-2 mr-4">
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
          Rwanda Avocado Market Analytics & Reports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Seasonal Revenue
            </h3>
            <p className="text-3xl font-bold">4,890,000 RWF</p>
            <p className="text-green-100 text-sm mt-1">+28.5% from last season</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Apple className="h-5 w-5 mr-2" />
              Avocados Sold
            </h3>
            <p className="text-3xl font-bold">2,300 kg</p>
            <p className="text-blue-100 text-sm mt-1">+18.3% this harvest season</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Sprout className="h-5 w-5 mr-2" />
              Active Farms
            </h3>
            <p className="text-3xl font-bold">15</p>
            <p className="text-purple-100 text-sm mt-1">Across 8 districts</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Export Growth
            </h3>
            <p className="text-3xl font-bold">+45%</p>
            <p className="text-orange-100 text-sm mt-1">International exports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-8 border border-gray-200 hover:border-green-300 transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-green-600" />
              Avocado Market Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Average Price per Kg</span>
                <span className="font-bold text-green-600">1,950 RWF</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Top Selling Variety</span>
                <span className="font-bold text-blue-600">Hass Avocado</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Best Customer</span>
                <span className="font-bold text-purple-600">Rwanda Export Co.</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Peak Harvest Season</span>
                <span className="font-bold text-orange-600">Mar - May & Sep - Nov</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200 hover:border-blue-300 transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Sprout className="h-6 w-6 mr-3 text-indigo-600" />
              Production Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Total Avocado Trees</span>
                <span className="font-bold text-green-600">2,850 Trees</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Organic Certified Farms</span>
                <span className="font-bold text-emerald-600">8 Farms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Average Yield per Tree</span>
                <span className="font-bold text-blue-600">35-45 kg/year</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-700 font-medium">Quality Grade A</span>
                <span className="font-bold text-yellow-600">65% of harvest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'inventory': return <InventorySection />;
      case 'orders': return <OrdersSection />;
      case 'customers': return <CustomersSection />;
      case 'farms': return <FarmsSection />;
      case 'analytics': return <AnalyticsSection />;
      default: return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2 mr-3">
                  <Apple className="h-8 w-8 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">Rwanda Avocado Hub</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'inventory', label: 'Inventory', icon: Package },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'farms', label: 'Farms', icon: Sprout },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default RwandaAvocadoManager;