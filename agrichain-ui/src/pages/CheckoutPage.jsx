// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Lock,
  MapPin,
  ClipboardList,
  Smartphone,
  CheckCircle,
  Clock,
  Shield,
  Truck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Helper to generate a mock order number
const generateOrderNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORDER_';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};



const CheckoutPage = ({ onBack, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // read order from location.state (parent should pass it)
  const incomingOrder = location?.state?.order ?? null;

  const [order, setOrder] = useState(() => {
    const o = incomingOrder ?? {
      productName: 'Unknown Product',
      quantity: 1,
      pricePerKg: 0,
      subtotal: 0,
      deliveryFee: 0,
      totalAmount: 0,
    };
    // compute safe totals
    return {
      ...o,
      subtotal: o.subtotal ?? (o.quantity * (o.pricePerKg ?? 0)),
      totalAmount: o.totalAmount ?? ((o.subtotal ?? 0) + (o.deliveryFee ?? 0)),
    };
  });

  const [selectedPayment, setSelectedPayment] = useState('Cash on Delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if no incoming order, keep showing checkout but with fallback data
    if (!incomingOrder) {
      console.warn('CheckoutPage: no order in location.state — using fallback data');
    }
  }, [incomingOrder]);

  const handlePlaceOrder = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!deliveryAddress) {
      alert('Please enter your delivery address.');
      return;
    }


    setLoading(true);
    try {
      const consumer = JSON.parse(localStorage.getItem('consumerInfo') || '{}');
      const consumerEmail = consumer.email || consumer.phoneNumber;

      if (!consumerEmail) {
        alert('Please login to place order');
        return;
      }

      const orderPayload = {
        consumerEmail,
        productName: order.productName,
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        farmerEmail: order.farmerEmail || 'unknown',
        orderData: {
          deliveryAddress,
          paymentMethod: selectedPayment,
          source: order.sourceLocation || { lat: 12.9716, lng: 77.5946 }, // From Produce (Farmer)
          destination: consumer.coordinates || { lat: 13.0827, lng: 80.2707 } // From Consumer Profile
        }
      };

      const response = await fetch('http://localhost:8080/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();

      if (response.ok) {
        // Fetch QR code for the order
        let qrCodeData = null;
        try {
          const qrResponse = await fetch('http://localhost:8080/api/test/qr');
          if (qrResponse.ok) {
            const qrResult = await qrResponse.json();
            qrCodeData = qrResult.qrCode;
          }
        } catch (qrError) {
          console.log('QR code fetch failed:', qrError);
        }

        const finalOrder = {
          ...order,
          deliveryAddress,
          paymentMethod: selectedPayment,
          placedAt: new Date().toISOString(),
          orderId: result.orderId,
          traceId: result.traceId || 'TXN_' + Date.now().toString(36).toUpperCase(),
          qrCode: qrCodeData || result.qrCode,
          blockchainEnabled: result.blockchainEnabled || true,
          source: orderPayload.orderData.source,
          destination: orderPayload.orderData.destination
        };

        // Store order details for success page
        localStorage.setItem('lastOrderDetails', JSON.stringify(finalOrder));

        // Navigate to processing page
        window.location.hash = '#/order-processing';
      } else {
        alert(result.message || 'Order placement failed');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    // Get last order to find ID
    const lastOrder = JSON.parse(localStorage.getItem('lastOrderDetails'));
    if (lastOrder && lastOrder.orderId) {
      navigate(`/tracking/${lastOrder.orderId}`, {
        state: {
          orderData: {
            source: lastOrder.source,
            destination: lastOrder.destination
          }
        }
      });
    } else {
      alert("Order details missing. Cannot track.");
    }
  };

  const handleContinueShopping = () => {
    // navigate to main buy page (adjust path if different)
    navigate('/');
  };

  const handleBack = () => {
    if (typeof onBack === 'function') return onBack();
    navigate(-1);
  };

  if (orderPlaced) {
    // Embedded Order Success UI (previously OrderSuccessPage)
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 2);
    const formattedDeliveryDate = `${deliveryDate.getMonth() + 1}/${deliveryDate.getDate()}/${deliveryDate.getFullYear()}`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Placed Successfully!</h1>

          <div className="space-y-4 text-left text-gray-700 mb-8">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <p>Order Number:</p>
              <p className="font-semibold text-gray-900">{orderNumber}</p>
            </div>

            <div className="flex justify-between border-b border-gray-100 pb-2">
              <p>Expected Delivery:</p>
              <p className="font-semibold text-gray-900">{formattedDeliveryDate}</p>
            </div>

            <div className="flex justify-between pt-2">
              <p>Total Amount:</p>
              <p className="text-xl font-bold text-green-600">₹{order.totalAmount}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-8">
            <div className="flex items-center text-blue-700 font-semibold justify-center mb-1">
              <Shield className="w-4 h-4 mr-2" /> Blockchain Escrow Active
            </div>
            <p className="text-xs text-gray-600">
              Your payment is secured in smart contract escrow until delivery confirmation
            </p>
            {order.traceId && (
              <p className="text-xs text-blue-600 mt-2 font-mono text-center">
                Trace ID: {order.traceId.slice(0, 16)}...
              </p>
            )}
          </div>

          {order.qrCode && (
            <div className="mb-8 text-center">
              <h3 className="text-lg font-semibold mb-4">Blockchain QR Code</h3>
              <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                <img
                  src={order.qrCode}
                  alt="Blockchain QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500">Scan to verify on blockchain</p>
            </div>
          )}

          <button
            onClick={handleTrackOrder}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg mb-4"
          >
            Track Order
          </button>

          <button
            onClick={handleContinueShopping}
            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Continue Shopping
          </button>

          <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-2xl flex items-center text-sm">
            <CheckCircle className="w-4 h-4 mr-2" /> Order placed successfully!
          </div>
        </div>
      </div>
    );
  }

  // Checkout form UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <header className="bg-white dark:bg-gray-700 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition duration-150 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Checkout</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 mt-6">
        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>

          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <p>{order.productName}</p>
              <p className="font-semibold">₹{order.subtotal}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {order.quantity} kg x ₹{order.pricePerKg}
            </p>

            <div className="flex justify-between pt-2">
              <p>Subtotal:</p>
              <p>₹{order.subtotal}</p>
            </div>

            <div className="flex justify-between">
              <p>Delivery Fee:</p>
              <p>₹{order.deliveryFee}</p>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-lg font-bold text-gray-800 dark:text-white">Total Amount:</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{order.totalAmount}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Delivery Address</h2>
          <textarea
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows="3"
            placeholder="Enter your complete delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Payment Method</h2>

          <div className="space-y-3">
            {/* Cash on Delivery Option */}
            <div
              onClick={() => setSelectedPayment('Cash on Delivery')}
              className={`flex items-center p-4 rounded-lg cursor-pointer border ${selectedPayment === 'Cash on Delivery'
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/30 dark:border-green-600'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600'
                }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded"></div>
                </div>
                <span className="font-medium text-gray-800 dark:text-white">Cash on Delivery</span>
              </div>
              {selectedPayment === 'Cash on Delivery' && (
                <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center text-blue-700 dark:text-blue-300 font-semibold mb-1">
              <Lock className="w-4 h-4 mr-2" /> Secure Blockchain Escrow
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Payment will be held in blockchain escrow until delivery confirmation
            </p>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="w-full">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 dark:bg-green-700 text-white font-bold text-lg rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition shadow-lg disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? 'Processing...' : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Place Order - ₹{order.totalAmount}
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;