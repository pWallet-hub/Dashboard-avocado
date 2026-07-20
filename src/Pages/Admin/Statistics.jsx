import React, { useEffect, useState } from "react";
import { Users, Activity, ShoppingBag, DollarSign, UserPlus, Store, MapPin, UserCheck, Sprout } from "lucide-react";
import "../Styles/Statistics.css";
import { getDashboardStatistics, getRegionalAnalytics, getAgentAnalytics, getFarmerAnalytics } from '../../services/analyticsService';
import { useToast } from '../../components/Ui/Toast';

// Turn a camelCase / snake_case key into a readable label, e.g. "farm_size" -> "Farm Size"
function humanizeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format a raw value for display
function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (typeof value === 'object') return 'N/A';
  return String(value);
}

// The exact response shape of these three endpoints can vary, so pull out the first
// array we can find (rows) and the top-level scalar fields (summary metrics) generically.
function findArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data !== 'object') return [];
  const candidateKeys = ['data', 'items', 'results', 'regions', 'provinces', 'districts', 'agents', 'farmers', 'list', 'records', 'rows'];
  for (const key of candidateKeys) {
    if (Array.isArray(data[key])) return data[key];
  }
  const arrProp = Object.values(data).find((v) => Array.isArray(v));
  return arrProp || [];
}

function scalarEntries(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.entries(data).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object');
}

function SummaryCards({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {entries.map(([key, value]) => (
        <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-500">{humanizeKey(key)}</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{formatValue(value)}</p>
        </div>
      ))}
    </div>
  );
}

function DataTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="text-gray-500 text-sm">No data available.</p>;
  }
  const columns = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== 'object' || rows[0][k] === null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th key={col} className="text-left py-2 px-3 font-semibold text-gray-700 whitespace-nowrap">
                {humanizeKey(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? row._id ?? idx} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col} className="py-2 px-3 whitespace-nowrap">{formatValue(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsSection({ icon: Icon, title, loading, data }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <>
          <SummaryCards entries={scalarEntries(data)} />
          <DataTable rows={findArray(data)} />
        </>
      )}
    </div>
  );
}

export default function Statistics() {
  const [stats, setStats] = useState({
    users: { total: 0, recent: 0, byRole: { admin: 0, agent: 0, farmer: 0, shop_manager: 0 } },
    orders: { total: 0, recent: 0, revenue: { total: 0, last30Days: 0 } },
    products: { total: 0, inStock: 0, outOfStock: 0 },
    serviceRequests: { total: 0, byStatus: { pending: 0, assigned: 0, in_progress: 0, completed: 0, cancelled: 0, on_hold: 0 } },
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [regionalData, setRegionalData] = useState(null);
  const [regionalLoading, setRegionalLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [farmerData, setFarmerData] = useState(null);
  const [farmerLoading, setFarmerLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStatistics();
        setStats(data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchRegional = async () => {
      try {
        const data = await getRegionalAnalytics();
        setRegionalData(data);
      } catch (err) {
        console.error('Error fetching regional analytics:', err);
        toast.error(err.message || 'Failed to load regional analytics');
      } finally {
        setRegionalLoading(false);
      }
    };

    const fetchAgents = async () => {
      try {
        const data = await getAgentAnalytics();
        setAgentData(data);
      } catch (err) {
        console.error('Error fetching agent analytics:', err);
        toast.error(err.message || 'Failed to load agent analytics');
      } finally {
        setAgentLoading(false);
      }
    };

    const fetchFarmers = async () => {
      try {
        const data = await getFarmerAnalytics();
        setFarmerData(data);
      } catch (err) {
        console.error('Error fetching farmer analytics:', err);
        toast.error(err.message || 'Failed to load farmer analytics');
      } finally {
        setFarmerLoading(false);
      }
    };

    fetchRegional();
    fetchAgents();
    fetchFarmers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="statistics-container"><div className="loading">Loading statistics...</div></div>;
  }

  if (error) {
    return <div className="statistics-container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="statistics-container">
      <div className="statistics-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">System Usage Statistics</h1>
          <p className="header-subtitle">Overview of your system's performance</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Total Users */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p className="stat-label">Total Users</p>
                <p className="stat-value">{stats.users.total.toLocaleString()}</p>
              </div>
              <div className="stat-icon icon-blue">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend text-green">↑ 12%</span>
              <span className="stat-comparison">vs last month</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p className="stat-label">Active Users</p>
                <p className="stat-value">{stats.users.byRole.admin + stats.users.byRole.agent + stats.users.byRole.farmer + stats.users.byRole.shop_manager}</p>
              </div>
              <div className="stat-icon icon-green">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend text-green">↑ 8%</span>
              <span className="stat-comparison">vs last month</span>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p className="stat-label">Total Transactions</p>
                <p className="stat-value">{stats.orders.total.toLocaleString()}</p>
              </div>
              <div className="stat-icon icon-purple">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend text-green">↑ 4%</span>
              <span className="stat-comparison">vs last month</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">RWF      {stats.orders.revenue.total.toLocaleString()}</p>
              </div>
              <div className="stat-icon icon-yellow">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend text-red">↓ 2%</span>
              <span className="stat-comparison">vs last month</span>
            </div>
          </div>

          {/* New Users */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p className="stat-label">New Users</p>
                <p className="stat-value">{stats.users.recent.toLocaleString()}</p>
              </div>
              <div className="stat-icon icon-indigo">
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend text-green">↑ 15%</span>
              <span className="stat-comparison">vs last month</span>
            </div>
          </div>

          {/* Total Shops */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-info">
                <p className="stat-label">Total Shops</p>
                <p className="stat-value">{stats.users.byRole.shop_manager.toLocaleString()}</p>
              </div>
              <div className="stat-icon icon-pink">
                <Store className="w-6 h-6" />
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend text-green">↑ 6%</span>
              <span className="stat-comparison">vs last month</span>
            </div>
          </div>
        </div>

        {/* Regional Analytics */}
        <AnalyticsSection
          icon={MapPin}
          title="Regional Analytics"
          loading={regionalLoading}
          data={regionalData}
        />

        {/* Agent Performance Analytics */}
        <AnalyticsSection
          icon={UserCheck}
          title="Agent Performance"
          loading={agentLoading}
          data={agentData}
        />

        {/* Farmer Engagement Analytics */}
        <AnalyticsSection
          icon={Sprout}
          title="Farmer Engagement"
          loading={farmerLoading}
          data={farmerData}
        />
      </div>
    </div>
  );
}