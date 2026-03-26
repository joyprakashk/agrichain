// src/App.jsx
import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Components / Pages
import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import Stats from "./sections/Stats";
import Features from "./sections/Features";
import CTA from "./sections/CTA";

// Farmer Pages
import FarmerPortalPage from "./pages/FarmerPortalPage";
import FarmerDashboardPage from "./pages/FarmerDashboardPage";
import RegisterProducePage from "./pages/RegisterProducePage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";

// Consumer Pages
import ConsumerLoginPage from "./pages/ConsumerLoginPage";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import BuyProducePage from "./pages/BuyProducePage";
import ProduceDetailsPage from "./pages/ProduceDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderProcessingPage from "./pages/OrderProcessingPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProductSuccessPage from "./pages/ProductSuccessPage";

// QR & Verification Pages
import QrScannerPage from "./pages/QrScannerPage";
import QRScanner from "./components/QRScanner";
import QRCodesPage from "./pages/QRCodesPage";
import QRVerificationPage from "./pages/QRVerificationPage";

// Retailer Pages
import RetailerLoginPage from "./pages/RetailerLoginPage";
import RetailerRegistrationPage from "./pages/RetailerRegistrationPage";
import RetailerDashboardPage from "./pages/RetailerDashboardPage";
import RetailerReceiveProductPage from "./pages/RetailerReceiveProductPage";
import RetailerStoreProductPage from "./pages/RetailerStoreProductPage";
import RetailerListProductPage from "./pages/RetailerListProductPage";

// Other Pages
import AdminDashboard from "./pages/AdminDashboard";
import TrackingPage from "./pages/TrackingPage";
import RetailerMarketplacePage from "./pages/RetailerMarketplacePage";
import RetailerPurchasePage from "./pages/RetailerPurchasePage";

// Add these routes


const App = () => {
  const location = typeof window !== "undefined" ? window.location : null;
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to "light"
    return localStorage.getItem("theme") || "light";
  });

  // theme sync - update both DOM and localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Checkout flow state
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderTotal, setOrderTotal] = useState(null);

  const handleBuyNow = (orderData) => {
    setCurrentOrder(orderData);
    window.location.hash = "#/checkout";
  };

  const handleOrderSuccess = (totalAmount) => {
    setOrderTotal(totalAmount);
    setCurrentOrder(null);
    window.location.hash = "#/order-success";
  };

  const handleBack = () => {
    setCurrentOrder(null);
    setOrderTotal(null);
    window.location.hash = "#/buyproduce";
  };

  // Check if current path is admin or retailer to hide navbar
  const shouldHideNavbar = () => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      return hash.includes("#/admin") || 
             hash.includes("#/retailer/dashboard") ||
             hash.includes("#/retailer/login") ||
             hash.includes("#/retailer/register") ||
             hash.includes("#/retailer/receive") ||
             hash.includes("#/retailer/store") ||
             hash.includes("#/retailer/list");
    }
    return false;
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all">
        {/* Hide main site navbar on admin, retailer, and checkout pages */}
        {!shouldHideNavbar() && !window.location.hash.includes("#/checkout") && (
          <Navbar theme={theme} setTheme={setTheme} />
        )}

        <div className="flex-grow">
          <Routes>
            {/* Home Page */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Stats />
                  <Features />
                  <CTA />
                </>
              }
            />

            {/* Farmer Routes */}
            <Route path="/farmer" element={<FarmerPortalPage />} />
            <Route path="/farmerdashboard" element={<FarmerDashboardPage />} />
            <Route path="/register-produce" element={<RegisterProducePage />} />
            <Route path="/register-success" element={<RegistrationSuccessPage />} />

            {/* Consumer Routes */}
            <Route path="/consumerloginpage" element={<ConsumerLoginPage />} />
            <Route path="/consumer-dashboard" element={<ConsumerDashboard />} />
            <Route path="/buyproduce" element={<BuyProducePage />} />
            <Route path="/buy-produce" element={<Navigate to="/buyproduce" replace />} />
            <Route
              path="/details/*"
              element={<ProduceDetailsPage onBuyNow={handleBuyNow} onBack={handleBack} />}
            />
            <Route
              path="/checkout"
              element={<CheckoutPage onBack={handleBack} onSuccess={handleOrderSuccess} />}
            />
            <Route path="/order-processing" element={<OrderProcessingPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/product-success" element={<ProductSuccessPage />} />

            {/* QR & Verification Routes */}
            <Route path="/qrscanner" element={<QrScannerPage />} />
            <Route path="/qr-codes" element={<QRCodesPage />} />
            <Route path="/verify" element={<QRScanner />} />
            <Route path="/verify/:traceId" element={<QRVerificationPage />} />

            {/* Retailer Routes */}
            <Route path="/retailer/login" element={<RetailerLoginPage />} />
            <Route path="/retailer/register" element={<RetailerRegistrationPage />} />
            <Route path="/retailer/dashboard" element={<RetailerDashboardPage />} />
            <Route path="/retailer/receive/:productId" element={<RetailerReceiveProductPage />} />
            <Route path="/retailer/store/:productId" element={<RetailerStoreProductPage />} />
            <Route path="/retailer/list/:productId" element={<RetailerListProductPage />} />

            {/* Tracking Route */}
            <Route path="/tracking/:orderId" element={<TrackingPage />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/buyproduce" replace />} />
            <Route path="/retailer/marketplace" element={<RetailerMarketplacePage />} />
<Route path="/retailer/purchase/:produceId" element={<RetailerPurchasePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;