import { Users, Activity, ShoppingBag, DollarSign, UserPlus, Store } from "lucide-react";

export default function Statistics() {
  return (
    <div className="p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Usage Statistics</h1>
          <p className="mt-2 text-gray-600">Overview of your system's performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Users */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">1,482</p>
              </div>
              <div className="p-3 transition-colors rounded-lg bg-blue-50 group-hover:bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <span className="font-medium">↑ 12%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">945</p>
              </div>
              <div className="p-3 transition-colors rounded-lg bg-green-50 group-hover:bg-green-100">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <span className="font-medium">↑ 8%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">2,834</p>
              </div>
              <div className="p-3 transition-colors rounded-lg bg-purple-50 group-hover:bg-purple-100">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <span className="font-medium">↑ 4%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">$23,472</p>
              </div>
              <div className="p-3 transition-colors rounded-lg bg-yellow-50 group-hover:bg-yellow-100">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-red-600">
              <span className="font-medium">↓ 2%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>

          {/* New Users */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Users</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">482</p>
              </div>
              <div className="p-3 transition-colors rounded-lg bg-indigo-50 group-hover:bg-indigo-100">
                <UserPlus className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <span className="font-medium">↑ 15%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>

          {/* Total Shops */}
          <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Shops</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">142</p>
              </div>
              <div className="p-3 transition-colors rounded-lg bg-pink-50 group-hover:bg-pink-100">
                <Store className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-green-600">
              <span className="font-medium">↑ 6%</span>
              <span className="ml-2 text-gray-500">vs last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}