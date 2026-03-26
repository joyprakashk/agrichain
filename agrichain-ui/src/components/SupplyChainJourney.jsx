import React from 'react';
import { CheckCircle, Clock, Truck, Package, Store, ShoppingCart, MapPin, Leaf } from 'lucide-react';

// Define the supply chain stages in order
const SUPPLY_CHAIN_STAGES = [
  { id: 'harvested', label: 'Harvested', icon: '🌾', actor: 'Farmer', color: 'bg-purple-100 text-purple-800' },
  { id: 'packaged', label: 'Packaged', icon: '📦', actor: 'Farmer', color: 'bg-blue-100 text-blue-800' },
  { id: 'inTransitToRetailer', label: 'In Transit to Retailer', icon: '🚚', actor: 'Logistics', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'receivedByRetailer', label: 'Received by Retailer', icon: '🏪', actor: 'Retailer', color: 'bg-orange-100 text-orange-800' },
  { id: 'storedInRetail', label: 'Stored in Retail', icon: '❄️', actor: 'Retailer', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'listedForSale', label: 'Listed for Sale', icon: '🏷️', actor: 'Retailer', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'purchased', label: 'Purchased', icon: '🛒', actor: 'Consumer', color: 'bg-green-100 text-green-800' },
  { id: 'delivered', label: 'Delivered', icon: '✅', actor: 'Consumer', color: 'bg-emerald-100 text-emerald-800' }
];

const SupplyChainJourney = ({ chain = [], currentStage = 'harvested' }) => {
  // Ensure chain is an array
  const safeChain = Array.isArray(chain) ? chain : [];
  
  // Get the current stage index
  const currentStageIndex = SUPPLY_CHAIN_STAGES.findIndex(s => s.id === currentStage);
  
  // Get the completed stages from the chain array
  const completedStageIds = safeChain.map(event => {
    // If event is an object with stage property
    if (typeof event === 'object' && event.stage) {
      return event.stage;
    }
    // If event is a string
    if (typeof event === 'string') {
      return event;
    }
    return null;
  }).filter(Boolean);
  
  // Function to check if a stage is completed
  const isStageCompleted = (stageId) => {
    return completedStageIds.includes(stageId);
  };
  
  // Function to get the timestamp for a stage if available
  const getStageTimestamp = (stageId) => {
    const event = safeChain.find(e => {
      if (typeof e === 'object' && e.stage === stageId) {
        return true;
      }
      if (typeof e === 'string' && e === stageId) {
        return true;
      }
      return false;
    });
    
    if (event && typeof event === 'object' && event.timestamp) {
      return new Date(event.timestamp).toLocaleString();
    }
    return null;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Truck className="w-5 h-5 text-green-600" />
        Supply Chain Journey
      </h3>
      
      <div className="relative">
        {SUPPLY_CHAIN_STAGES.map((stage, index) => {
          const isCompleted = isStageCompleted(stage.id);
          const isCurrent = stage.id === currentStage;
          const hasTimestamp = getStageTimestamp(stage.id);
          const isLast = index === SUPPLY_CHAIN_STAGES.length - 1;
          
          return (
            <div key={stage.id} className="relative flex items-start mb-6 last:mb-0">
              {/* Connector Line */}
              {!isLast && (
                <div className={`absolute left-4 top-8 w-0.5 h-12 ${
                  isCompleted || (isCurrent && index < currentStageIndex) 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`} />
              )}
              
              {/* Icon Circle */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white ring-4 ring-blue-200' 
                    : 'bg-gray-300 text-gray-500'
              }`}>
                <span className="text-sm">{stage.icon}</span>
              </div>
              
              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className={`font-semibold ${
                      isCompleted 
                        ? 'text-green-700' 
                        : isCurrent 
                          ? 'text-blue-700' 
                          : 'text-gray-500'
                    }`}>
                      {stage.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Actor: {stage.actor}
                    </p>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {isCurrent && !isCompleted && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-500">Current</span>
                    </div>
                  )}
                </div>
                {hasTimestamp && (
                  <p className="text-xs text-gray-400 mt-1">
                    {hasTimestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
            <span>Current Stage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainJourney;