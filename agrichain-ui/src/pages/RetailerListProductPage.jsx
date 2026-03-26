import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, DollarSign, TrendingUp, Percent, CheckCircle } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const RetailerListProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, farmerId } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    unit: 'kg',
    discountPrice: '',
    availableQuantity: product?.quantity || 0
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
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    setLoading(true);
    
    try {
      const retailerEmail = localStorage.getItem('retailerEmail');
      
      const response = await fetch(ENDPOINTS.RETAILER_LIST_PRODUCE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailerEmail,
          produceId: product.id,
          farmerEmail: farmerId,
          price: parseFloat(formData.price),
          unit: formData.unit,
          discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Product listed for sale successfully!');
        setTimeout(() => navigate('/retailer/dashboard'), 1500);
      } else {
        toast.error(data.message || 'Failed to list product');
      }
    } catch (error) {
      console.error('Error listing product:', error);
      toast.error('Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">List Product for Sale</h1>
            </div>
            <p className="text-green-100 mt-2">Set pricing and list produce on the marketplace</p>
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
                  <p className="text-sm text-gray-500">Available Quantity</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Price *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      step="0.01"
                      min="0"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="dozen">Dozen</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Percent className="w-4 h-4 inline mr-2" />
                  Discount Price (Optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity
                </label>
                <input
                  type="number"
                  name="availableQuantity"
                  value={formData.availableQuantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Full quantity will be listed for sale</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Once listed, consumers will be able to purchase this product directly from your store.
                  You can update or remove the listing at any time.
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Listing...' : 'List for Sale'}
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

export default RetailerListProductPage;