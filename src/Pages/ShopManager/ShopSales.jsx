import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, ShoppingCart, Users, Calendar, 
  Search, Filter, Download, Eye, Edit2, Plus, BarChart3,
  ArrowUpRight, ArrowDownRight, Package, Clock, Star
} from 'lucide-react';
import MarketStorageService from '../../services/marketStorageService';

const ShopSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const loadSalesData = () => {
    setLoading(true);
    try {
      // Sync farmer data to ensure latest connections
      MarketStorageService.syncAllFarmerData();
      
      const orders = MarketStorageService.getShopOrders() || [];
      const customers = MarketStorageService.getShopCustomers() || [];
      const inventory = MarketStorageService.getShopInventory() || [];
      const transactions = MarketStorageService.getMarketTransactions() || [];
      
      // Transform orders into sales data
      const sales = orders.map(order => {
        const customer = customers.find(c => c.id === order.customerId);
        const relatedTransaction = transactions.find(t => t.farmerId === order.supplierId);
        
        return {
          ...order,
          customerName: customer?.name || order.customerName || (order.customerId === 'internal' ? 'Internal Stock Purchase' : 'Unknown Customer'),
          customerEmail: customer?.email || order.customerEmail || '',
          customerPhone: customer?.phone || order.customerPhone || '',
          profit: calculateProfit(order, inventory),
          sourceType: order.sourceType || 'regular',
          farmerSupplier: relatedTransaction ? relatedTransaction.farmerName : null
        };
      });

      setSalesData(sales);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = (order, inventory) => {
    let totalCost = 0;
    order.items?.forEach(item => {
      const product = inventory.find(p => p.id === item.productId);
      if (product) {
        totalCost += (product.costPrice || product.price * 0.6) * item.quantity;
      }
    });
    return order.totalAmount - totalCost;
  };

  const getSalesMetrics = () => {
    const filteredSales = getFilteredSales();
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
    const totalOrders = filteredSales.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (mock data for demo)
    const revenueGrowth = 12.5;
    const ordersGrowth = 8.3;

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      avgOrderValue,
      revenueGrowth,
      ordersGrowth,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    };
  };

  const getFilteredSales = () => {
    let filtered = salesData;

    // Filter by date range
    const now = new Date();
    const filterDate = new Date();
    switch (dateRange) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        filterDate.setFullYear(now.getFullYear() - 1);
    }

    filtered = filtered.filter(sale => new Date(sale.orderDate) >= filterDate);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm) ||
        sale.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const SalesList = () => {
    const filteredSales = getFilteredSales();

    return (
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, order ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filter
            </button>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Profit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">#{sale.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{sale.customerName}</div>
                        <div className="text-sm text-gray-500">{sale.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(sale.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {sale.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">${sale.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        (sale.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${(sale.profit || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : sale.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : sale.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sales found matching your criteria.
            </div>
          )}
        </div>
      </div>
    );
  };

  const SalesAnalytics = () => {
    const metrics = getSalesMetrics();
    const filteredSales = getFilteredSales();

    // Calculate top products
    const productSales = {};
    filteredSales.forEach(sale => {
      sale.items?.forEach(item => {
        if (productSales[item.productName]) {
          productSales[item.productName] += item.quantity;
        } else {
          productSales[item.productName] = item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Calculate farmer-related metrics
    const farmerSales = filteredSales.filter(sale => sale.sourceType === 'farmer_purchase');
    const farmerRevenue = farmerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const regularSales = filteredSales.filter(sale => sale.sourceType !== 'farmer_purchase');
    const regularRevenue = regularSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Get farmer suppliers data
    const farmerSuppliers = {};
    farmerSales.forEach(sale => {
      if (sale.farmerSupplier) {
        if (farmerSuppliers[sale.farmerSupplier]) {
          farmerSuppliers[sale.farmerSupplier] += sale.totalAmount;
        } else {
          farmerSuppliers[sale.farmerSupplier] = sale.totalAmount;
        }
      }
    });

    const topFarmerSuppliers = Object.entries(farmerSuppliers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, revenue]) => ({ name, revenue }));

    // Calculate monthly sales (mock data for demo)
    const monthlySales = [
      { month: 'Jan', revenue: 12500, orders: 45 },
      { month: 'Feb', revenue: 15200, orders: 52 },
      { month: 'Mar', revenue: 18900, orders: 61 },
      { month: 'Apr', revenue: 16800, orders: 58 },
      { month: 'May', revenue: 21300, orders: 67 },
      { month: 'Jun', revenue: 19500, orders: 63 }
    ];

    return (
      <div className="space-y-6">
        {/* Farmer Integration Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Farmer Market Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">{farmerSales.length}</div>
              <div className="text-sm text-gray-600">Farmer Purchases</div>
              <div className="text-xs text-gray-500">${farmerRevenue.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">{regularSales.length}</div>
              <div className="text-sm text-gray-600">Regular Sales</div>
              <div className="text-xs text-gray-500">${regularRevenue.toFixed(2)}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {farmerRevenue > 0 ? ((farmerRevenue / (farmerRevenue + regularRevenue)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Farmer Revenue %</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">{topFarmerSuppliers.length}</div>
              <div className="text-sm text-gray-600">Active Farmers</div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold">${metrics.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Profit</span>
                <span className="font-semibold text-green-600">${metrics.totalProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-semibold">{metrics.profitMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Order Value</span>
                <span className="font-semibold">${metrics.avgOrderValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Farmer Suppliers</h3>
            <div className="space-y-3">
              {topFarmerSuppliers.length > 0 ? topFarmerSuppliers.map((farmer, index) => (
                <div key={farmer.name} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm">{farmer.name}</span>
                  </div>
                  <span className="font-semibold text-green-600">${farmer.revenue.toFixed(2)}</span>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No farmer suppliers yet</p>
                  <p className="text-xs">Add products from farmer market to see suppliers</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trends</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue Growth</span>
                <span className="font-semibold text-green-600">+{metrics.revenueGrowth}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Growth</span>
                <span className="font-semibold text-green-600">+{metrics.ordersGrowth}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Retention</span>
                <span className="font-semibold">78.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-semibold">3.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Sales Trend</h3>
          <div className="grid grid-cols-6 gap-4">
            {monthlySales.map((month, index) => (
              <div key={month.month} className="text-center">
                <div className="mb-2">
                  <div 
                    className="bg-blue-500 rounded-t mx-auto"
                    style={{ 
                      height: `${(month.revenue / 25000) * 100}px`,
                      width: '40px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1">${(month.revenue / 1000).toFixed(0)}k</div>
                </div>
                <div className="text-sm font-medium text-gray-700">{month.month}</div>
                <div className="text-xs text-gray-500">{month.orders} orders</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Sales by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['completed', 'pending', 'processing', 'cancelled'].map(status => {
              const statusSales = filteredSales.filter(sale => sale.status === status);
              const statusRevenue = statusSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
              
              return (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold mb-2 ${
                    status === 'completed' ? 'text-green-600' :
                    status === 'pending' ? 'text-yellow-600' :
                    status === 'processing' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {statusSales.length}
                  </div>
                  <div className="text-sm text-gray-600 capitalize mb-1">{status}</div>
                  <div className="text-xs text-gray-500">${statusRevenue.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const SalesOverview = () => {
    const metrics = getSalesMetrics();

    return (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+{metrics.revenueGrowth}%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+{metrics.ordersGrowth}%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.avgOrderValue.toFixed(2)}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+5.2%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+2.1%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Sales</h3>
            <button 
              onClick={() => setActiveView('list')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSales().slice(0, 5).map(sale => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-blue-600">#{sale.id}</td>
                    <td className="py-3 px-4">{sale.customerName}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(sale.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">${sale.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : sale.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const SaleDetailModal = () => {
    if (!selectedSale) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Sale Details - Order #{selectedSale.id}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSale(null);
                }}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Order Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{selectedSale.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(selectedSale.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSale.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : selectedSale.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedSale.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSale.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{selectedSale.paymentMethod || 'Cash'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedSale.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedSale.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedSale.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{selectedSale.deliveryAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="py-3 px-4">{item.productName}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">${item.price?.toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="4" className="py-3 px-4 text-center text-gray-500">No items found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${(selectedSale.totalAmount - (selectedSale.tax || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${(selectedSale.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">${(selectedSale.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-lg">${selectedSale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Profit:</span>
                  <span className={`font-semibold ${
                    (selectedSale.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${(selectedSale.profit || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSale(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Print Receipt
              </button>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="h-7 w-7 mr-3 text-blue-600" />
                Sales Management
              </h1>
              <p className="text-gray-600 mt-1">Track and analyze your sales performance</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sales List
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        {activeView === 'overview' && <SalesOverview />}
        {activeView === 'list' && <SalesList />}
        {activeView === 'analytics' && <SalesAnalytics />}
        
        {/* Sale Detail Modal */}
        {showModal && selectedSale && <SaleDetailModal />}
      </div>
    </div>
  );
};

export default ShopSales;
