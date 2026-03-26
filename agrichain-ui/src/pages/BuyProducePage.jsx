import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  QrCode,
  User,
  ArrowRight,
  LogIn,
  Store
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../config/api";

const categoryIcons = {
  All: "🌟",
  Vegetables: "🥦",
  Fruits: "🍎",
  Grains: "🌾",
  "Organic Produce": "🌱",
};

const CategoryButton = ({ name, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 w-28 h-32 transform hover:scale-105 ${
      isActive 
        ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl" 
        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-lg border border-gray-200 dark:border-gray-600"
    }`}
  >
    <div className="text-4xl mb-2">{categoryIcons[name]}</div>
    <span className="text-xs font-semibold mb-1 text-center leading-tight">{name}</span>
    <span className={`text-lg font-bold ${
      isActive ? "text-white" : "text-green-600 dark:text-green-400"
    }`}>{count !== undefined ? count : 0}</span>
  </button>
);

const BuyProducePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [produceList, setProduceList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [consumer, setConsumer] = useState(null);

  // load consumer (if any)
  useEffect(() => {
    const storedConsumer = localStorage.getItem("consumerInfo");
    if (storedConsumer) {
      const consumerData = JSON.parse(storedConsumer);
      console.log('Consumer data:', consumerData);
      setConsumer(consumerData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("consumerInfo");
    setConsumer(null);
    navigate("/consumerloginpage");
  };

  // Fetch produce that is listed for sale by retailers
  useEffect(() => {
    const fetchRetailerListedProduce = async () => {
      setLoading(true);
      try {
        console.log("📡 Fetching retailer-listed produce...");
        
        // Use the available-produce endpoint which filters products that are available for purchase
        // and have been listed by retailers
        const response = await fetch(ENDPOINTS.AVAILABLE_PRODUCE);
        
        if (response.ok) {
          const result = await response.json();
          // The available-produce endpoint returns produce that is available for purchase
          // (listed by retailers)
          const retailerProduce = result.produce || [];
          
          console.log(`✅ Found ${retailerProduce.length} products listed by retailers`);
          
          setProduceList(retailerProduce);
          setFilteredList(retailerProduce);

          // Calculate category counts
          const counts = {
            All: retailerProduce.length,
            Vegetables: retailerProduce.filter((p) => p.category === "Vegetables").length,
            Fruits: retailerProduce.filter((p) => p.category === "Fruits").length,
            Grains: retailerProduce.filter((p) => p.category === "Grains").length,
            "Organic Produce": retailerProduce.filter((p) => p.category === "Organic Produce").length,
          };
          setCategoryCounts(counts);
        } else {
          console.error("Failed to fetch retailer-listed produce");
        }
      } catch (error) {
        console.error('Error fetching produce:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetailerListedProduce();
  }, []);

  useEffect(() => {
    let filtered = produceList;
    if (activeCategory !== "All") {
      filtered = filtered.filter((item) => item.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchTerm) {
      filtered = filtered.filter((item) => item.produceName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredList(filtered);
  }, [searchTerm, activeCategory, produceList]);

  const handleSearchSubmit = (e) => e.preventDefault();

  // When user clicks a product — we pass the product data
  const handleViewDetails = (product) => {
    // For retailer-listed products, we need to pass the retailer info as well
    const productData = {
      ...product,
      sellerType: 'retailer', // Indicates this is sold by a retailer
      sellerId: product.retailerId,
      sellerName: product.retailerDetails?.name || product.farmerName,
      priceAtRetail: product.retailerDetails?.priceAtRetail || `₹${product.price}/kg`
    };
    
    // Store product data in localStorage for the details page
    localStorage.setItem('selectedProduct', JSON.stringify(productData));
    
    // Navigate to details page with product ID
    const docPath = `farmers/${product.farmerId}/produce/${product.id}`;
    const encoded = encodeURIComponent(docPath);
    window.location.hash = `#/details/${encoded}`;
  };

  const handleSignInClick = () => navigate("/consumerloginpage");

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Organic Produce"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <main className="pb-20 pt-4">
        <div className="bg-gradient-to-r from-green-600 to-green-700 py-6 shadow-lg mb-8 dark:from-green-800 dark:to-green-900 transition-colors duration-500">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-grow flex gap-3 w-full lg:w-auto">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for fresh produce..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg"
                  />
                </div>
                <button type="submit" className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl hover:bg-opacity-30 transition duration-200 shadow-lg">
                  <ArrowRight className="w-5 h-5 text-white" />
                </button>
              </form>

              {consumer ? (
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-2 bg-green-800 bg-opacity-80 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-400">
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-white">Welcome, {consumer.fullName || consumer.email || consumer.phoneNumber || "User"}</span>
                  </div>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transition duration-200">
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={handleSignInClick} className="flex items-center bg-white text-green-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition duration-200">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <a href="#/verify" className="group flex items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <QrCode className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">Verify QR</span>
                <span className="text-xs opacity-80 mt-1">Scan & Verify Products</span>
              </div>
            </a>
            <a href="#/buyproduce" className="group flex items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex flex-col items-center">
                <ShoppingCart className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">Buy Produce</span>
                <span className="text-xs opacity-80 mt-1">Fresh from Retailers</span>
              </div>
            </a>
            <a href="#/consumer-dashboard" className="group flex items-center justify-center p-6 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col items-center">
                <User className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-lg">My Orders</span>
                <span className="text-xs opacity-60 mt-1">Track & Manage</span>
              </div>
            </a>
          </div>

          {/* Retailer Info Banner */}
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Shop from Trusted Retailers
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  All products listed here are from verified retailers who source directly from farmers
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="mr-3">🏷️</span>
              Categories
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat) => (
                <CategoryButton 
                  key={cat} 
                  name={cat} 
                  count={categoryCounts[cat]} 
                  isActive={activeCategory === cat} 
                  onClick={() => setActiveCategory(cat)} 
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="mr-3">🛒</span>
                Available from Retailers
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                  {filteredList.length} items
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading fresh produce...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">😭</div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">No produce available</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Check back later for fresh produce from retailers</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredList.map((product, index) => (
                  <ProductCard
                    key={index}
                    imageSrc={product.imageUrl || "/default-produce.png"}
                    title={product.produceName}
                    location={`${product.retailerDetails?.name || product.farmerName} (Retailer)`}
                    price={product.retailerDetails?.priceAtRetail || `₹${product.price}/kg`}
                    rating={4.5}
                    reviews={`${product.quantity || "0"} kg available`}
                    onViewDetails={() => handleViewDetails(product)}
                    retailer={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyProducePage;