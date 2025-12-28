import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../firebaseConfig';

/**
 * Performance Page
 * Displays supply chain performance metrics
 * Shows: Average delivery time, Active batches, Verification percentage
 */
const Performance = () => {
  const [totalProduce, setTotalProduce] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [metrics, setMetrics] = useState([]);
  const [performanceIndicators, setPerformanceIndicators] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, 'produce'), (snap) => {
      console.log('[Performance] produce snapshot size:', snap.size);
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
      const total = docs.length;
      // verification based on traceId presence
      const verified = docs.filter(p => !!p.traceId).length;
      setTotalProduce(total);
      setVerifiedCount(verified);

      const verificationRate = total > 0 ? `${((verified / total) * 100).toFixed(1)}%` : '0%';

      setMetrics([
        { title: 'Average Delivery Time', value: 'N/A', icon: '🚚', bgColor: 'bg-blue-50', change: '-%', changeType: 'positive' },
        { title: 'Active Batches', value: total.toString(), icon: '📦', bgColor: 'bg-green-50', change: '+0%', changeType: 'positive' },
        { title: 'Verification Rate', value: verificationRate, icon: '✅', bgColor: 'bg-purple-50', change: '+0%', changeType: 'positive' },
        { title: 'Customer Satisfaction', value: 'N/A', icon: '⭐', bgColor: 'bg-yellow-50', change: '+0', changeType: 'positive' }
      ]);

      setPerformanceIndicators([
        { label: 'On-Time Delivery Rate', value: 90, target: 95, status: 'good' },
        { label: 'Product Quality Score', value: Math.min(100, Math.round((verified / Math.max(1, total)) * 100)), target: 90, status: 'excellent' },
        { label: 'Supply Chain Efficiency', value: 88, target: 85, status: 'excellent' },
        { label: 'Customer Return Rate', value: 3, target: 5, status: 'excellent', inverse: true },
        { label: 'Fraud Detection Rate', value: 98, target: 95, status: 'excellent' },
        { label: 'Network Uptime', value: 99.9, target: 99, status: 'excellent' }
      ]);
    });

    return () => unsub();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance Metrics</h1>
        <p className="text-gray-600 mt-2">
          Monitor and analyze supply chain performance indicators
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className={`${metric.bgColor} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 uppercase">
                {metric.title}
              </p>
              <span className="text-3xl">{metric.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metric.value}
            </p>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-600 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Indicators */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Key Performance Indicators (KPIs)
        </h2>
        <div className="space-y-6">
          {performanceIndicators.map((indicator, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">
                    {indicator.label}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Target: {indicator.value}%
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {indicator.value}%
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(indicator.status)}`}>
                    {indicator.status.charAt(0).toUpperCase() + indicator.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(indicator.status)}`}
                    style={{ width: `${Math.min(indicator.value, 100)}%` }}
                  ></div>
                </div>
                {/* Target marker */}
                <div
                  className="absolute top-0 h-3 w-1 bg-gray-700"
                  style={{ left: `${indicator.target}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply Chain Stages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Supply Chain Stages Performance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="font-medium text-gray-900">Production</p>
                  <p className="text-sm text-gray-600">Farm to Collection</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">Excellent</p>
                <p className="text-xs text-gray-600">Avg: 1.2 days</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="font-medium text-gray-900">Distribution</p>
                  <p className="text-sm text-gray-600">Processing to Retail</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">Good</p>
                <p className="text-xs text-gray-600">Avg: 1.5 days</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏪</span>
                <div>
                  <p className="font-medium text-gray-900">Retail</p>
                  <p className="text-sm text-gray-600">Store to Consumer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">Excellent</p>
                <p className="text-xs text-gray-600">Avg: 0.5 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Blockchain Network</p>
                  <p className="text-sm text-gray-600 mt-1">All nodes operational</p>
                </div>
                <span className="text-2xl">✅</span>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Database Performance</p>
                  <p className="text-sm text-gray-600 mt-1">Response time: 45ms</p>
                </div>
                <span className="text-2xl">⚡</span>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">API Health</p>
                  <p className="text-sm text-gray-600 mt-1">All endpoints responsive</p>
                </div>
                <span className="text-2xl">🚀</span>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Storage Usage</p>
                  <p className="text-sm text-gray-600 mt-1">68% of capacity used</p>
                </div>
                <span className="text-2xl">💾</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
