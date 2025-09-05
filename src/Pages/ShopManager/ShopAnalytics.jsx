import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Eye, Calendar, MapPin, Star, AlertTriangle, Download, Filter, RefreshCw, Target } from 'lucide-react';

const ShopAnalyticsManagement = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [viewMode, setViewMode] = useState('overview');

  const [analyticsData] = useState({
    dailySales: [
      { date: 'Mon', revenue: 125000, orders: 45, farmers: 38, items: 156 },
      { date: 'Tue', revenue: 152000, orders: 52, farmers: 44, items: 189 },
      { date: 'Wed', revenue: 118000, orders: 41, farmers: 35, items: 142 },
      { date: 'Thu', revenue: 186000, orders: 63, farmers: 57, items: 228 },
      { date: 'Fri', revenue: 224000, orders: 78, farmers: 68, items: 287 },
      { date: 'Sat', revenue: 289000, orders: 95, farmers: 82, items: 358 },
      { date: 'Sun', revenue: 217000, orders: 71, farmers: 61, items: 245 }
    ],
    
    productCategories: [
      { name: 'Avocado Fruits', sales: 890000, orders: 234, profit: 225000, color: '#10B981' },
      { name: 'Avocado Seedlings', sales: 670000, orders: 445, profit: 201000, color: '#3B82F6' },
      { name: 'Organic Fertilizers', sales: 450000, orders: 189, profit: 135000, color: '#F59E0B' },
      { name: 'Farming Tools', sales: 230000, orders: 156, profit: 69000, color: '#EF4444' },
      { name: 'Packaging Materials', sales: 340000, orders: 123, profit: 102000, color: '#8B5CF6' },
      { name: 'Avocado Oil Products', sales: 560000, orders: 278, profit: 168000, color: '#F97316' }
    ],

    topProducts: [
      { id: 1, name: 'Hass Avocado', sales: 156000, units: 78, profit: 46800, trend: 'up', rating: 4.8 },
      { id: 2, name: 'Fuerte Avocado', sales: 245000, units: 49, profit: 73500, trend: 'up', rating: 4.6 },
      { id: 3, name: 'Organic Compost', sales: 182000, units: 91, profit: 54600, trend: 'down', rating: 4.7 },
      { id: 4, name: 'Pruning Shears', sales: 128000, units: 32, profit: 38400, trend: 'up', rating: 4.5 },
      { id: 5, name: 'Avocado Seedlings', sales: 89000, units: 89, profit: 26700, trend: 'up', rating: 4.9 }
    ],

    customerData: [
      { segment: 'Local Farmers', count: 234, revenue: 456000, avgOrder: 1950 },
      { segment: 'Kigali Markets', count: 456, revenue: 1234000, avgOrder: 2700 },
      { segment: 'Cooperatives', count: 89, revenue: 678000, avgOrder: 7600 }
    ],

    monthlyTrends: [
      { month: 'Jan', revenue: 2340000, orders: 1240, farmers: 890, conversion: 3.2 },
      { month: 'Feb', revenue: 2670000, orders: 1380, farmers: 980, conversion: 3.5 },
      { month: 'Mar', revenue: 2980000, orders: 1520, farmers: 1120, conversion: 3.8 },
      { month: 'Apr', revenue: 2760000, orders: 1450, farmers: 1050, conversion: 3.6 },
      { month: 'May', revenue: 3120000, orders: 1680, farmers: 1240, conversion: 4.1 },
      { month: 'Jun', revenue: 3450000, orders: 1820, farmers: 1380, conversion: 4.3 }
    ],

    inventoryStatus: [
      { category: 'Avocado Fruits', inStock: 245, lowStock: 23, outOfStock: 8, value: 1560000 },
      { category: 'Avocado Seedlings', inStock: 567, lowStock: 45, outOfStock: 12, value: 890000 },
      { category: 'Organic Fertilizers', inStock: 189, lowStock: 18, outOfStock: 5, value: 670000 },
      { category: 'Farming Tools', inStock: 345, lowStock: 12, outOfStock: 3, value: 230000 },
      { category: 'Packaging Materials', inStock: 123, lowStock: 15, outOfStock: 7, value: 450000 },
      { category: 'Avocado Oil Products', inStock: 234, lowStock: 28, outOfStock: 9, value: 780000 }
    ]
  });

  const getKPIData = () => {
    const totalRevenue = analyticsData.dailySales.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = analyticsData.dailySales.reduce((sum, day) => sum + day.orders, 0);
    const totalFarmers = analyticsData.dailySales.reduce((sum, day) => sum + day.farmers, 0);
    const avgOrderValue = totalRevenue / totalOrders;

    return [
      {
        title: 'Total Revenue',
        value: `${(totalRevenue / 1000).toFixed(1)}K RWF`,
        change: '+12.5%',
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Last 7 days'
      },
      {
        title: 'Total Orders',
        value: totalOrders.toLocaleString(),
        change: '+8.3%',
        trend: 'up',
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Last 7 days'
      },
      {
        title: 'Farmer Count',
        value: totalFarmers.toLocaleString(),
        change: '+15.7%',
        trend: 'up',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        description: 'Unique farmers'
      },
      {
        title: 'Avg Order Value',
        value: `${avgOrderValue.toFixed(0)} RWF`,
        change: '+4.2%',
        trend: 'up',
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
    switch (selectedMetric) {
      case 'revenue':
        return analyticsData.dailySales.map(day => ({ ...day, value: day.revenue }));
      case 'orders':
        return analyticsData.dailySales.map(day => ({ ...day, value: day.orders }));
      case 'farmers':
        return analyticsData.dailySales.map(day => ({ ...day, value: day.farmers }));
      default:
        return analyticsData.dailySales.map(day => ({ ...day, value: day.revenue }));
    }
  };

  const KPICard = ({ title, value, change, trend, icon: Icon, color, bgColor, description }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
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
          <div>
            <h4 className="font-semibold text-gray-800">{product.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          </div>
        </div>
        <div className={`p-1 rounded ${
          product.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {product.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Sales</p>
          <p className="font-semibold">{(product.sales / 1000).toFixed(1)}K RWF</p>
        </div>
        <div>
          <p className="text-gray-500">Units</p>
          <p className="font-semibold">{product.units}</p>
        </div>
        <div>
          <p className="text-gray-500">Profit</p>
          <p className="font-semibold">{(product.profit / 1000).toFixed(1)}K RWF</p>
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
            style={{ width: `${(data.inStock / totalItems) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const alerts = getInventoryAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-100 p-6">
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
              
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="avocado_fruits">Avocado Fruits</option>
                <option value="seedlings">Avocado Seedlings</option>
                <option value="fertilizers">Organic Fertilizers</option>
                <option value="tools">Farming Tools</option>
                <option value="packaging">Packaging Materials</option>
                <option value="oil_products">Avocado Oil Products</option>
              </select>

              <div className="flex gap-2">
                {['overview', 'sales', 'stock', 'farmers'].map(mode => (
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
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
                    <option value="farmers">Farmers</option>
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
                    formatter={(value, name) => name === 'Sales' ? [`${(value / 1000).toFixed(1)}K RWF`, name] : [value, name]}
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
              {analyticsData.topProducts.map((product, index) => (
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
              {analyticsData.inventoryStatus.map((item, index) => (
                <InventoryAlert key={index} category={item.category} data={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Buyer Segments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsData.customerData.map((segment, index) => (
              <div key={index} className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{segment.segment}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buyers:</span>
                    <span className="font-semibold">{segment.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-semibold">{(segment.revenue / 1000).toFixed(1)}K RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Order:</span>
                    <span className="font-semibold">{segment.avgOrder} RWF</span>
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
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Farmers</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyTrends.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{month.month}</td>
                    <td className="py-3 px-4 text-right">{(month.revenue / 1000).toFixed(1)}K RWF</td>
                    <td className="py-3 px-4 text-right">{month.orders.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{month.farmers.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{month.conversion}%</td>
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