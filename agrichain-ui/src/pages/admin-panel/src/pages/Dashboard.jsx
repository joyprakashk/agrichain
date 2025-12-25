import React from 'react';
import Card from '../components/Card';

/**
 * Dashboard Page
 * Main overview page showing key metrics and statistics
 * Displays: Total Farmers, Verified Batches, Fake Products Detected
 */
const Dashboard = () => {
  // Dummy data for dashboard statistics
  const stats = [
    {
      title: 'Total Farmers',
      value: '1,234',
      icon: '👨‍🌾',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Verified Batches',
      value: '8,567',
      icon: '✅',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Fake Products Detected',
      value: '42',
      icon: '⚠️',
      bgColor: 'bg-red-50'
    }
  ];

  // Recent activity dummy data
  const recentActivity = [
    { id: 1, action: 'New farmer registered', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, action: 'Batch verified', user: 'Farm #4523', time: '15 minutes ago' },
    { id: 3, action: 'Product flagged', user: 'System Alert', time: '1 hour ago' },
    { id: 4, action: 'New transaction', user: 'Distributor #89', time: '2 hours ago' },
    { id: 5, action: 'User updated profile', user: 'Jane Smith', time: '3 hours ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your agricultural supply chain system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blockchain Network</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Connection</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left">
              ➕ Add New User
            </button>
            <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left">
              📊 Generate Report
            </button>
            <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-left">
              🔍 Verify Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
