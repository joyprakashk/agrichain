import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, DollarSign, Truck, Calendar, Store, MapPin, CheckCircle, ArrowLeft, ShoppingCart, AlertCircle } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const RetailerPurchasePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { produce, farmerId } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(produce?.quantity || 0);
  const [agreed, setAgreed] = useState(false);

  if (!produce) {
    toast.error('Product information missing');
    navigate('/retailer/marketplace');
    return null;
  }

  const handlePurchase = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms');
      return;
    }

    setLoading(true);
    try {
      const retailerEmail = localStorage.getItem('retailerEmail');
      
      if (!retailerEmail) {
        toast.error('Please login again');
        navigate('/retailer/login');
        return;
      }

      // IMPORTANT: Get the farmer's email from produce.farmerEmail or farmerId
      const farmerEmail = produce.farmerEmail || farmerId;
      
      if (!farmerEmail) {
        toast.error('Farmer information missing. Cannot complete purchase.');
        console.error('Missing farmer email:', { produce, farmerId });
        setLoading(false);
        return;
      }

      console.log('=== Purchase Debug Info ===');
      console.log('Farmer Email:', farmerEmail);
      console.log('Produce ID:', produce.id);
      console.log('Retailer Email:', retailerEmail);
      console.log('Produce:', produce);
      console.log('===========================');

      // Prepare the request body - email is the farmer's email (CRITICAL)
      const requestBody = {
        email: farmerEmail,        // This MUST be the farmer's email
        produceId: produce.id,
        retailerEmail: retailerEmail,
        farmerPrivateKey: null
      };

      console.log('📦 Sending purchase request:', JSON.stringify(requestBody, null, 2));
      console.log('🔗 Endpoint:', ENDPOINTS.TRANSFER_TO_RETAILER);

      // Call the transfer to retailer endpoint
      const response = await fetch(ENDPOINTS.TRANSFER_TO_RETAILER, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log('📨 Response:', { status: response.status, data });
      
      if (response.ok) {
        toast.success('Purchase successful! Product will be delivered to your store.');
        setTimeout(() => navigate('/retailer/dashboard'), 2000);
      } else {
        toast.error(data.message || 'Purchase failed');
        console.error('Purchase failed:', data);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to complete purchase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate('/retailer/marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Confirm Purchase</h1>
            </div>
            <p className="text-green-100 mt-1">Review and confirm your purchase from farmer</p>
          </div>
          
          <div className="p-8">
            {/* Product Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium">{produce.produceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Farmer:</span>
                  <span>{produce.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Farmer Email:</span>
                  <span className="text-xs font-mono">{produce.farmerEmail || farmerId || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Farm Location:</span>
                  <span>{produce.sourceLocation || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harvest Date:</span>
                  <span>{produce.harvestDate ? new Date(produce.harvestDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span>{quantity} {produce.unit || 'kg'}</span>
                </div>
                {produce.price && (
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-green-600 font-bold text-lg">
                      ₹{produce.price * quantity}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Delivery Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Delivery Information</h3>
              </div>
              <p className="text-sm text-gray-600">
                The produce will be dispatched from the farmer's location to your retail store.
                You will be notified once the product is in transit.
              </p>
            </div>
            
            {/* Terms Agreement */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-600">
                  I confirm that I have reviewed the product details and agree to purchase from the farmer. 
                  I understand that the product will be delivered to my retail location and I will inspect it upon receipt.
                </span>
              </label>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Confirm Purchase
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate('/retailer/marketplace')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerPurchasePage;