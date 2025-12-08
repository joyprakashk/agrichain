// src/pages/OrderProcessingPage.jsx
import React, { useEffect, useState } from 'react';
import { Loader2, Package, Clock, CheckCircle } from 'lucide-react';

const OrderProcessingPage = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Order Received', icon: Package },
    { label: 'Processing Payment', icon: Clock },
    { label: 'Confirming with Farmer', icon: Clock },
    { label: 'Order Confirmed', icon: CheckCircle }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Redirect to order success page after processing
          setTimeout(() => {
            window.location.hash = '#/order-success';
          }, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepIndex = Math.floor(progress / 25);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [progress]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <Loader2 className="w-16 h-16 mx-auto text-green-600 animate-spin mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Processing Your Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your order...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-4">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress}% Complete
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isActive 
                        ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300' 
                        : 'bg-gray-200 dark:bg-gray-500 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`font-medium ${
                    isActive 
                      ? 'text-green-800 dark:text-green-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProcessingPage;