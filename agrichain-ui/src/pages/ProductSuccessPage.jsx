// src/pages/ProductSuccessPage.jsx
import React from 'react';
import { CheckCircle, QrCode, Home, Plus } from 'lucide-react';

const ProductSuccessPage = ({ produce }) => {
  const batchDetails = {
    id: produce.batchId,
    produce: produce.produceName,
    quantity: produce.quantity,
    harvestDate: produce.harvestDate,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-500 pb-20">
      <main className="container pt-12 flex flex-col items-center">
        <div className="text-center max-w-2xl mx-auto">
          <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4 bg-green-100 rounded-full p-2" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Product Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Detailed information loaded from Firestore</p>
        </div>

        <div className="w-full max-w-lg p-8 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 border-b pb-3 dark:border-gray-600">Batch Details</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-8">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Batch ID</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Produce</p>

            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{batchDetails.id}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{batchDetails.produce}</p>

            <p className="text-gray-500 dark:text-gray-400 font-medium mt-3">Quantity</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-3">Harvest Date</p>

            <p className="text-lg font-bold text-gray-800 dark:text-white">{batchDetails.quantity}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{batchDetails.harvestDate}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg text-center border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center justify-center">
              <QrCode className="w-5 h-5 mr-2" /> QR Code Generated
            </h3>
            <div className="w-24 h-24 bg-white dark:bg-gray-800 mx-auto border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center text-xs text-gray-500 mb-4">QR Code</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Share this QR code with distributors and consumers for complete traceability</p>
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <a href="#/register" className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-150">
            <Plus className="w-5 h-5 mr-2" /> Register Another Batch
          </a>

          <a href="#/consumer-dashboard" className="flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150 border border-gray-300 dark:border-gray-600">
            <Home className="w-5 h-5 mr-2" /> View Dashboard
          </a>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-2xl flex items-center space-x-2">
        <CheckCircle className="w-5 h-5" />
        <span>Produce loaded from Firestore</span>
      </div>
    </div>
  );
};

export default ProductSuccessPage;
