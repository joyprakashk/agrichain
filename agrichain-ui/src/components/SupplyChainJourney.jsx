// src/components/SupplyChainJourney.jsx
import React from 'react';
import { Package } from 'lucide-react';

const SupplyChainJourney = ({ chain, farmer }) => {
  const steps = ["Farm", "Transport", "Market", "You"];
  const completedSteps = chain.filter(s => s.status === 'completed').length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Package className="w-6 h-6 mr-2" /> Supply Chain Journey
      </h3>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between relative mb-2">
          {steps.map((step, index) => (
            <div key={step} className={`text-sm font-semibold ${index <= completedSteps ? 'text-green-700' : 'text-gray-400'}`}>
              {step}
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(completedSteps / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm font-medium text-right mt-2 text-gray-700">Status: Delivered</p>
      </div>
      
      {/* Timeline Details */}
      <div className="space-y-6">
        {chain.map((item, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="p-2 bg-green-100 text-green-700 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              {index < chain.length - 1 && <div className="h-10 w-px bg-gray-300"></div>}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg text-gray-800">{item.step}</h4>
                <span className="text-xs font-medium text-white bg-green-500 px-2 py-0.5 rounded-full">
                  completed
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.details}</p>
              <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                <p>🌡️ {item.temp}</p>
                <p>💧 {item.humidity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Farmer Information Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Farmer Information</h3>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
            🧑🌾
          </div>
          <div>
            <p className="font-bold text-lg text-gray-800">{farmer?.name || 'Ramesh Kumar'}</p>
            <p className="text-sm text-gray-600">{farmer?.location || 'Bangalore Rural, Karnataka'}</p>
            <p className="text-xs font-medium text-green-600 flex items-center mt-1">
              🏅 Verified Organic Farmer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainJourney;