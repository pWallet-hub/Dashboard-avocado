import React from 'react';

export default function Statistics() {
  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">System Usage Statistics</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold">Total Users</h2>
          <p className="text-gray-600">Placeholder for total users statistic</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold">Active Users</h2>
          <p className="text-gray-600">Placeholder for active users statistic</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold">Total Transactions</h2>
          <p className="text-gray-600">Placeholder for total transactions statistic</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold">Total Revenue</h2>
          <p className="text-gray-600">Placeholder for total revenue statistic</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold">New Users This Month</h2>
          <p className="text-gray-600">Placeholder for new users this month statistic</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <h2 className="mb-2 text-xl font-bold">Total Shops</h2>
          <p className="text-gray-600">Placeholder for total shops statistic</p>
        </div>
      </div>
    </div>
  );
}