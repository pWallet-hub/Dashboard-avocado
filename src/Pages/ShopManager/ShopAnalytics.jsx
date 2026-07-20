import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, Eye, AlertTriangle, Download, RefreshCw, Target } from 'lucide-react';
import { getSalesAnalytics, getProductAnalytics, getMonthlyOrderTrends } from '../../services/analyticsService';
import { getShopCustomers } from '../../services/marketStorageService';
import { getAllShops, getShopInventory } from '../../services/shopService';

const CATEGORY_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899'];

function colorForIndex(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function rangeToDates(timeRange) {
  const end = new Date();
  const days = { today: 1, '7days': 7, '30days': 30, '90days': 90 }[timeRange] || 7;
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { start_date: start.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0] };
}

const EMPTY_ANALYTICS = {
  dailySales: [],
  productCategories: [],
  topProducts: [],
  customerData: [],
  monthlyTrends: [],
  inventoryStatus: [],
  totals: { revenue: 0, orders: 0, averageOrderValue: 0 },
};

const ShopAnalyticsManagement = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shopNumber, setShopNumber] = useState(null);

  useEffect(() => {
    const resolveOwnShopNumber = async () => {
      try {
        const response = await getAllShops();
        const shops = response?.data || [];
        if (shops[0]) setShopNumber(shops[0].shop_number ?? shops[0].shopNumber);
      } catch (err) {
        console.error('Error resolving own shop number:', err);
      }
    };
    resolveOwnShopNumber();
  }, []);

  const loadAnalytics = useCallback(async () => {
    if (!shopNumber) return;
    setLoading(true);
    setError(null);
    try {
      const { start_date, end_date } = rangeToDates(timeRange);

      const [sales, products, monthly, inventoryResponse, customers] = await Promise.all([
        getSalesAnalytics({ start_date, end_date }),
        getProductAnalytics({ start_date, end_date }),
        getMonthlyOrderTrends(),
        getShopInventory(shopNumber),
        getShopCustomers(),
      ]);
      const inventory = inventoryResponse?.data || [];

      const dailySales = (sales?.trend || []).map(t => ({
        date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: t.revenue,
        orders: t.orders,
      }));

      const categoryMap = {};
      (products?.products || []).forEach(p => {
        if (!categoryMap[p.category]) categoryMap[p.category] = { name: p.category, sales: 0, orders: 0 };
        categoryMap[p.category].sales += p.revenue;
        categoryMap[p.category].orders += p.orders;
      });
      const productCategories = Object.values(categoryMap).map((c, i) => ({ ...c, color: colorForIndex(i) }));

      const topProducts = (products?.products || []).slice(0, 5).map(p => ({
        id: p.productId,
        name: p.productName,
        sales: p.revenue,
        units: p.quantitySold,
      }));

      const monthlyTrends = (monthly?.trends || []).map(t => ({
        month: t.period,
        revenue: t.revenue,
        orders: t.orders,
        avgOrderValue: t.averageOrderValue,
      }));

      const inventoryList = Array.isArray(inventory) ? inventory : [];
      const inventoryMap = {};
      inventoryList.forEach(item => {
        const key = item.category || 'Uncategorized';
        if (!inventoryMap[key]) inventoryMap[key] = { category: key, inStock: 0, lowStock: 0, outOfStock: 0, value: 0 };
        const minStock = item.min_stock || 0;
        if (item.quantity <= 0) inventoryMap[key].outOfStock += 1;
        else if (item.quantity <= minStock) inventoryMap[key].lowStock += 1;
        else inventoryMap[key].inStock += 1;
        inventoryMap[key].value += (item.price || 0) * (item.quantity || 0);
      });
      const inventoryStatus = Object.values(inventoryMap);

      const customersList = Array.isArray(customers) ? customers : [];
      const segmentMap = {};
      customersList.forEach(c => {
        const key = c.type || 'individual';
        if (!segmentMap[key]) segmentMap[key] = { segment: key === 'business' ? 'Business Customers' : 'Individual Customers', count: 0, revenue: 0 };
        segmentMap[key].count += 1;
        segmentMap[key].revenue += c.total_spent || 0;
      });
      const customerData = Object.values(segmentMap).map(s => ({ ...s, avgOrder: s.count > 0 ? Math.round(s.revenue / s.count) : 0 }));

      setAnalyticsData({
        dailySales,
        productCategories,
        topProducts,
        customerData,
        monthlyTrends,
        inventoryStatus,
        totals: sales?.totals || EMPTY_ANALYTICS.totals,
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics');
      setAnalyticsData(EMPTY_ANALYTICS);
    } finally {
      setLoading(false);
    }
  }, [timeRange, shopNumber]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const getKPIData = () => {
    const { revenue, orders, averageOrderValue } = analyticsData.totals;

    return [
      {
        title: 'Total Revenue',
        value: `${(revenue / 1000).toFixed(1)}K RWF`,
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: `Selected period`
      },
      {
        title: 'Total Orders',
        value: orders.toLocaleString(),
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Selected period'
      },
      {
        title: 'Total Customers',
        value: analyticsData.customerData.reduce((sum, s) => sum + s.count, 0).toLocaleString(),
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'All time'
      },
      {
        title: 'Avg Order Value',
        value: `${Math.round(averageOrderValue).toLocaleString()} RWF`,
        icon: Target,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        description: 'Per transaction'
      }
    ];
  };

  const getInventoryAlerts = () => {
    let lowStockItems = 0;
    let outOfStockItems = 0;

    analyticsData.inventoryStatus.forEach(category => {
      lowStockItems += category.lowStock;
      outOfStockItems += category.outOfStock;
    });

    return { lowStockItems, outOfStockItems };
  };

  const getTrendData = () => {
    return analyticsData.dailySales.map(day => ({ ...day, value: selectedMetric === 'orders' ? day.orders : day.revenue }));
  };

  const KPICard = ({ title, value, icon: Icon, color, bgColor, description }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-gray-500 text-xs mt-1">{description}</p>
      </div>
    </div>
  );

  const ProductCard = ({ product, rank }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
            {rank}
          </div>
          <h4 className="font-semibold text-gray-800">{product.name}</h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Sales</p>
          <p className="font-semibold">{(product.sales / 1000).toFixed(1)}K RWF</p>
        </div>
        <div>
          <p className="text-gray-500">Units</p>
          <p className="font-semibold">{product.units}</p>
        </div>
      </div>
    </div>
  );

  const InventoryAlert = ({ category, data }) => {
    const totalItems = data.inStock + data.lowStock + data.outOfStock;
    const alertLevel = data.outOfStock > 5 ? 'high' : data.lowStock > 20 ? 'medium' : 'low';

    return (
      <div className={`p-4 rounded-xl border-2 ${
        alertLevel === 'high' ? 'border-red-200 bg-red-50' :
        alertLevel === 'medium' ? 'border-yellow-200 bg-yellow-50' :
        'border-green-200 bg-green-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800">{category}</h4>
          <AlertTriangle className={`w-5 h-5 ${
            alertLevel === 'high' ? 'text-red-500' :
            alertLevel === 'medium' ? 'text-yellow-500' :
            'text-green-500'
          }`} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">In Stock: <span className="font-medium text-green-600">{data.inStock}</span></p>
            <p className="text-gray-600">Low Stock: <span className="font-medium text-yellow-600">{data.lowStock}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Out of Stock: <span className="font-medium text-red-600">{data.outOfStock}</span></p>
            <p className="text-gray-600">Value: <span className="font-medium">{(data.value / 1000).toFixed(0)}K RWF</span></p>
          </div>
        </div>
        <div className="mt-3 bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${totalItems > 0 ? (data.inStock / totalItems) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const alerts = getInventoryAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-green-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🥑 Avocado Farming Analytics
          </h1>
          <p className="text-gray-600 text-lg">
            Insights for avocado farming and market performance in Rwanda
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-400 p-4 rounded-lg flex justify-between items-center">
            <p className="text-rose-700">⚠️ {error}</p>
            <button onClick={loadAnalytics} className="underline text-rose-800 font-medium">Retry</button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>

              <div className="flex gap-2">
                {['overview', 'sales', 'stock', 'customers'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                      viewMode === mode
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {(alerts.lowStockItems > 0 || alerts.outOfStockItems > 0) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">
                <strong>Stock Alert:</strong> {alerts.outOfStockItems} items out of stock, {alerts.lowStockItems} items low in stock
              </p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getKPIData().map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {viewMode === 'overview' && (
          <>
            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Daily Sales Trend */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Sales Trends</h2>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="orders">Orders</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => selectedMetric === 'revenue' ? [`${(value / 1000).toFixed(1)}K RWF`, selectedMetric] : [value, selectedMetric]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      fill="url(#colorGradient)"
                      strokeWidth={3}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Sales by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.productCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="sales"
                    >
                      {analyticsData.productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${(value / 1000).toFixed(1)}K RWF`, 'Sales']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {analyticsData.productCategories.map((category, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-gray-600 truncate">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Comparison */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Category Performance</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.productCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => name === 'Sales (RWF)' ? [`${(value / 1000).toFixed(1)}K RWF`, name] : [value, name]}
                  />
                  <Bar yAxisId="left" dataKey="sales" fill="#10B981" name="Sales (RWF)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Top Products and Inventory Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Top Performing Products</h2>
            </div>
            <div className="space-y-4">
              {analyticsData.topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No sales in this period.</p>
              ) : analyticsData.topProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} rank={index + 1} />
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Eye className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Stock Status</h2>
            </div>
            <div className="space-y-4">
              {analyticsData.inventoryStatus.length === 0 ? (
                <p className="text-gray-500 text-sm">No inventory items found.</p>
              ) : analyticsData.inventoryStatus.map((item, index) => (
                <InventoryAlert key={index} category={item.category} data={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Buyer Segments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.customerData.length === 0 ? (
              <p className="text-gray-500 text-sm">No customers found.</p>
            ) : analyticsData.customerData.map((segment, index) => (
              <div key={index} className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{segment.segment}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buyers:</span>
                    <span className="font-semibold">{segment.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-semibold">{(segment.revenue / 1000).toFixed(1)}K RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Spend:</span>
                    <span className="font-semibold">{segment.avgOrder.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Performance Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyTrends.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 px-4 text-center text-gray-500">No order history yet.</td></tr>
                ) : analyticsData.monthlyTrends.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{month.month}</td>
                    <td className="py-3 px-4 text-right">{(month.revenue / 1000).toFixed(1)}K RWF</td>
                    <td className="py-3 px-4 text-right">{month.orders.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{Math.round(month.avgOrderValue).toLocaleString()} RWF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopAnalyticsManagement;
