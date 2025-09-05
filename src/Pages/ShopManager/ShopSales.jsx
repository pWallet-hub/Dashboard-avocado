import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, ShoppingCart, Users, Calendar, 
  Search, Eye, Edit2, Plus, BarChart3, Download,
  ArrowUpRight, ArrowDownRight, Package, Clock, Star, Filter
} from 'lucide-react';
import MarketStorageService from '../../services/marketStorageService';

const ShopSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      MarketStorageService.syncAllFarmerData();
      const orders = MarketStorageService.getShopOrders() || [];
      const customers = MarketStorageService.getShopCustomers() || [];
      const inventory = MarketStorageService.getShopInventory() || [];
      const transactions = MarketStorageService.getMarketTransactions() || [];
      
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
      setError('Failed to load sales data. Please try again.');
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
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading sales data...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-8 text-rose-600">
          {error}
          <button
            onClick={loadSalesData}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md"
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              <input
                type="text"
                placeholder="Search by customer, order ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/90 shadow-sm"
              />
            </div>
            <button className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-800 px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filter
            </button>
          </div>
          <div className="overflow-x-auto border border-green-200 rounded-lg shadow-sm">
            <table className="w-full divide-y divide-green-100">
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Profit</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {filteredSales.map((sale, index) => (
                  <tr key={sale.id} className={`hover:bg-green-50 transition-colors duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                    <td className="py-3 px-4 font-medium text-green-600">#{sale.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{sale.customerName}</div>
                        <div className="text-sm text-gray-500">{sale.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{new Date(sale.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4"><span className="text-sm text-gray-600">{sale.items?.length || 0} items</span></td>
                    <td className="py-3 px-4 font-semibold">{sale.totalAmount.toLocaleString()} RWF</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${sale.profit >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                        {(sale.profit || 0).toLocaleString()} RWF
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        sale.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setSelectedSale(sale); setShowModal(true); }}
                          className="text-green-600 hover:text-green-800 transition-colors relative group"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            View Details
                          </span>
                        </button>
                        <button className="text-green-600 hover:text-green-800 transition-colors relative group">
                          <Edit2 className="h-4 w-4" />
                          <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            Edit Sale
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm">
              No sales found matching your criteria.
              <button
                onClick={() => setActiveView('overview')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md"
              >
                Back to Overview
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SalesAnalytics = () => {
    const metrics = getSalesMetrics();
    const filteredSales = getFilteredSales();
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
    const farmerSales = filteredSales.filter(sale => sale.sourceType === 'farmer_purchase');
    const farmerRevenue = farmerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const regularSales = filteredSales.filter(sale => sale.sourceType !== 'farmer_purchase');
    const regularRevenue = regularSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
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
    const monthlySales = [
      { month: 'Jan', revenue: 12500000, orders: 45 },
      { month: 'Feb', revenue: 15200000, orders: 52 },
      { month: 'Mar', revenue: 18900000, orders: 61 },
      { month: 'Apr', revenue: 16800000, orders: 58 },
      { month: 'May', revenue: 21300000, orders: 67 },
      { month: 'Jun', revenue: 19500000, orders: 63 }
    ];
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Farmer Market Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/90 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-2xl font-bold text-green-600 mb-2">{farmerSales.length}</div>
              <div className="text-sm text-gray-600">Farmer Purchases</div>
              <div className="text-xs text-gray-500">{farmerRevenue.toLocaleString()} RWF</div>
            </div>
            <div className="text-center p-4 bg-white/90 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-2xl font-bold text-indigo-600 mb-2">{regularSales.length}</div>
              <div className="text-sm text-gray-600">Regular Sales</div>
              <div className="text-xs text-gray-500">{regularRevenue.toLocaleString()} RWF</div>
            </div>
            <div className="text-center p-4 bg-white/90 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {farmerRevenue > 0 ? ((farmerRevenue / (farmerRevenue + regularRevenue)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-600">Farmer Revenue %</div>
            </div>
            <div className="text-center p-4 bg-white/90 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="text-2xl font-bold text-amber-600 mb-2">{topFarmerSuppliers.length}</div>
              <div className="text-sm text-gray-600">Active Farmers</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Sales Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold">{metrics.totalRevenue.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Profit</span>
                <span className="font-semibold text-green-600">{metrics.totalProfit.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-semibold">{metrics.profitMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Order Value</span>
                <span className="font-semibold">{metrics.avgOrderValue.toLocaleString()} RWF</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Top Farmer Suppliers</h3>
            <div className="space-y-3">
              {topFarmerSuppliers.length > 0 ? topFarmerSuppliers.map((farmer, index) => (
                <div key={farmer.name} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm">{farmer.name}</span>
                  </div>
                  <span className="font-semibold text-green-600">{farmer.revenue.toLocaleString()} RWF</span>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No farmer suppliers yet</p>
                  <p className="text-xs">Add products from farmer market to see suppliers</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-lime-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Sales Trends</h3>
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
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-green-800 mb-6">Monthly Sales Trend</h3>
          <div className="grid grid-cols-6 gap-4">
            {monthlySales.map((month, index) => (
              <div key={month.month} className="text-center">
                <div className="mb-2">
                  <div 
                    className="bg-gradient-to-t from-green-500 to-emerald-500 rounded-t mx-auto transition-all duration-300 hover:scale-105"
                    style={{ height: `${(month.revenue / 25000000) * 100}px`, width: '40px' }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-1">{(month.revenue / 1000000).toFixed(0)}M RWF</div>
                </div>
                <div className="text-sm font-medium text-gray-700">{month.month}</div>
                <div className="text-xs text-gray-500">{month.orders} orders</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-lime-50 to-amber-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-green-800 mb-6">Sales by Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['completed', 'pending', 'processing', 'cancelled'].map(status => {
              const statusSales = filteredSales.filter(sale => sale.status === status);
              const statusRevenue = statusSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
              return (
                <div key={status} className="text-center p-4 bg-white/90 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <div className={`text-2xl font-bold mb-2 ${
                    status === 'completed' ? 'text-green-600' :
                    status === 'pending' ? 'text-amber-600' :
                    status === 'processing' ? 'text-indigo-600' : 'text-rose-600'
                  }`}>
                    {statusSales.length}
                  </div>
                  <div className="text-sm text-gray-600 capitalize mb-1">{status}</div>
                  <div className="text-xs text-gray-500">{statusRevenue.toLocaleString()} RWF</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRevenue.toLocaleString()} RWF</p>
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
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-teal-500 mr-1" />
              <span className="text-sm text-teal-600 font-medium">+{metrics.ordersGrowth}%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-jade-50 to-teal-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-teal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgOrderValue.toLocaleString()} RWF</p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-teal-500 mr-1" />
              <span className="text-sm text-teal-600 font-medium">+5.2%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-sm text-emerald-600 font-medium">+2.1%</span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-green-800">Recent Sales</h3>
            <button 
              onClick={() => setActiveView('list')}
              className="text-green-600 hover:text-green-800 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto border border-green-200 rounded-lg shadow-sm">
            <table className="w-full divide-y divide-green-100">
              <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {getFilteredSales().slice(0, 5).map((sale, index) => (
                  <tr key={sale.id} className={`hover:bg-green-50 transition-colors duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                    <td className="py-3 px-4 font-medium text-green-600">#{sale.id}</td>
                    <td className="py-3 px-4">{sale.customerName}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(sale.orderDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold">{sale.totalAmount.toLocaleString()} RWF</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                        sale.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        sale.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {getFilteredSales().length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm">
              No recent sales available.
              <button
                onClick={() => setActiveView('list')}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md"
              >
                View Sales List
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SaleDetailModal = () => {
    if (!selectedSale) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-slideUp">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Sale Details - Order #{selectedSale.id}</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedSale(null); }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/90 p-4 rounded-lg transition-all duration-300 hover:shadow-lg">
                <h3 className="font-semibold text-green-800 mb-3">Order Information</h3>
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
                      selectedSale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedSale.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      selectedSale.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
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
              <div className="bg-white/90 p-4 rounded-lg transition-all duration-300 hover:shadow-lg">
                <h3 className="font-semibold text-green-800 mb-3">Customer Information</h3>
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
            <div>
              <h3 className="font-semibold text-green-800 mb-3">Order Items</h3>
              <div className="overflow-x-auto border border-green-200 rounded-lg shadow-sm">
                <table className="w-full divide-y divide-green-100">
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Unit Price</th>
                      <th className="text-left py-3 px-4 font-medium text-green-700 uppercase text-xs">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-100">
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-green-50 transition-colors duration-300">
                        <td className="py-3 px-4">{item.productName}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.price?.toLocaleString()} RWF</td>
                        <td className="py-3 px-4 font-semibold">{(item.quantity * item.price).toLocaleString()} RWF</td>
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
            <div className="bg-white/90 p-4 rounded-lg transition-all duration-300 hover:shadow-lg">
              <h3 className="font-semibold text-green-800 mb-3">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{(selectedSale.totalAmount - (selectedSale.tax || 0)).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{(selectedSale.tax || 0).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">{(selectedSale.deliveryFee || 0).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-800">Total Amount:</span>
                  <span className="font-bold text-lg">{selectedSale.totalAmount.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Profit:</span>
                  <span className={`font-semibold ${selectedSale.profit >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                    {(selectedSale.profit || 0).toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => { setShowModal(false); setSelectedSale(null); }}
                className="px-6 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all duration-300 shadow-sm"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg">
                Print Receipt
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-cyan-50">
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-green-800 flex items-center">
                <BarChart3 className="h-7 w-7 mr-3 text-green-600" />
                Sales Management
              </h1>
              <p className="text-gray-600 mt-1">Track and analyze your avocado sales performance in Rwanda</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/90 shadow-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          <div className="flex space-x-1 mt-6 bg-gradient-to-r from-green-100 to-emerald-100 p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeView === 'overview' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeView === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sales List
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeView === 'analytics' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
        {activeView === 'overview' && <SalesOverview />}
        {activeView === 'list' && <SalesList />}
        {activeView === 'analytics' && <SalesAnalytics />}
        {showModal && selectedSale && <SaleDetailModal />}
      </div>
    </div>
  );
};

export default ShopSales;