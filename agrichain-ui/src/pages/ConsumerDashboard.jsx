// src/pages/ConsumerDashboard.jsx
import React, { useEffect, useState } from "react";
import { Search, ArrowLeft, Star, MapPin } from "lucide-react";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// placeholder image (keeps same visual behaviour)
const FALLBACK_IMAGE = "https://placehold.co/600x400/D1E7DD/0F5132?text=Produce";

// --- Subcomponents (kept identical UI) ---

const RecentOrderItem = ({ id, name, quantity, price, date, status, imageSrc, traceId, onViewQR }) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 shrink-0">
        <img
          src={imageSrc || FALLBACK_IMAGE}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div>
        <p className="text-gray-800 dark:text-white font-semibold">{name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {quantity} • {price}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Ordered on {date}</p>
        {traceId && (
          <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-1">
            Blockchain: {traceId.slice(0, 8)}...
          </p>
        )}
      </div>
    </div>
    <div className="flex flex-col items-end">
      <span
        className={`text-sm font-medium px-3 py-1 rounded-full ${
          status === "placed"
            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
            : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
        }`}
      >
        {status}
      </span>
      {traceId && (
        <button 
          onClick={() => onViewQR(id, traceId)}
          className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700 transition"
        >
          View QR Code
        </button>
      )}
      <button className="text-green-600 text-sm font-medium mt-1 hover:text-green-700 transition">
        Reorder
      </button>
    </div>
  </div>
);

