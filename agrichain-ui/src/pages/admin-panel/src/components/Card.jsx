import React from 'react';

/**
 * Reusable Card Component
 * Used for displaying statistics and information boxes
 * @param {string} title - Card title
 * @param {string} value - Main value to display
 * @param {string} icon - Emoji icon
 * @param {string} bgColor - Background color class
 */
const Card = ({ title, value, icon, bgColor = 'bg-white' }) => {
  return (
    <div className={`${bgColor} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
        </div>
        <div className="text-5xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Card;
