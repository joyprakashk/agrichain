import React from 'react';

/**
 * Navbar Component
 * Top navigation bar (search removed per requirements)
 */
const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Admin</h2>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Spacer to keep layout consistent */}
        <div className="flex-1 mx-8" />

        {/* User Profile Section */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <span className="text-2xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Admin User</p>
              <p className="text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