const StatBlock = ({ title, value, unit }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-green-700 dark:bg-green-900 rounded-lg shadow-lg min-h-[100px]">
    <div className={`text-2xl font-bold text-white`}>
      {value}
      {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
    </div>
    <div className="text-sm font-medium text-green-200">{title}</div>
  </div>
);

const FarmerCard = ({ name, location, orders, rating }) => (
  <div className="p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
    <div className="flex items-center mb-3">
      <div className="w-8 h-8 rounded-full bg-green-200 mr-3 flex items-center justify-center text-lg">🧑‍🌾</div>
      <div className="flex justify-between w-full items-center">
        <h4 className="font-bold text-gray-800 dark:text-white">{name}</h4>
        <span className="text-red-500">❤</span>
      </div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
      <MapPin className="w-3 h-3 mr-1" /> {location || "Unknown"}
    </p>
    <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-600">
      <p className="text-gray-600 dark:text-gray-300">Orders: <span className="font-semibold">{orders}</span></p>
      <p className="flex items-center text-gray-600 dark:text-gray-300">Rating: <Star className='w-4 h-4 text-yellow-500 ml-1 mr-1' fill='currentColor'/> <span className="font-semibold">{rating}</span></p>
    </div>
  </div>
);

// --- Main component with Firestore integration ---
const ConsumerDashboard = () => {
  const navigate = useNavigate();

  // UI state
  const [activeTab, setActiveTab] = useState("Orders");

  // live data state
  const [consumer, setConsumer] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    totalSpent: 0,
    avgRating: 0,
  });
  const [favoriteFarmers, setFavoriteFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState({ show: false, qrCode: null, orderId: null });

  // redirect/back handler (unchanged)
  const handleBack = () => {
    window.location.hash = "#/buyproduce";
  };

  const handleViewQR = async (orderId, traceId) => {
    try {
      const consumer = JSON.parse(localStorage.getItem("consumerInfo") || '{}');
      const consumerEmail = consumer.email || consumer.phoneNumber;
      
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/qr?consumerEmail=${encodeURIComponent(consumerEmail)}`);
      const result = await response.json();
      
      if (response.ok && result.qrCode) {
        setQrModal({ show: true, qrCode: result.qrCode, orderId, traceId: result.traceId || traceId });
      } else {
        alert('QR code not available for this order');
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      alert('Failed to load QR code');
    }
  };

  const handleVerifyOnline = () => {
    if (qrModal.traceId) {
      window.location.hash = `#/verify/${qrModal.traceId}`;
    }
  };

  // subscribe to consumer orders in Firestore
  useEffect(() => {
    // read logged-in consumer info from localStorage
    const stored = localStorage.getItem("consumerInfo");
    if (!stored) {
      // no consumer logged in — force login
      navigate("/consumerloginpage");
      return;
    }

    const consumerObj = JSON.parse(stored);
    setConsumer(consumerObj);

    // Firestore path: consumers/{consumerId}/orders
    // consumerObj.phoneNumber is expected to be the doc id used earlier (e.g. "+91 98765 43210")
    const consumerId = consumerObj.phoneNumber || consumerObj.phone || consumerObj.id || null;
    if (!consumerId) {
      setLoading(false);
      return;
    }

    const ordersColRef = collection(db, "consumers", consumerId, "orders");
    const ordersQ = query(ordersColRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      ordersQ,
      (snapshot) => {
        const orders = snapshot.docs.map((d) => {
          const data = d.data();
          // normalize fields with safe defaults
          return {
            id: d.id,
            name: data.productName || data.name || "Unknown Product",
            quantity: data.quantity ? `${data.quantity} ${data.unit || "kg"}` : (data.quantityLabel || "1 item"),
            price: data.totalAmount ? `₹${data.totalAmount}` : (data.price ? `₹${data.price}` : "₹0"),
            totalAmount: data.totalAmount || data.price || 0,
            date:
              data.createdAt && data.createdAt.toDate
                ? data.createdAt.toDate().toLocaleDateString()
                : data.createdAt || data.orderDate || new Date().toLocaleDateString(),
            status: data.status || "Pending",
            imageSrc: data.imageUrl || data.productImage || null,
            farmerName: data.farmerName || data.sellerName || "Unknown Farmer",
            farmerLocation: data.farmerLocation || "",
            rating: data.rating || null,
            traceId: data.traceId || null,
          };
        });

        setRecentOrders(orders.slice(0, 10)); // show latest 10 orders in "Recent Orders"

        // compute dashboard stats
        const totalOrders = orders.length;
        const activeOrders = orders.filter((o) => o.status && o.status !== "Delivered" && o.status !== "Completed").length;
        const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const ratings = orders.map((o) => Number(o.rating || 0)).filter((r) => r > 0);
        const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;

        setDashboardStats({
          activeOrders,
          totalOrders,
          totalSpent,
          avgRating,
        });

        // compute favorite farmers by counting orders per farmerName
        const farmerCounts = {};
        orders.forEach((o) => {
          const f = o.farmerName || "Unknown Farmer";
          if (!farmerCounts[f]) farmerCounts[f] = { count: 0, location: o.farmerLocation || "" , ratingAcc: 0, ratingCnt: 0};
          farmerCounts[f].count += 1;
          if (o.rating) { farmerCounts[f].ratingAcc += Number(o.rating); farmerCounts[f].ratingCnt += 1; }
        });

        const favoriteList = Object.keys(farmerCounts)
          .map((fname) => ({
            name: fname,
            orders: farmerCounts[fname].count,
            rating:
              farmerCounts[fname].ratingCnt > 0
                ? (farmerCounts[fname].ratingAcc / farmerCounts[fname].ratingCnt).toFixed(1)
                : 4.5,
            location: farmerCounts[fname].location || "Unknown",
          }))
          .sort((a, b) => b.orders - a.orders)
          .slice(0, 6);

        setFavoriteFarmers(favoriteList);
        setLoading(false);
      },
      (err) => {
        console.error("Error subscribing to orders:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const renderTabContent = () => {
    if (loading) return <div className="p-6 text-center text-gray-500">Loading orders...</div>;

    switch (activeTab) {
      case "Orders":
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-12">You have no orders yet.</div>
            ) : (
              recentOrders.map((order, index) => (
                <RecentOrderItem 
                  key={order.id || index} 
                  {...order} 
                  onViewQR={handleViewQR}
                />
              ))
            )}
          </div>
        );
      case "Farmers":
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Favorite Farmers</h3>
            {favoriteFarmers.length === 0 ? (
              <div className="text-center text-gray-500 py-12">No favorite farmers yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteFarmers.map((farmer, i) => (
                  <FarmerCard key={i} {...farmer} />
                ))}
              </div>
            )}
          </div>
        );
      case "Insights":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Nutrition Insights</h3>
              {/* Minimal inference from actual orders is possible, but keep basic placeholders */}
              <p className="text-sm text-gray-500 dark:text-gray-400">Personalized insights coming soon based on your purchases.</p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-600 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Monthly Summary</h3>
              <div className="text-5xl font-extrabold text-green-600 mb-2">₹{dashboardStats.totalSpent}</div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">Total Spent</p>

              <div className="flex justify-between w-full max-w-xs text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardStats.totalOrders}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Items Purchased</p>
                </div>
                <div className="border-l border-gray-200 dark:border-gray-600 mx-4"></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{dashboardStats.avgRating}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Rating Given</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "History":
      default:
        return <div className="p-4 text-gray-500 dark:text-gray-400">Order History coming soon...</div>;
    }
  };

  const tabClasses = (tab) =>
    `px-6 py-3 font-semibold transition duration-200 cursor-pointer text-sm ${
      activeTab === tab
        ? "bg-white dark:bg-gray-800 text-green-600 border-b-2 border-green-600 shadow-t dark:shadow-none"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  // consumerName displayed in header
  const consumerName = consumer?.fullName || consumer?.email || consumer?.phoneNumber || "User";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <header className="bg-green-600 dark:bg-green-700 text-white shadow-md">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="text-white hover:text-green-200 transition flex items-center">
              <ArrowLeft className="w-5 h-5 mr-2" /> <span className="text-sm">Back</span>
            </button>
            <h1 className="text-xl font-bold">My Dashboard</h1>
            <div className="w-12"></div>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-200 mb-3 flex items-center justify-center text-3xl text-green-800">🧑</div>
            <h2 className="text-2xl font-semibold mb-6">Welcome back, {consumerName}!</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <StatBlock title="Active Orders" value={dashboardStats.activeOrders} />
            <StatBlock title="Total Orders" value={dashboardStats.totalOrders} />
            <StatBlock title="Total Spent" value={`₹${dashboardStats.totalSpent}`} />
            <StatBlock title="Avg Rating Given" value={dashboardStats.avgRating} />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 pt-8 pb-20">
        <form className="relative mb-6">
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, farmers, or products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </form>

        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden">
          {["Orders", "History", "Farmers", "Insights"].map((tab) => (
            <div key={tab} className={tabClasses(tab)} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">{renderTabContent()}</div>
      </main>

      {/* QR Code Modal */}
      {qrModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Blockchain QR Code
              </h3>
              <div className="mb-4">
                <img 
                  src={qrModal.qrCode} 
                  alt="Blockchain QR Code" 
                  className="mx-auto border rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Scan to verify on blockchain
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mb-4">
                {qrModal.traceId}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleVerifyOnline}
                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Verify Online
                </button>
                <button 
                  onClick={() => setQrModal({ show: false, qrCode: null, orderId: null })}
                  className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerDashboard;
