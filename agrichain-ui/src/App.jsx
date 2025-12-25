// src/App.jsx
import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

// Components / Pages (keep your UI as-is)
import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import Stats from "./sections/Stats";
import Features from "./sections/Features";
import CTA from "./sections/CTA";

import FarmerPortalPage from "./pages/FarmerPortalPage";
import FarmerDashboardPage from "./pages/FarmerDashboardPage";
import RegisterProducePage from "./pages/RegisterProducePage";
import RegistrationSuccessPage from "./pages/RegistrationSuccessPage";

import QrScannerPage from "./pages/QrScannerPage";
import QRScanner from "./components/QRScanner";
import QRCodesPage from "./pages/QRCodesPage";
import BuyProducePage from "./pages/BuyProducePage";

import ConsumerLoginPage from "./pages/ConsumerLoginPage";
import ConsumerDashboard from "./pages/ConsumerDashboard";

import ProduceDetailsPage from "./pages/ProduceDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderProcessingPage from "./pages/OrderProcessingPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import QRVerificationPage from "./pages/QRVerificationPage";
import ProductSuccessPage from "./pages/ProductSuccessPage"; // optional if you use a separate success page
import AdminDashboard from "./pages/AdminDashboard";

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

  // Keep consumer logged in across page reloads
  // useEffect(() => {
  //   localStorage.removeItem("consumerInfo");
  // }, []);

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

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all">
        {/* Hide main site navbar on admin pages */}
        {!(typeof window !== "undefined" && window.location.hash.includes("#/admin")) && (
          <Navbar theme={theme} setTheme={setTheme} />
        )}

        <div className="flex-grow">
          <Routes>
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

            <Route path="/farmer" element={<FarmerPortalPage />} />
            <Route path="/farmerdashboard" element={<FarmerDashboardPage />} />
            <Route path="/register-produce" element={<RegisterProducePage />} />
            <Route path="/register-success" element={<RegistrationSuccessPage />} />

            <Route path="/qrscanner" element={<QrScannerPage />} />
            <Route path="/qr-codes" element={<QRCodesPage />} />
            <Route path="/verify" element={<QRScanner />} />

            <Route path="/buyproduce" element={<BuyProducePage />} />
            <Route path="/buy-produce" element={<Navigate to="/buyproduce" replace />} />

            <Route path="/consumerloginpage" element={<ConsumerLoginPage />} />
            <Route path="/consumer-dashboard" element={<ConsumerDashboard />} />

            {/* details route expects an encoded Firestore doc path in the URL after /details/ */}
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
            <Route path="/verify/:traceId" element={<QRVerificationPage />} />

            {/* Admin Dashboard routes */}
            <Route path="/admin/*" element={<AdminDashboard />} />

            <Route path="*" element={<Navigate to="/buyproduce" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
