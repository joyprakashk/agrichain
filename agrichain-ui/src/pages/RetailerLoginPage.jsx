import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, AlertCircle } from 'lucide-react';
import { ENDPOINTS } from '../config/api';
import toast from 'react-hot-toast';

const RetailerLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log("🔑 Attempting login with:", formData.email);
    console.log("📡 API URL:", ENDPOINTS.RETAILER_LOGIN);
    
    try {
      const response = await fetch(ENDPOINTS.RETAILER_LOGIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      console.log("📨 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      if (response.ok && data.success) {
        // Store retailer session data
        localStorage.setItem('retailerEmail', data.retailer.email);
        localStorage.setItem('retailerName', data.retailer.name);
        localStorage.setItem('retailerData', JSON.stringify(data.retailer));
        localStorage.setItem('userType', 'retailer');
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        toast.success('Login successful!');
        setTimeout(() => navigate('/retailer/dashboard'), 1000);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-center">
            <Store className="w-12 h-12 text-white mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">Retailer Login</h1>
            <p className="text-green-100 mt-1">Access your retailer dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="contact@freshmart.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
            
            <div className="text-center text-sm text-gray-500">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/retailer/register')}
                  className="text-green-600 hover:underline font-medium"
                >
                  Register here
                </button>
              </p>
              <p className="mt-2 text-xs text-gray-400">
                <Store className="w-3 h-3 inline mr-1" />
                Join AgriChain as a retailer and connect with farmers
              </p>
            </div>
          </form>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-700">Demo Retailer Account:</p>
              <p>Email: demo@retailer.com</p>
              <p>Password: demo123</p>
              <p className="mt-1 text-gray-500">(If you haven't registered yet, please register first)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerLoginPage;