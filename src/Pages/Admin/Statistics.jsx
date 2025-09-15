import React, { useEffect, useState } from "react";
import { Users, Activity, ShoppingBag, DollarSign, UserPlus, Store } from "lucide-react";
import "../Styles/Statistics.css";
import { getDashboardStatistics } from '../../services/analyticsService';

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
                <p className="stat-value">${stats.orders.revenue.total.toLocaleString()}</p>
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
      </div>
    </div>
  );
}