import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, Store, MapPin, Calendar, DollarSign, 
  Eye, ShoppingCart, ArrowLeft, CheckCircle, 
  Truck, Clock, User, Tag, QrCode
} from 'lucide-react';
import { ENDPOINTS, getStageName, getStageColor } from '../config/api';
import toast from 'react-hot-toast';

const RetailerProductDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, farmerId } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState({ show: false, qrCode: null });

  if (!product) {
    navigate('/retailer/dashboard');
    return null;
  }

  const handleViewQR = async () => {
    if (!product.traceId) {
      toast.error('No QR code available for this product');
      return;
    }
    
    try {
      // Generate QR code for the product
      const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(product.traceId)}`);
      const qrBlob = await qrResponse.blob();
      const qrUrl = URL.createObjectURL(qrBlob);
      setQrModal({ show: true, qrCode: qrUrl });
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleManageListing = () => {
    // Navigate to edit listing page
    navigate(`/retailer/edit-listing/${product.id}`, { 
      state: { product, farmerId } 
    });
  };

  const handleRemoveListing = async () => {
    if (window.confirm('Are you sure you want to remove this listing?')) {
      // Call API to remove listing
      toast.success('Listing removed successfully');
      navigate('/retailer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/retailer/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Product Details</h1>
            </div>
            <p className="text-green-100 mt-1">View and manage your listed product</p>
          </div>
          
          <div className="p-8">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Product Image */}
              <div>
                <div className="h-64 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.produceName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-white opacity-50" />
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleViewQR}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    View QR Code
                  </button>
                </div>
              </div>
              
              {/* Right Column - Product Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{product.produceName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStageColor(product.currentStage)}`}>
                      <span>{getStageName(product.currentStage)}</span>
                    </span>
                    {product.availableForPurchase && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Listed for Sale
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Store className="w-4 h-4" />
                    <span className="text-sm">Farmer: {product.farmerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Source: {product.sourceLocation || 'Farm Fresh'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Harvest Date: {new Date(product.harvestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Quantity: {product.quantity} {product.unit || 'kg'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm">Category: {product.category || 'Fresh Produce'}</span>
                  </div>
                </div>
                
                {/* Pricing Section */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Pricing Information</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Retail Price:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {product.retailerDetails?.priceAtRetail || `₹${product.price}/${product.unit || 'kg'}`}
                    </span>
                  </div>
                  {product.retailerDetails?.listedDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Listed on: {new Date(product.retailerDetails.listedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleManageListing}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Listing
                  </button>
                  <button
                    onClick={handleRemoveListing}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Remove Listing
                  </button>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Listing Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Product ID:</p>
                  <p className="font-mono text-xs">{product.id}</p>
                </div>
                {product.traceId && (
                  <div>
                    <p className="text-gray-500">Blockchain Trace ID:</p>
                    <p className="font-mono text-xs break-all">{product.traceId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {qrModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Product QR Code</h3>
              <div className="mb-4">
                <img 
                  src={qrModal.qrCode} 
                  alt="Product QR Code" 
                  className="mx-auto border rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Scan to view product details and verify authenticity
              </p>
              <button 
                onClick={() => setQrModal({ show: false, qrCode: null })}
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerProductDetailsPage;