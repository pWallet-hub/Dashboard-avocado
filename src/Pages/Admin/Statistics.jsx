import React from "react";
import { Users, Activity, ShoppingBag, DollarSign, UserPlus, Store } from "lucide-react";
import "../Styles/Statistics.css";

export default function Statistics() {
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
                <p className="stat-value">1,482</p>
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
                <p className="stat-value">945</p>
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
                <p className="stat-value">2,834</p>
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
                <p className="stat-value">$23,472</p>
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
                <p className="stat-value">482</p>
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
                <p className="stat-value">142</p>
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