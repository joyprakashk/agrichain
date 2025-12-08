// src/components/FeatureCard.jsx
import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="p-8 bg-gray-50 rounded-2xl hover:shadow-sm transition-shadow duration-300">
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl bg-white">
          {/* Render the Lucide Icon component passed via props */}
          <Icon className="w-8 h-8" /> 
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;