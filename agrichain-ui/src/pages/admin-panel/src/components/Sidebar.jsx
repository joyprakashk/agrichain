import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Sidebar Component
 * Fixed left sidebar with dark theme navigation
 * Contains main navigation links and logout button
 */
const Sidebar = () => {
  const location = useLocation();

  // Navigation links configuration
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/transactions', label: 'Transactions', icon: '💳' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/performance', label: 'Performance', icon: '⚡' },
  ];

  // Check if current path is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-green-400">🌾 AgriChain</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink
          to="dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <span className="text-xl">📊</span>
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="users"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <span className="text-xl">👥</span>
          <span className="font-medium">Users</span>
        </NavLink>
        <NavLink
          to="transactions"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <span className="text-xl">💳</span>
          <span className="font-medium">Transactions</span>
        </NavLink>
        <NavLink
          to="batches"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <span className="text-xl">🌾</span>
          <span className="font-medium">Batches</span>
        </NavLink>
        <NavLink
          to="analytics"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <span className="text-xl">📈</span>
          <span className="font-medium">Analytics</span>
        </NavLink>
        <NavLink
          to="performance"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <span className="text-xl">⚡</span>
          <span className="font-medium">Performance</span>
        </NavLink>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => alert('Logout functionality will be implemented')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-200"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
