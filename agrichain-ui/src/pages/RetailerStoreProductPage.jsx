import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, Thermometer, Droplet, Clock, CheckCircle } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const RetailerStoreProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, farmerId } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storageConditions: '',
    temperature: '',
    humidity: '',
    expectedShelfLife: ''
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
      const storageConditionsText = `
        Temperature: ${formData.temperature || 'Not specified'}°C,
        Humidity: ${formData.humidity || 'Not specified'}%,
        Expected Shelf Life: ${formData.expectedShelfLife || 'Not specified'} days,
        Notes: ${formData.storageConditions || 'Standard storage'}
      `;
      
      const response = await fetch(ENDPOINTS.RETAILER_STORE_PRODUCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerEmail,
          produceId: product.id,
          farmerEmail: farmerId,
          storageConditions: storageConditionsText
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Product stored successfully!');
        setTimeout(() => navigate('/retailer/dashboard'), 1500);
      } else {
        toast.error(data.message || 'Failed to store product');
      }
    } catch (error) {
      console.error('Error storing product:', error);
      toast.error('Failed to store product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Store Product</h1>
            </div>
            <p className="text-purple-100 mt-2">Enter storage details for the received produce</p>
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
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Thermometer className="w-4 h-4 inline mr-2" />
                  Storage Temperature (°C)
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 2-4°C"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="w-4 h-4 inline mr-2" />
                  Humidity (%)
                </label>
                <input
                  type="text"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 65-75%"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Expected Shelf Life (days)
                </label>
                <input
                  type="text"
                  name="expectedShelfLife"
                  value={formData.expectedShelfLife}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 7-10 days"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Storage Notes
                </label>
                <textarea
                  name="storageConditions"
                  value={formData.storageConditions}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any special storage requirements..."
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Store Product'}
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

export default RetailerStoreProductPage;