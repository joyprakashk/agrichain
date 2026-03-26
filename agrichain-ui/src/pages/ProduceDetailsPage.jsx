import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ArrowLeft, Heart, Share2, Star, MapPin, Calendar, Package, Plus, Minus, CheckCircle, Store } from "lucide-react";
import FarmerInfo from "../components/FarmerInfo";
import SupplyChainJourney from "../components/SupplyChainJourney";
import toast from "react-hot-toast";

/**
 * Helper: read encoded Firestore path from hash
 */
const readEncodedPathFromHash = () => {
  const hash = window.location.hash || "";
  const prefix = "#/details/";
  if (!hash.startsWith(prefix)) return null;
  const encoded = hash.substring(prefix.length);
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
};

// Apply placeholders for missing data
const applyPlaceholders = (rawDoc) => {
  return {
    id: rawDoc.id,
    produceName: rawDoc.produceName || rawDoc.name || "Organic Tomatoes",
    price: rawDoc.price || 48,
    imageUrl: rawDoc.imageUrl || rawDoc.image || "/src/assets/tomato.png",
    quantity: rawDoc.quantity || "100 kg",
    harvestDate: rawDoc.harvestDate || rawDoc.createdAt || "January 15, 2024",
    category: rawDoc.category || "Organic",
    status: rawDoc.status || "available",
    farmerName: rawDoc.farmerName || rawDoc.fullName || "Ramesh Kumar",
    farmLocation: rawDoc.farmLocation || rawDoc.location || "Bangalore Rural, Karnataka",
    batchId: rawDoc.batchId || rawDoc.id || "BATCH001",
    rating: rawDoc.rating || 4.8,
    reviews: rawDoc.reviews || 156,
    farmerEmail: rawDoc.farmerEmail || rawDoc.email || "ramesh@example.com",
    farmerId: rawDoc.farmerId || rawDoc.farmerEmail,
    retailerId: rawDoc.retailerId || null,
    retailerDetails: rawDoc.retailerDetails || null,
    availableForPurchase: rawDoc.availableForPurchase || false,
    currentStage: rawDoc.currentStage || "harvested",
    traceId: rawDoc.traceId || null,
    supplyChain: rawDoc.supplyChain || {},
    nutrition: rawDoc.nutrition || {
      calories: 18,
      protein: "0.9",
      carbs: "3.9",
      fiber: "1.2",
      richIn: ["Vitamin C", "Vitamin K", "Folate"]
    },
    storage: rawDoc.storage || {
      temperature: "12-15°C",
      humidity: "85-90% humidity"
    }
  };
};

const ProduceDetailsPage = () => {
  const navigate = useNavigate();
  const [produce, setProduce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [showPurchaseSection, setShowPurchaseSection] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const encodedPath = readEncodedPathFromHash();

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        if (!encodedPath) {
          setProduce(null);
          setLoading(false);
          return;
        }

        const rawPath = encodedPath;
        const parts = rawPath.split("/").filter(Boolean);
        const produceId = parts[parts.length - 1];

        // Try backend API first
        try {
          const response = await fetch('http://localhost:8080/api/market/all-produce');
          if (response.ok) {
            const result = await response.json();
            const foundProduce = result.allProduce.find(p => p.id === produceId);

            if (foundProduce) {
              const final = applyPlaceholders(foundProduce);
              setProduce(final);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, trying Firebase:', apiError);
        }

        // Fallback to Firebase
        const docRef = doc(db, ...parts);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          const placeholders = applyPlaceholders({ id: parts[parts.length - 1] });
          setProduce(placeholders);
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() };

        let farmerName = "Ramesh Kumar";
        let farmLocation = data.farmLocation || "Bangalore Rural, Karnataka";
        const farmerIndex = parts.indexOf("farmers");
        if (farmerIndex !== -1 && parts.length > farmerIndex + 1) {
          const farmerId = parts[farmerIndex + 1];
          farmerName = data.fullName || farmerId || "Ramesh Kumar";
        }

        const final = applyPlaceholders({
          ...data,
          farmerName,
          farmLocation,
          id: snap.id,
          farmerEmail: parts[farmerIndex + 1] || data.email,
          farmerId: parts[farmerIndex + 1] || data.email
        });

        setProduce(final);
      } catch (err) {
        console.error("Error loading product details:", err);
        setProduce(applyPlaceholders({}));
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [encodedPath]);

  const handlePurchase = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms');
      return;
    }

    setProcessing(true);
    try {
      const consumerInfo = JSON.parse(localStorage.getItem('consumerInfo') || '{}');
      const consumerEmail = consumerInfo.email || consumerInfo.phoneNumber;
      
      if (!consumerEmail) {
        toast.error('Please login to continue');
        navigate('/consumerloginpage');
        return;
      }

      // Check if this product is from a retailer (has retailerId and is available for purchase)
      const isFromRetailer = produce.retailerId && produce.availableForPurchase;
      
      let endpoint;
      let requestBody;
      
      if (isFromRetailer) {
        // Purchase from retailer
        endpoint = 'http://localhost:8080/api/consumer/purchase-from-retailer';
        const pricePerUnit = parseFloat(produce.retailerDetails?.priceAtRetail?.replace('₹', '').split('/')[0]) || produce.price;
        
        requestBody = {
          consumerEmail: consumerEmail,
          produceId: produce.id,
          farmerEmail: produce.farmerId || produce.farmerEmail,
          retailerEmail: produce.retailerId,
          quantity: quantity,
          totalAmount: pricePerUnit * quantity
        };
        
        console.log("🛒 Purchasing from retailer:", requestBody);
      } else {
        // Purchase directly from farmer
        endpoint = 'http://localhost:8080/api/orders/place';
        requestBody = {
          consumerEmail: consumerEmail,
          productName: produce.produceName,
          quantity: quantity,
          totalAmount: quantity * produce.price,
          farmerEmail: produce.farmerEmail,
          orderData: {
            produceId: produce.id,
            harvestDate: produce.harvestDate,
            sourceLocation: produce.farmLocation
          }
        };
        
        console.log("🛒 Purchasing from farmer:", requestBody);
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log("📨 Purchase response:", data);
      
      if (response.ok) {
        toast.success('Purchase successful!');
        
        // Store order details for success page
        localStorage.setItem('lastOrderDetails', JSON.stringify({
          orderId: data.orderId,
          productName: produce.produceName,
          quantity: quantity,
          unit: 'kg',
          totalAmount: isFromRetailer ? requestBody.totalAmount : quantity * produce.price,
          farmerName: produce.farmerName,
          retailerName: produce.retailerDetails?.name,
          traceId: produce.traceId
        }));
        
        navigate('/order-success');
      } else {
        toast.error(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to complete purchase');
    } finally {
      setProcessing(false);
      setShowPurchaseSection(false);
      setAgreed(false);
    }
  };

  const handleBuyNow = () => {
    // Check if consumer is logged in
    const consumer = JSON.parse(localStorage.getItem('consumerInfo') || '{}');
    if (!consumer.email && !consumer.phoneNumber) {
      toast.error('Please login to place order');
      navigate('/consumerloginpage');
      return;
    }

    // Show purchase confirmation section
    setShowPurchaseSection(true);
  };

  const handleAddToCart = () => {
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">Loading product details...</div>
      </div>
    );
  }

  if (!produce) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Product not found</h1>
          <p className="text-gray-700 mb-6">Could not load the selected produce.</p>
          <button onClick={() => navigate('/buyproduce')} className="px-4 py-2 bg-green-600 text-white rounded-lg">Back to Catalog</button>
        </div>
      </div>
    );
  }

  const pricePerUnit = produce.retailerDetails?.priceAtRetail 
    ? parseFloat(produce.retailerDetails.priceAtRetail.replace('₹', '').split('/')[0]) 
    : produce.price;
  const totalPrice = quantity * pricePerUnit;
  const isSoldByRetailer = produce.retailerId && produce.availableForPurchase;
  const sellerName = isSoldByRetailer ? produce.retailerDetails?.name : produce.farmerName;
  const sellerType = isSoldByRetailer ? 'Retailer' : 'Farmer';
  const displayPrice = isSoldByRetailer ? produce.retailerDetails?.priceAtRetail : `₹${produce.price}/kg`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/buyproduce')}
            className="flex items-center text-gray-600 hover:text-green-600 transition duration-150 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <Heart className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition">
              <Share2 className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        {/* Product Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Image */}
            <div className="lg:w-1/2">
              <img
                src={produce.imageUrl}
                alt={produce.produceName}
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center text-green-700 font-semibold mb-2">
                  <Package className="w-4 h-4 mr-2" /> Blockchain Verified Produce
                </div>
                <p className="text-sm text-gray-600">
                  Complete blockchain traceability from farm to your table
                </p>
                {produce.traceId && (
                  <p className="text-xs text-gray-500 font-mono mt-2 break-all">
                    Trace ID: {produce.traceId.slice(0, 20)}...
                  </p>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-black text-white text-xs px-2 py-1 rounded">Organic</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">A+</span>
                {isSoldByRetailer && (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    Sold by Retailer
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-2">{produce.produceName}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{produce.rating}</span>
                  <span className="ml-1 text-gray-500">({produce.reviews} reviews)</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Store className="w-4 h-4 mr-1" />
                  <span>Sold by: {sellerName}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>From {produce.farmLocation}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Harvested on {produce.harvestDate}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span>{produce.quantity} available</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {displayPrice}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-semibold px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-lg font-semibold text-gray-800 mb-4">
                  Total Price: ₹{totalPrice}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-100 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Purchase Confirmation Section */}
              {showPurchaseSection && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Confirm Purchase</h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">{produce.produceName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span>{quantity} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-green-600">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Seller:</span>
                      <span>{sellerName} ({sellerType})</span>
                    </div>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-600">
                      I confirm that I have reviewed the product details and agree to purchase from the {sellerType.toLowerCase()}.
                    </span>
                  </label>
                  <button
                    onClick={handlePurchase}
                    disabled={!agreed || processing}
                    className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Confirm Purchase
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPurchaseSection(false);
                      setAgreed(false);
                    }}
                    className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Sections */}
        <div className="space-y-6">
          {/* Farmer Information & Nutrition */}
          <FarmerInfo
            farmer={{
              name: produce.farmerName,
              location: produce.farmLocation,
              verified: true
            }}
            storage={produce.storage}
            nutrition={produce.nutrition}
          />

          {/* Supply Chain Journey */}
          <SupplyChainJourney
            chain={produce.supplyChain ? Object.values(produce.supplyChain).filter(event => event !== null) : []}
            currentStage={produce.currentStage}
            farmer={{
              name: produce.farmerName,
              location: produce.farmLocation
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default ProduceDetailsPage;