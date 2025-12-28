import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import Batches from "./pages/Batches";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";

/**
 * Main App Component
 * Provides routing and layout structure for the admin dashboard
 * Layout consists of fixed sidebar and main content area with navbar
 */
function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Fixed Sidebar - Dark theme navigation */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <Navbar />
          
          {/* Page Content - Scrollable area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="batches" element={<Batches />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="performance" element={<Performance />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
