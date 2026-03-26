import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Search, Filter, TrendingUp, 
  Store, MapPin, Calendar, DollarSign, 
  Eye, ShoppingCart, Star, Truck, AlertCircle, RefreshCw
} from 'lucide-react';
import { ENDPOINTS, getStageName, getStageColor } from '../config/api';
import toast from 'react-hot-toast';

const RetailerMarketplacePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [produce, setProduce] = useState([]);
  const [filteredProduce, setFilteredProduce] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableProduce();
  }, []);

  useEffect(() => {
    filterProduce();
  }, [searchTerm, selectedCategory, produce]);

  // Helper function to safely get location string
  const getLocationString = (location) => {
    if (!location) return 'Farm Fresh';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      if (location.city) return location.city;
      if (location.name) return location.name;
      return 'Farm Fresh';
    }
    return 'Farm Fresh';
  };

  const fetchAvailableProduce = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📡 Fetching produce from marketplace...");
      console.log("🔗 API URL:", ENDPOINTS.ALL_PRODUCE);
      
      const response = await fetch(ENDPOINTS.ALL_PRODUCE);
      
      console.log("📨 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Received produce:", data);
      
      // Filter produce that is available for purchase (not yet assigned to any retailer)
      const availableProduce = data.allProduce?.filter(item => 
        !item.retailerId && 
        (item.status === 'harvested' || item.status === 'packaged' || item.status === 'registered')
      ) || [];
      
      console.log("📦 Available for purchase:", availableProduce.length, "items");
      // Log the first item to see its structure
      if (availableProduce.length > 0) {
        console.log("📋 First produce item:", {
          id: availableProduce[0].id,
          name: availableProduce[0].produceName,
          farmerName: availableProduce[0].farmerName,
          farmerEmail: availableProduce[0].farmerEmail,
          farmerId: availableProduce[0].farmerId
        });
      }
      
      setProduce(availableProduce);
      setFilteredProduce(availableProduce);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(availableProduce.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      if (availableProduce.length === 0) {
        console.log("ℹ️ No produce available for purchase");
      }
    } catch (error) {
      console.error('Error fetching produce:', error);
      setError(error.message || 'Failed to fetch produce');
      toast.error('Failed to load produce. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const filterProduce = () => {
    let filtered = [...produce];
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.produceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.farmerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    setFilteredProduce(filtered);
  };

  const handlePurchase = (item) => {
    // Get the farmer email - try multiple possible field names
    const farmerEmail = item.farmerEmail || item.farmerId || item.email;
    
    console.log("🛒 Purchase clicked for:", item.produceName);
    console.log("📧 Farmer email from item:", farmerEmail);
    console.log("🆔 Produce ID:", item.id);
    console.log("📦 Full item:", item);
    
    if (!farmerEmail) {
      toast.error('Farmer email missing for this product');
      return;
    }
    
    // Navigate to purchase confirmation page with produce details
    navigate(`/retailer/purchase/${item.id}`, { 
      state: { 
        produce: {
          id: item.id,
          produceName: item.produceName,
          farmerName: item.farmerName,
          farmerEmail: farmerEmail,  // This is the farmer's email - CRITICAL
          quantity: item.quantity,
          unit: item.unit || 'kg',
          price: item.price,
          harvestDate: item.harvestDate,
          sourceLocation: getLocationString(item.sourceLocation),
          imageUrl: item.imageUrl,
          currentStage: item.currentStage
        },
        farmerId: farmerEmail  // Pass farmer email as farmerId as well
      } 
    });
  };

  const handleViewDetails = (item) => {
    const farmerEmail = item.farmerEmail || item.farmerId || item.email;
    navigate(`/retailer/produce-details/${item.id}`, { 
      state: { 
        produce: item,
        farmerId: farmerEmail 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available produce...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Unable to load produce</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-400 mb-4">
            Make sure your backend server is running at: {import.meta.env.VITE_LAN_IP ? `http://${import.meta.env.VITE_LAN_IP}:8080` : 'http://localhost:8080'}
          </p>
          <button
            onClick={fetchAvailableProduce}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">Retailer Marketplace</h1>
                  <p className="text-green-100 mt-1">
                    Browse and purchase fresh produce directly from farmers
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/retailer/dashboard')}
              className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or farmer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-gray-400 self-center" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Available Products</p>
                <p className="text-2xl font-bold text-gray-800">{filteredProduce.length}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Farmers</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(produce.map(p => p.farmerName)).size}
                </p>
              </div>
              <Store className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Categories</p>
                <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProduce.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No produce available for purchase</p>
            <p className="text-sm text-gray-400 mt-2">
              Check back later for fresh produce from farmers
            </p>
            <button
              onClick={fetchAvailableProduce}
              className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProduce.map((item) => {
              // Safely get location string
              const locationString = getLocationString(item.sourceLocation);
              
              return (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-r from-green-400 to-green-500 relative">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.produceName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/600x400/D1E7DD/0F5132?text=Produce";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        {item.category || 'Fresh'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                      {item.produceName}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Store className="w-4 h-4" />
                      <span className="truncate">{item.farmerName}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{locationString}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Harvest: {item.harvestDate ? new Date(item.harvestDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Package className="w-4 h-4" />
                      <span>{item.quantity} {item.unit || 'kg'}</span>
                    </div>
                    
                    {item.price && (
                      <div className="flex items-center gap-2 text-lg font-bold text-green-600 mb-3">
                        <DollarSign className="w-5 h-5" />
                        <span>₹{item.price}/{item.unit || 'kg'}</span>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStageColor(item.currentStage)}`}>
                        <span>{item.currentStage === 'harvested' ? '🌾' : '📦'}</span>
                        <span>{getStageName(item.currentStage)}</span>
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                      <button
                        onClick={() => handlePurchase(item)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Purchase
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerMarketplacePage;