import React from 'react';

/**
 * Analytics Page
 * Placeholder page for future analytics and charts
 * Will display data visualizations and insights
 */
const Analytics = () => {
  // Dummy analytics data
  const analyticsData = [
    { category: 'Product Quality', score: 92, trend: 'up' },
    { category: 'Supply Chain Efficiency', score: 85, trend: 'up' },
    { category: 'Fraud Detection Rate', score: 98, trend: 'stable' },
    { category: 'User Satisfaction', score: 88, trend: 'down' },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Advanced insights and data visualization for your supply chain
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((data, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase">
                {data.category}
              </h3>
              <span className={`text-2xl ${getTrendColor(data.trend)}`}>
                {getTrendIcon(data.trend)}
              </span>
            </div>
            <div className="flex items-baseline">
              <p className="text-4xl font-bold text-gray-900">{data.score}</p>
              <p className="ml-2 text-sm text-gray-600">/ 100</p>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Monthly Transaction Volume
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4">📊</p>
              <p className="text-lg font-medium text-gray-700">
                Line Chart Placeholder
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Future implementation: React Chart.js or Recharts
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Products by Category
          </h2>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-12 flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4">📈</p>
              <p className="text-lg font-medium text-gray-700">
                Bar Chart Placeholder
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Future implementation: Product distribution analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Geographic Distribution
        </h2>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🗺️</p>
            <p className="text-lg font-medium text-gray-700">
              Map Visualization Placeholder
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Future implementation: Interactive map showing farm locations, distribution centers, and retail points
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-gray-900">Peak Transaction Hours</h3>
              <p className="text-sm text-gray-600 mt-1">
                Most transactions occur between 9 AM - 3 PM, with peak activity at 11 AM
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Verification Success Rate</h3>
              <p className="text-sm text-gray-600 mt-1">
                98% of product verifications are completed successfully within 24 hours
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-semibold text-gray-900">System Performance</h3>
              <p className="text-sm text-gray-600 mt-1">
                Average blockchain confirmation time: 2.3 seconds | Network uptime: 99.9%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
