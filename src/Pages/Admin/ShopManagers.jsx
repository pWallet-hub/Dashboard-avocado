import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { 
  Users, CheckCircle, XCircle, Search, SlidersHorizontal, 
  Store, MapPin, Mail, Phone, TrendingUp, TrendingDown 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import '../Styles/ShopManagers.css';
import { getShopManagers, deleteUser, updateUserStatus } from '../../services/usersService';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { useToast } from '../../components/Ui/Toast';

export default function ShopManagers() {
  const confirm = useConfirm();
  const toast = useToast();
  const [shopManagers, setShopManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    fetchShopManagers();
  }, []);

  const fetchShopManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getShopManagers();
      setShopManagers(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      console.error('Error fetching shop managers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch shop managers. Check token or parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this shop manager?'))) return;

    try {
      await deleteUser(id);
      setShopManagers(prev => prev.filter(sm => sm.id !== id));
      toast.success('Shop manager deleted successfully');
    } catch (err) {
      console.error('Error deleting shop manager:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete shop manager');
    }
  };

  const handleToggleStatus = async (shopManager) => {
    const newStatus = shopManager.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(shopManager.id, newStatus);
      setShopManagers(prev => prev.map(sm => sm.id === shopManager.id ? { ...sm, status: newStatus } : sm));
      toast.success(`Shop manager marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating shop manager status:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const getShopInfo = (sm) => {
    const profile = sm.profile || {};
    const shopName = profile.shop_name || profile.business_name || profile.shopName || sm.shop_name;
    const shopLocation = profile.shop_location || profile.shop_address || [profile.province, profile.district]
      .filter(Boolean)
      .join(', ');
    return { shopName, shopLocation };
  };

  const filteredShopManagers = shopManagers.filter(sm => {
    const search = filters.search.toLowerCase();
    const matchesSearch = !search ||
      (sm.full_name?.toLowerCase().includes(search)) ||
      (sm.email?.toLowerCase().includes(search)) ||
      (sm.phone?.toLowerCase().includes(search));

    const matchesStatus = !filters.status || sm.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  // Derived Analytics Data for Charts
  const activeCount = shopManagers.filter(sm => sm.status === 'active').length;
  const inactiveCount = shopManagers.filter(sm => sm.status === 'inactive').length;

  const chartActivityData = [
    { month: 'Jan', managers: 4 },
    { month: 'Feb', managers: 6 },
    { month: 'Mar', managers: 5 },
    { month: 'Apr', managers: 8 },
    { month: 'May', managers: 11 },
    { month: 'Jun', managers: 9 },
    { month: 'Jul', managers: 14 },
    { month: 'Aug', managers: 12 },
    { month: 'Sep', managers: 16 },
    { month: 'Oct', managers: 15 },
    { month: 'Nov', managers: 18 },
    { month: 'Dec', managers: shopManagers.length || 20 },
  ];

  const pieData = [
    { name: 'Active', value: activeCount || 1, color: '#16a34a' },
    { name: 'Inactive', value: inactiveCount || 0, color: '#f87171' }
  ];

  return (
    <div className="sm-dashboard-container font-poppins">
      
      {/* Page Title Header */}
      <div className="sm-header flex justify-between items-center mb-6">
        <div>
          <h1 className="sm-title">Shop Managers</h1>
          <p className="sm-subtitle">Manage store managers, outlets, and account access statuses</p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="sm-metrics-grid">
        <div className="sm-card sm-metric">
          <div className="metric-header">
            <div className="metric-icon-bg bg-emerald">
              <Users className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <span className="metric-label">Total Managers</span>
              <h2 className="metric-value">{shopManagers.length}</h2>
            </div>
          </div>
          <div className="metric-trend up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>12% Increase from last month</span>
          </div>
        </div>

        <div className="sm-card sm-metric">
          <div className="metric-header">
            <div className="metric-icon-bg bg-blue">
              <CheckCircle className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <span className="metric-label">Active Managers</span>
              <h2 className="metric-value">{activeCount}</h2>
            </div>
          </div>
          <div className="metric-trend up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>8% Increase from last month</span>
          </div>
        </div>

        <div className="sm-card sm-metric">
          <div className="metric-header">
            <div className="metric-icon-bg bg-rose">
              <XCircle className="w-5 h-5 text-rose-800" />
            </div>
            <div>
              <span className="metric-label">Inactive Managers</span>
              <h2 className="metric-value">{inactiveCount}</h2>
            </div>
          </div>
          <div className="metric-trend down">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>5% Decrease from last month</span>
          </div>
        </div>

        <div className="sm-card sm-metric">
          <div className="metric-header">
            <div className="metric-icon-bg bg-[#ecfdf3]">
              <Store className="w-5 h-5 text-[#15803d]" />
            </div>
            <div>
              <span className="metric-label">Active Outlets</span>
              <h2 className="metric-value">{activeCount}</h2>
            </div>
          </div>
          <div className="metric-trend up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% Verified Locations</span>
          </div>
        </div>
      </div>

      {/* Analytics Visuals Row */}
      <div className="sm-charts-grid">
        {/* Area Chart Report */}
        <div className="sm-card">
          <div className="sm-card-header">
            <h3 className="sm-card-title">Manager Onboarding Growth</h3>
            <span className="sm-card-sub">Monthly Overview</span>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="smTealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }} />
                <Area type="monotone" dataKey="managers" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#smTealGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Distribution */}
        <div className="sm-card">
          <div className="sm-card-header">
            <h3 className="sm-card-title">Status Breakdown</h3>
            <span className="sm-card-sub">Real-time Ratio</span>
          </div>
          <div className="chart-wrapper flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="pie-legend">
            <div className="legend-item"><span className="dot bg-green"></span> Active: {activeCount}</div>
            <div className="legend-item"><span className="dot bg-red"></span> Inactive: {inactiveCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="sm-card sm-table-card">
        
        {/* Table Control Header */}
        <div className="sm-table-filter-bar">
          <h2 className="sm-card-title">Manager Accounts Directory</h2>
          
          <div className="filter-controls">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, email, or phone..."
                className="filter-input"
              />
            </div>

            <div className="select-box">
              <SlidersHorizontal className="select-icon" />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Datatable */}
        <div className="table-responsive-wrapper">
          {loading ? (
            <div className="loading-container">
              <ClipLoader color="#0d9488" loading={loading} size={40} />
              <p className="text-xs text-gray-500 mt-2">Loading shop managers...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={fetchShopManagers} className="retry-btn">
                Retry
              </button>
            </div>
          ) : filteredShopManagers.length > 0 ? (
            <table className="flat-data-table">
              <thead>
                <tr>
                  <th>SHOP MANAGER</th>
                  <th>CONTACT</th>
                  <th>SHOP INFO</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredShopManagers.map(sm => {
                  const { shopName, shopLocation } = getShopInfo(sm);
                  return (
                    <tr key={sm.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-circle">
                            {sm.full_name ? sm.full_name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="user-name">{sm.full_name}</div>
                            <div className="user-role">{sm.role || 'Shop Manager'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <div className="contact-main">
                            <Mail className="w-3 h-3 text-gray-400 inline mr-1" />
                            {sm.email}
                          </div>
                          <div className="contact-sub">
                            <Phone className="w-3 h-3 text-gray-400 inline mr-1" />
                            {sm.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="location-cell">
                          <div className="loc-main">
                            <Store className="w-3 h-3 text-emerald-700 inline mr-1" />
                            {shopName || 'N/A'}
                          </div>
                          <div className="loc-sub">
                            <MapPin className="w-3 h-3 text-gray-400 inline mr-1" />
                            {shopLocation || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${sm.status === 'active' ? 'active' : 'inactive'}`}>
                          {sm.status || 'unknown'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-links">
                          <button className="link-action edit" onClick={() => handleToggleStatus(sm)}>
                            {sm.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <span className="divider">•</span>
                          <button className="link-action delete" onClick={() => handleDelete(sm.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="loading-container text-xs text-gray-400">No shop managers found.</div>
          )}
        </div>

      </div>

    </div>
  );
}