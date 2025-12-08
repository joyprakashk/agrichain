// src/pages/OrderSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, QrCode, Home, Package, ArrowLeft, Truck, Clock, MapPin } from 'lucide-react';

const OrderSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [qrModal, setQrModal] = useState({ show: false, qrCode: null, traceId: null });

  useEffect(() => {
    // Get order details from localStorage or state
    const storedOrder = localStorage.getItem('lastOrderDetails');
    if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    }
  }, []);

  const handleViewQR = async () => {
    if (!orderDetails) return;
    
    try {
      const consumer = JSON.parse(localStorage.getItem("consumerInfo") || '{}');
      const consumerEmail = consumer.email || consumer.phoneNumber;
      
      const response = await fetch(`http://localhost:8080/api/orders/${orderDetails.orderId}/qr?consumerEmail=${encodeURIComponent(consumerEmail)}`);
      const result = await response.json();
      
      if (response.ok && result.qrCode) {
        setQrModal({ 
          show: true, 
          qrCode: result.qrCode, 
          traceId: result.traceId || orderDetails.traceId 
        });
      } else {
        alert('QR code not available yet. Please try again in a few moments.');
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      alert('Failed to load QR code');
    }
  };

  const handleVerifyOnline = () => {
    if (qrModal.traceId) {
      window.location.hash = `#/verify/${qrModal.traceId}`;
    }
  };

  const handleBackToDashboard = () => {
    localStorage.removeItem('lastOrderDetails');
    window.location.hash = '#/consumer-dashboard';
  };

  const handleContinueShopping = () => {
    localStorage.removeItem('lastOrderDetails');
    window.location.hash = '#/buyproduce';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <main className="container max-w-2xl mx-auto px-4 pt-12 pb-20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          {orderDetails?.orderId && (
            <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
              Order ID: {orderDetails.orderId}
            </p>
          )}
        </div>

        {orderDetails && (
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {orderDetails.productName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {orderDetails.quantity} {orderDetails.unit}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    From: {orderDetails.farmerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    ₹{orderDetails.totalAmount}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Confirmed
                  </p>
                </div>
              </div>

              {orderDetails.traceId && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Blockchain Verification
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mb-3">
                    Trace ID: {orderDetails.traceId}
                  </p>
                  <button 
                    onClick={handleViewQR}
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR Code for Verification
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            What's Next?
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Your order has been sent to the farmer for confirmation</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>You'll receive updates on your order status</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Use the QR code to verify product authenticity when delivered</p>
            </div>
          </div>
        </div>

        {/* Delivery Tracker */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Delivery Tracking
          </h3>
          
          {/* Tracking Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Track Your Order
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={orderDetails?.orderId || ''}
                readOnly
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-800 dark:text-white"
                placeholder="Order ID"
              />
              <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Track
              </button>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-4">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white">Order Placed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your order has been confirmed</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Just now</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
                <Package className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-500 dark:text-gray-400">Processing</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Farmer is preparing your order</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
                <Truck className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-500 dark:text-gray-400">Out for Delivery</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your order is on the way</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-4">
                <MapPin className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-500 dark:text-gray-400">Delivered</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order delivered successfully</p>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleBackToDashboard}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            <Home className="w-5 h-5 mr-2" />
            View Dashboard
          </button>
          <button 
            onClick={handleContinueShopping}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition"
          >
            <Package className="w-5 h-5 mr-2" />
            Continue Shopping
          </button>
        </div>
      </main>

      {/* QR Code Modal with Blockchain Hash */}
      {qrModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Blockchain Verification QR
              </h3>
              <div className="mb-4">
                <img 
                  src={qrModal.qrCode} 
                  alt="Blockchain QR Code" 
                  className="mx-auto border rounded-lg max-w-full"
                />
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Scan with your phone to verify on blockchain
                </p>
                {qrModal.traceId && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Blockchain Hash:
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-mono break-all">
                      {qrModal.traceId}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleVerifyOnline}
                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Verify Online
                </button>
                <button 
                  onClick={() => setQrModal({ show: false, qrCode: null, traceId: null })}
                  className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccessPage;