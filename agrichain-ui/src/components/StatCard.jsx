// src/components/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, number, label }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-cyan-50 mb-6">
        {/* Render the Lucide Icon component passed via props */}
        <Icon className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{number}</h3>
      <p className="text-base text-gray-500">{label}</p>
    </div>
  );
};

export default StatCard;