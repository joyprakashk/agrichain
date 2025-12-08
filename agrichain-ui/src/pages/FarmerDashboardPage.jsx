import React, { useEffect, useState } from "react";
// Removed direct Firestore usage - using backend API instead
import { Package, Clock, CheckCircle, TrendingUp, Plus, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FarmerDashboardPage = () => {
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("farmerEmail");
    if (!email) {
      setLoading(false);
      navigate("/farmer");
      return;
    }

    // Use backend API instead of direct Firestore
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/farmer/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (response.ok) {
          const result = await response.json();
          setFarmerData(result.farmerData);
        } else {
          throw new Error('Failed to fetch dashboard');
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        setFarmerData({
          fullName: "Farmer",
          aadhaar: "N/A",
          dashboard: { totalBatches: 0, inTransit: 0, delivered: 0, successRate: "0%" },
          batches: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (!farmerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">Unable to load dashboard. Please try logging in again.</p>
          <button 
            onClick={() => navigate("/farmer")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const batches = farmerData?.batches || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-6 pt-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {farmerData?.fullName?.split(" ")[0] || "John"} Farm Owner
            </h1>
            <p className="text-gray-600">
              Farm ID: {farmerData?.aadhaar || "FARM001"} • Manage your produce and track supply chain
            </p>
          </div>

          <button
            onClick={() => navigate("/register-produce")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
          >
            <Plus size={20} /> Register Produce
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardCard title="Total Batches" icon={<Package className="w-8 h-8 text-blue-600" />} value={farmerData?.dashboard?.totalBatches || 1} iconBg="bg-blue-50" />
          <DashboardCard title="In Transit" icon={<Clock className="w-8 h-8 text-orange-600" />} value={farmerData?.dashboard?.inTransit || 0} iconBg="bg-orange-50" />
          <DashboardCard title="Delivered" icon={<CheckCircle className="w-8 h-8 text-green-600" />} value={farmerData?.dashboard?.delivered || 1} iconBg="bg-green-50" />
          <DashboardCard title="Success Rate" icon={<TrendingUp className="w-8 h-8 text-purple-600" />} value={farmerData?.dashboard?.successRate || "100%"} iconBg="bg-purple-50" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Box size={24} /> Your Registered Batches
          </h2>

          {batches.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Organic Tomatoes</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      delivered
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>Quantity: 100 kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Harvested: Jan 15, 2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Box className="w-4 h-4" />
                      <span>ID: BATCH001</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Supply Chain Progress</span>
                      <span className="font-semibold text-gray-900">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gray-900 h-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Farm</span>
                      <span>Transport</span>
                      <span>Retail</span>
                      <span>Consumer</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      View QR Code
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      Track Progress
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {batches.map((batch, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-8">
                  <div className="flex items-start gap-6">
                    {batch.imageUrl && (
                      <img
                        src={batch.imageUrl}
                        alt={batch.produceName}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{batch.produceName}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {batch.status || 'delivered'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>Quantity: {batch.quantity} kg</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Harvested: {batch.harvestDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Box className="w-4 h-4" />
                          <span>ID: {batch.batchId || 'BATCH001'}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          View QR Code
                        </button>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                          Track Progress
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, icon, value, iconBg }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

export default FarmerDashboardPage;
