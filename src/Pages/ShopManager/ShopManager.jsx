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
  Trash2
} from 'lucide-react';
import MarketStorageService from '../../services/marketStorageService';

const ShopManager = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize data from localStorage on component mount
  useEffect(() => {
    MarketStorageService.initializeStorage();
    loadAllData();
  }, []);

  const loadAllData = () => {
    setLoading(true);
    try {
      const stats = MarketStorageService.getDashboardStats();
      setDashboardData({
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalCustomers: stats.totalCustomers || 0,
        lowStockItems: stats.lowStockItems || 0,
        recentOrders: stats.recentOrders || [],
        topProducts: stats.topProducts || []
      });
      setInventory(MarketStorageService.getShopInventory());
      setOrders(MarketStorageService.getShopOrders());
      setCustomers(MarketStorageService.getShopCustomers());
      setFarmerProducts(MarketStorageService.getFarmerProducts());
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setDashboardData({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        lowStockItems: 0,
        recentOrders: [],
        topProducts: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseFromFarmer = async (farmerId, productId, quantity) => {
    try {
      const transaction = MarketStorageService.purchaseFromFarmer(farmerId, productId, quantity);
      loadAllData(); // Refresh all data
      alert(`Successfully purchased ${quantity} units from farmer. Transaction ID: ${transaction.id}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };


  const DashboardSection = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <Apple className="h-10 w-10 mr-4" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Farm Shop Dashboard</h1>
            <p className="text-green-100">Welcome to your farm produce management system</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">${(dashboardData.totalRevenue || 0).toFixed(2)}</p>
              <p className="text-green-600 text-xs">+12.5% from last month</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.totalOrders || 0}</p>
              <p className="text-blue-600 text-xs">+8.2% from last month</p>
            </div>
            <ShoppingCart className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Customers</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.totalCustomers || 0}</p>
              <p className="text-purple-600 text-xs">+5 new this week</p>
            </div>
            <Users className="h-10 w-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.lowStockItems || 0}</p>
              <p className="text-red-600 text-xs">Requires attention</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-600" />
            Recent Orders
          </h3>
          <div className="space-y-3">
            {(dashboardData.recentOrders || []).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{order.customer}</p>
                  <p className="text-sm text-gray-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
            Top Products
          </h3>
          <div className="space-y-3">
            {(dashboardData.topProducts || []).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sold} units sold</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">${product.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Product', icon: Apple, color: 'green', section: 'inventory' },
            { label: 'New Order', icon: ShoppingCart, color: 'blue', section: 'orders' },
            { label: 'Add Customer', icon: Users, color: 'purple', section: 'customers' },
            { label: 'Check Stock', icon: Package, color: 'orange', section: 'inventory' }
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <button 
                key={index}
                onClick={() => setActiveSection(action.section)}
                className={`p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition-colors flex flex-col items-center group`}
              >
                <Icon className={`h-8 w-8 text-${action.color}-600 mb-2 group-hover:scale-110 transition-transform`} />
                <span className={`text-sm font-medium text-${action.color}-800`}>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const InventorySection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Package className="h-7 w-7 mr-3 text-green-600" />
            Inventory Management
          </h2>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status === 'low-stock' ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                      <button className="text-green-600 hover:text-green-900"><Eye className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="h-7 w-7 mr-3 text-blue-600" />
            Orders Management
          </h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                      <button className="text-green-600 hover:text-green-900"><Eye className="h-4 w-4" /></button>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="h-7 w-7 mr-3 text-purple-600" />
            Customer Management
          </h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div key={customer.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{customer.name}</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {customer.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Phone:</strong> {customer.phone}</p>
                <p><strong>Orders:</strong> {customer.totalOrders}</p>
                <p><strong>Total Spent:</strong> ${customer.totalSpent}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                <button className="text-green-600 hover:text-green-900"><Eye className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SuppliersSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <User className="h-7 w-7 mr-3 text-green-600" />
            Farmer Products Available
          </h2>
          <button 
            onClick={loadAllData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading farmer products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmerProducts.filter(product => product.status === 'available').map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.quality === 'Premium' ? 'bg-gold-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quality}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Farmer:</strong> {product.farmerName}</p>
                  <p><strong>Location:</strong> {product.location}</p>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Available:</strong> {product.quantity} {product.unit}</p>
                  <p><strong>Price:</strong> ${product.pricePerUnit}/{product.unit}</p>
                  <p><strong>Harvest Date:</strong> {product.harvestDate}</p>
                  <p><strong>Description:</strong> {product.description}</p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => {
                      const quantity = prompt(`How many ${product.unit} would you like to purchase? (Available: ${product.quantity})`);
                      if (quantity && !isNaN(quantity) && quantity > 0) {
                        handlePurchaseFromFarmer(product.farmerId, product.id, parseInt(quantity));
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Purchase
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 p-2">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {farmerProducts.filter(product => product.status === 'available').length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No farmer products available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const AnalyticsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
          <TrendingUp className="h-7 w-7 mr-3 text-indigo-600" />
          Analytics & Reports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
            <p className="text-3xl font-bold">$15,420</p>
            <p className="text-blue-100 text-sm">+12.5% from last month</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Orders Completed</h3>
            <p className="text-3xl font-bold">89</p>
            <p className="text-green-100 text-sm">+8.2% from last month</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Customer Growth</h3>
            <p className="text-3xl font-bold">+15</p>
            <p className="text-purple-100 text-sm">New customers this month</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold">$173.25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Top Selling Product</span>
              <span className="font-semibold">Organic Tomatoes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Customer</span>
              <span className="font-semibold">Green Valley Market</span>
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
      case 'suppliers': return <SuppliersSection />;
      case 'analytics': return <AnalyticsSection />;
      default: return <DashboardSection />;
    }
  };

  return (
    <div className="space-y-6">
      <DashboardSection />
    </div>
  );
};

export default ShopManager;