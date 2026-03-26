import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, CheckCircle, XCircle, ClipboardList, MapPin, Calendar } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const RetailerReceiveProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, farmerId } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    inspectionStatus: 'passed',
    qualityNotes: '',
    storageLocation: '',
    quantity: product?.quantity || 0
  });

  if (!product) {
    navigate('/retailer/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const retailerEmail = localStorage.getItem('retailerEmail');
      
      const response = await fetch(ENDPOINTS.RETAILER_RECEIVE_PRODUCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerEmail,
          produceId: product.id,
          farmerEmail: farmerId,
          inspectionStatus: formData.inspectionStatus,
          qualityNotes: formData.qualityNotes,
          storageLocation: formData.storageLocation,
          quantity: formData.quantity
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Product received successfully!');
        setTimeout(() => navigate('/retailer/dashboard'), 1500);
      } else {
        toast.error(data.message || 'Failed to receive product');
      }
    } catch (error) {
      console.error('Error receiving product:', error);
      toast.error('Failed to receive product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Receive Product</h1>
            </div>
            <p className="text-blue-100 mt-2">Inspect and receive produce from farmer</p>
          </div>
          
          <div className="p-8">
            {/* Product Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Product Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium">{product.produceName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{product.quantity} {product.unit || 'kg'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Farmer</p>
                  <p className="font-medium">{product.farmerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Harvest Date</p>
                  <p className="font-medium">{new Date(product.harvestDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClipboardList className="w-4 h-4 inline mr-2" />
                  Inspection Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inspectionStatus"
                      value="passed"
                      checked={formData.inspectionStatus === 'passed'}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Passed
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inspectionStatus"
                      value="failed"
                      checked={formData.inspectionStatus === 'failed'}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Failed
                    </span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Notes
                </label>
                <textarea
                  name="qualityNotes"
                  value={formData.qualityNotes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quality inspection notes..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Storage Location
                </label>
                <input
                  type="text"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Cold Storage A-12, Shelf 3"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Receipt'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/retailer/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerReceiveProductPage;