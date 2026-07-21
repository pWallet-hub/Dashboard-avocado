import React, { useEffect, useState } from "react";
import { 
  Users, Activity, ShoppingBag, DollarSign, UserPlus, Store, 
  MapPin, UserCheck, Sprout, SlidersHorizontal, Plus, ChevronUp, 
  TrendingUp, TrendingDown, Layers, CheckCircle2 
} from "lucide-react";
import "../Styles/Statistics.css";
import { getDashboardStatistics, getRegionalAnalytics, getAgentAnalytics, getFarmerAnalytics } from '../../services/analyticsService';
import { useToast } from '../../components/Ui/Toast';

// Helper functions (Unchanged)
function humanizeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

// Redesigned Summary Widget Bar
function SummaryCards({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <div className="widget-summary-grid">
      {entries.map(([key, value]) => (
        <div key={key} className="summary-data-item">
          <div className="summary-data-header">
            <span className="summary-data-label">{humanizeKey(key)}</span>
          </div>
          <p className="summary-data-value">{formatValue(value)}</p>
        </div>
      ))}
    </div>
  );
}

// Redesigned Data Table matching reference "Activity Monitor"
function DataTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="widget-empty-txt">No data records available.</p>;
  }
  const columns = Object.keys(rows[0]).filter((k) => typeof rows[0][k] !== 'object' || rows[0][k] === null);
  
  return (
    <div className="widget-table-wrapper">
      <table className="widget-monitor-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>
                {humanizeKey(col)}
              </th>
            ))}
            <th className="text-right">TREND</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? row._id ?? idx}>
              {columns.map((col, cIdx) => (
                <td key={col} className={cIdx === 0 ? "font-semibold text-gray-800" : ""}>
                  {formatValue(row[col])}
                </td>
              ))}
              <td className="text-right">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 inline-block" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Redesigned Analytics Container matching "System Usage" Card Panels
function AnalyticsSection({ icon: Icon, title, loading, data }) {
  return (
    <div className="stat-card-widget">
      <div className="widget-card-header">
        <div className="widget-title-group">
          <Icon className="w-4 h-4 text-cyan-600" />
          <h3>{title}</h3>
        </div>
        <div className="widget-controls">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
          <Plus className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
        </div>
      </div>

      <div className="widget-card-body">
        {loading ? (
          <div className="widget-loading-state">
            <div className="widget-spinner"></div>
            <span>Fetching telemetry data...</span>
          </div>
        ) : (
          <>
            <SummaryCards entries={scalarEntries(data)} />
            <DataTable rows={findArray(data)} />
          </>
        )}
      </div>
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
        setStats(data || {});
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
  }, []);

  if (loading) {
    return (
      <div className="stats-dashboard-root font-poppins">
        <div className="widget-loading-state">
          <div className="widget-spinner"></div>
          <span>Initializing system metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-dashboard-root font-poppins">
        <div className="stats-error-banner">{error}</div>
      </div>
    );
  }

  const activeUsersCount = (stats.users?.byRole?.admin || 0) + 
                           (stats.users?.byRole?.agent || 0) + 
                           (stats.users?.byRole?.farmer || 0) + 
                           (stats.users?.byRole?.shop_manager || 0);

  return (
    <div className="stats-dashboard-root font-poppins">
      <div className="stats-wrapper">
        
        {/* Top Control Bar Header */}
        <header className="stats-page-header">
          <div>
            <h1 className="stats-page-title">System Usage Statistics</h1>
            <p className="stats-page-sub">Telemetry readout & real-time operational monitor</p>
          </div>
          <div className="header-actions">
            <button className="pill-control-btn">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Configure Widgets</span>
            </button>
          </div>
        </header>

        {/* Top Horizontal Hardware Monitor Style Layout */}
        <div className="top-widgets-grid">
          
          {/* Card 1: Users Monitor */}
          <div className="stat-card-widget">
            <div className="widget-card-header">
              <div className="widget-title-group">
                <span>USERS MONITOR</span>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="widget-metric-hero">
              <div className="hero-num-group">
                <h2 className="hero-value text-cyan-600">{stats.users?.total?.toLocaleString() || 0}</h2>
                <div className="hero-trend up">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>12%</span>
                </div>
              </div>
            </div>

            <div className="widget-progress-stack">
              <div className="progress-item">
                <div className="progress-labels">
                  <span>Admins</span>
                  <span className="font-bold">{stats.users?.byRole?.admin || 0}</span>
                </div>
                <div className="progress-bar-bg"><div className="bar-fill bg-cyan" style={{ width: '25%' }}></div></div>
              </div>

              <div className="progress-item">
                <div className="progress-labels">
                  <span>Farmers</span>
                  <span className="font-bold">{stats.users?.byRole?.farmer || 0}</span>
                </div>
                <div className="progress-bar-bg"><div className="bar-fill bg-emerald" style={{ width: '65%' }}></div></div>
              </div>

              <div className="progress-item">
                <div className="progress-labels">
                  <span>Agents</span>
                  <span className="font-bold">{stats.users?.byRole?.agent || 0}</span>
                </div>
                <div className="progress-bar-bg"><div className="bar-fill bg-amber" style={{ width: '40%' }}></div></div>
              </div>
            </div>
          </div>

          {/* Card 2: Activity & Users Usage */}
          <div className="stat-card-widget">
            <div className="widget-card-header">
              <div className="widget-title-group">
                <span>ACTIVE USERS</span>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            <div className="widget-spec-grid">
              <div className="spec-row">
                <span className="spec-label">ACTIVE ACCOUNT TOTAL</span>
                <span className="spec-value">{activeUsersCount}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">NEWLY REGISTERED</span>
                <span className="spec-value">{stats.users?.recent || 0}</span>
              </div>
            </div>

            <div className="widget-metric-hero mt-2">
              <div className="hero-num-group">
                <h2 className="hero-value text-emerald-600">{activeUsersCount}</h2>
                <div className="hero-trend up">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>8%</span>
                </div>
              </div>
              <p className="hero-sub-lbl">Active Users Session Rate</p>
            </div>
          </div>

          {/* Card 3: Revenue & Orders Allocation */}
          <div className="stat-card-widget">
            <div className="widget-card-header">
              <div className="widget-title-group">
                <span>TRANSACTIONS</span>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            <div className="widget-spec-grid">
              <div className="spec-row">
                <span className="spec-label">TOTAL TRANSACTIONS</span>
                <span className="spec-value">{stats.orders?.total?.toLocaleString() || 0}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">30-DAY REVENUE</span>
                <span className="spec-value">RWF {stats.orders?.revenue?.last30Days?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="widget-metric-hero mt-2">
              <div className="hero-num-group">
                <h2 className="hero-value text-rose-600">
                  RWF {stats.orders?.revenue?.total?.toLocaleString() || 0}
                </h2>
                <div className="hero-trend down">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>2%</span>
                </div>
              </div>
              <p className="hero-sub-lbl">Gross System Turnover</p>
            </div>
          </div>

          {/* Card 4: Ecosystem & Shops */}
          <div className="stat-card-widget">
            <div className="widget-card-header">
              <div className="widget-title-group">
                <span>ECOSYSTEM NETWORK</span>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            <div className="widget-progress-stack mt-1">
              <div className="progress-item">
                <div className="progress-labels">
                  <span>Registered Outlets</span>
                  <span className="font-bold">{stats.users?.byRole?.shop_manager || 0}</span>
                </div>
                <div className="progress-bar-bg"><div className="bar-fill bg-purple" style={{ width: '80%' }}></div></div>
              </div>

              <div className="progress-item">
                <div className="progress-labels">
                  <span>Catalog Products</span>
                  <span className="font-bold">{stats.products?.total || 0}</span>
                </div>
                <div className="progress-bar-bg"><div className="bar-fill bg-blue" style={{ width: '55%' }}></div></div>
              </div>

              <div className="progress-item">
                <div className="progress-labels">
                  <span>Service Requests</span>
                  <span className="font-bold">{stats.serviceRequests?.total || 0}</span>
                </div>
                <div className="progress-bar-bg"><div className="bar-fill bg-emerald" style={{ width: '90%' }}></div></div>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Analytics Grid Sections */}
        <div className="analytics-sections-grid">
          {/* Regional Analytics */}
          <AnalyticsSection
            icon={MapPin}
            title="Regional Territory Analytics"
            loading={regionalLoading}
            data={regionalData}
          />

          {/* Agent Performance Analytics */}
          <AnalyticsSection
            icon={UserCheck}
            title="Field Agent Operational Performance"
            loading={agentLoading}
            data={agentData}
          />

          {/* Farmer Engagement Analytics */}
          <AnalyticsSection
            icon={Sprout}
            title="Farmer Engagement & Orchard Telemetry"
            loading={farmerLoading}
            data={farmerData}
          />
        </div>

      </div>
    </div>
  );
}