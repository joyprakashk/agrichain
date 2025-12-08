// src/components/FarmerInfo.jsx
import React from 'react';
import { Leaf } from 'lucide-react';

const FarmerInfo = ({ farmer, storage, nutrition }) => (
  <div className="space-y-6">
    {/* Farmer Information */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Farmer Information</h3>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
          🧑🌾
        </div>
        <div>
          <p className="font-bold text-lg text-gray-800">{farmer.name}</p>
          <p className="text-sm text-gray-600">{farmer.location}</p>
          {farmer.verified && (
            <p className="text-xs font-medium text-green-600 flex items-center mt-1">
              <Leaf className="w-3 h-3 mr-1" /> Verified Organic Farmer
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Nutrition Information */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Information</h3>
      <div className="flex justify-around items-start text-center mb-6">
        <div className="p-2">
          <p className="text-3xl font-extrabold text-green-700">{nutrition?.calories || 18}</p>
          <p className="text-sm font-medium text-gray-600">Calories</p>
        </div>
        <div className="p-2">
          <p className="text-3xl font-extrabold text-green-700">{nutrition?.protein || '0.9g'}</p>
          <p className="text-sm font-medium text-gray-600">Protein</p>
        </div>
        <div className="p-2">
          <p className="text-3xl font-extrabold text-green-700">{nutrition?.carbs || '3.9g'}</p>
          <p className="text-sm font-medium text-gray-600">Carbs</p>
        </div>
        <div className="p-2">
          <p className="text-3xl font-extrabold text-green-700">{nutrition?.fiber || '1.2g'}</p>
          <p className="text-sm font-medium text-gray-600">Fiber</p>
        </div>
      </div>

      <h4 className="text-base font-semibold text-gray-700 mb-2">Rich in Vitamins:</h4>
      <div className="flex flex-wrap gap-2">
        {(nutrition?.richIn || ['Vitamin C', 'Vitamin K', 'Folate']).map((vitamin, index) => (
          <span 
            key={index}
            className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200"
          >
            {vitamin}
          </span>
        ))}
      </div>
    </div>

    {/* Storage Conditions */}
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Storage Conditions</h3>
      <p className="text-gray-700">
        Store at {storage.temperature}, {storage.humidity}
      </p>
    </div>
  </div>
);

export default FarmerInfo;