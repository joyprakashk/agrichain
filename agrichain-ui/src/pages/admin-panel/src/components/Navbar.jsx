import React, { useState, useEffect } from 'react';

/**
 * Navbar Component
 * Top navigation bar with working notification bell for admin actions
 */
const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Listen for admin actions from other components
  useEffect(() => {
    const handleNotification = (event) => {
      const notification = {
        id: Date.now(),
        message: event.detail.message,
        timestamp: new Date().toLocaleTimeString()
      };
      setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep last 5
    };

    window.addEventListener('admin-notification', handleNotification);
    return () => window.removeEventListener('admin-notification', handleNotification);
  }, []);

  // Trigger notification when admin action completes
  const triggerNotification = (message) => {
    const event = new CustomEvent('admin-notification', { detail: { message } });
    window.dispatchEvent(event);
  };

  // Expose globally for admin pages
  useEffect(() => {
    window.adminNotify = triggerNotification;
  }, []);

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
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <span className="text-2xl">🔔</span>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-bold text-gray-800">Recent Actions</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <p className="text-sm text-gray-700">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
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
