import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, Package, TrendingUp, Users, CheckCircle, Clock, 
  AlertCircle, Eye, ShoppingCart, Plus, ArrowRight, 
  DollarSign, Star, Truck, ClipboardList, Search, Filter
} from 'lucide-react';
import { ENDPOINTS, getStageName, getStageColor, getStageIcon } from '../config/api';
import toast from 'react-hot-toast';

// Interfaces
interface RetailerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  gstNumber: string;
  licenseNumber: string;
  ownerName: string;
  walletAddress: string;
  totalProductsReceived: number;
  totalProductsSold: number;
  totalOrders: number;
  rating: number;
  totalRatings: number;
  registeredAt: string;
}

interface Product {
  id: string;
  produceName: string;
  farmerName: string;
  farmerId: string;
  quantity: number;
  unit: string;
  price?: number;
  harvestDate: string;
  status: string;
  currentStage: string;
  availableForPurchase: boolean;
  retailerDetails?: {
    receivedDate?: string;
    inspectionStatus?: string;
    priceAtRetail?: string;
    listedDate?: string;
  };
  supplyChain?: {
    [key: string]: {
      timestamp: string;
      notes?: string;
    };
  };
  createdAt: string;
}

interface DashboardStats {
  totalReceived: number;
  totalListed: number;
  totalSold: number;
  pendingAction: number;
  totalRevenue: number;
  averageRating: number;
}

const RetailerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [retailerData, setRetailerData] = useState<RetailerInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    totalReceived: 0,
    totalListed: 0,
    totalSold: 0,
    pendingAction: 0,
    totalRevenue: 0,
    averageRating: 0
  });

  useEffect(() => {
    const retailerEmail = localStorage.getItem('retailerEmail');
    if (!retailerEmail) {
      toast.error('Please login to continue');
      navigate('/retailer/login');
      return;
    }
    fetchDashboardData(retailerEmail);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [activeFilter, products, searchTerm]);

  const filterProducts = () => {
    let filtered = [...products];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (activeFilter === 'pending') {
      filtered = filtered.filter(p => 
        p.currentStage === 'inTransitToRetailer' || 
        p.currentStage === 'receivedByRetailer' ||
        p.currentStage === 'storedInRetail'
      );
    } else if (activeFilter === 'listed') {
      filtered = filtered.filter(p => p.availableForPurchase === true);
    } else if (activeFilter === 'sold') {
      filtered = filtered.filter(p => 
        p.currentStage === 'purchased' || 
        p.currentStage === 'delivered'
      );
    }
    
    setFilteredProducts(filtered);
  };

  const fetchDashboardData = async (email: string) => {
    try {
      setLoading(true);
      
      // Fetch retailer details
      const retailerRes = await fetch(ENDPOINTS.RETAILER_DETAILS(email));
      const retailerData = await retailerRes.json();
      
      if (retailerRes.ok) {
        setRetailerData(retailerData.retailer);
      }
      
      // Fetch retailer's products
      const productsRes = await fetch(ENDPOINTS.RETAILER_PRODUCE(email));
      const productsData = await productsRes.json();
      
      if (productsRes.ok) {
        const productList = productsData.produce || [];
        setProducts(productList);
        
        // Calculate stats
        const received = productList.length;
        const listed = productList.filter((p: Product) => p.availableForPurchase === true).length;
        const sold = productList.filter((p: Product) => 
          p.currentStage === 'purchased' || p.currentStage === 'delivered'
        ).length;
        const pending = productList.filter((p: Product) => 
          p.currentStage === 'inTransitToRetailer' || 
          p.currentStage === 'receivedByRetailer' ||
          p.currentStage === 'storedInRetail'
        ).length;
        
        // Calculate total revenue
        const revenue = productList
          .filter((p: Product) => p.currentStage === 'purchased' || p.currentStage === 'delivered')
          .reduce((sum: number, p: Product) => sum + (p.price || 0), 0);
        
        setStats({
          totalReceived: received,
          totalListed: listed,
          totalSold: sold,
          pendingAction: pending,
          totalRevenue: revenue,
          averageRating: retailerData.retailer?.rating || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveProduct = (product: Product) => {
    navigate(`/retailer/receive/${product.id}`, { 
      state: { product, farmerId: product.farmerId } 
    });
  };

  const handleStoreProduct = (product: Product) => {
    navigate(`/retailer/store/${product.id}`, { 
      state: { product, farmerId: product.farmerId } 
    });
  };

  const handleListProduct = (product: Product) => {
    navigate(`/retailer/list/${product.id}`, { 
      state: { product, farmerId: product.farmerId } 
    });
  };

  const handleViewDetails = (product: Product) => {
    navigate(`/details/${product.id}`, { 
      state: { product, farmerId: product.farmerId } 
    });
  };

  const getProductStatusBadge = (product: Product) => {
    const stage = product.currentStage || product.status;
    const color = getStageColor(stage);
    const icon = getStageIcon(stage);
    const name = getStageName(stage);
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${color}`}>
        <span>{icon}</span>
        <span>{name}</span>
      </span>
    );
  };

  const getActionButton = (product: Product) => {
    const stage = product.currentStage || product.status;
    
    switch (stage) {
      case 'inTransitToRetailer':
        return (
          <button
            onClick={() => handleReceiveProduct(product)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
          >
            <Package className="w-3 h-3" />
            Receive
          </button>
        );
      case 'receivedByRetailer':
        return (
          <button
            onClick={() => handleStoreProduct(product)}
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            Store
          </button>
        );
      case 'storedInRetail':
        if (!product.availableForPurchase) {
          return (
            <button
              onClick={() => handleListProduct(product)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              List for Sale
            </button>
          );
        }
        return (
          <button
            onClick={() => handleViewDetails(product)}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
        );
      case 'listedForSale':
        return (
          <button
            onClick={() => handleViewDetails(product)}
            className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition flex items-center gap-1"
          >
            <ShoppingCart className="w-3 h-3" />
            View Listing
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleViewDetails(product)}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Details
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
                <Store className="w-10 h-10" />
                <div>
                  <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
                  <p className="text-green-100 mt-1">
                    Welcome back, {retailerData?.name || 'Retailer'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/retailer/marketplace')}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Browse Marketplace
              </button>
              <button
                onClick={() => navigate('/qr-codes')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                QR Codes
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Products Received</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalReceived}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Listed for Sale</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalListed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Products Sold</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSold}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Action</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingAction}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or farmer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="container mx-auto px-4 mt-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeFilter === 'all'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Products ({products.length})
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeFilter === 'pending'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Action ({stats.pendingAction})
              </button>
              <button
                onClick={() => setActiveFilter('listed')}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeFilter === 'listed'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Listed for Sale ({stats.totalListed})
              </button>
              <button
                onClick={() => setActiveFilter('sold')}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeFilter === 'sold'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sold ({stats.totalSold})
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Product Inventory</h2>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeFilter === 'pending' && "Products in transit or waiting for action will appear here"}
                {activeFilter === 'listed' && "No products are currently listed for sale"}
                {activeFilter === 'sold' && "Sold products will appear here"}
                {activeFilter === 'all' && "Products purchased from farmers will appear here"}
              </p>
              {activeFilter === 'all' && (
                <button
                  onClick={() => navigate('/retailer/marketplace')}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Browse Marketplace
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.produceName}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            ID: {product.id.slice(0, 8)}...
                          </p>
                          {product.retailerDetails?.listedDate && (
                            <p className="text-xs text-green-600 mt-1">
                              Listed: {new Date(product.retailerDetails.listedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{product.farmerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {product.quantity} {product.unit || 'kg'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.retailerDetails?.priceAtRetail ? (
                          <div>
                            <span className="text-green-600 font-semibold">
                              {product.retailerDetails.priceAtRetail}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not listed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getProductStatusBadge(product)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {getActionButton(product)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/retailer/marketplace')}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition group"
            >
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Browse Marketplace</p>
                <p className="text-xs text-gray-500">Purchase fresh produce from farmers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
            </button>
            
            <button
              onClick={() => navigate('/retailer/dashboard')}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition group"
            >
              <ClipboardList className="w-8 h-8 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Manage Inventory</p>
                <p className="text-xs text-gray-500">Receive, store, and list products</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
            </button>
            
            <button
              onClick={() => navigate('/qr-codes')}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition group"
            >
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-800">View QR Codes</p>
                <p className="text-xs text-gray-500">Generate and manage product QR codes</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboardPage;