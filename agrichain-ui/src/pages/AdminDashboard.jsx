// src/pages/AdminDashboard.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Reuse admin-panel components without its own Router
import Sidebar from "./admin-panel/src/components/Sidebar";
import Navbar from "./admin-panel/src/components/Navbar";
import Dashboard from "./admin-panel/src/pages/Dashboard";
import Users from "./admin-panel/src/pages/Users";
import Transactions from "./admin-panel/src/pages/Transactions";
import Batches from "./admin-panel/src/pages/Batches";
import Analytics from "./admin-panel/src/pages/Analytics";
import Performance from "./admin-panel/src/pages/Performance";

// Note: Do NOT import admin-panel/src/index.css here because
// Tailwind is already configured globally in the main app.

const AdminDashboard = () => {
  return (
    <div className="flex h-[calc(100vh-0px)] bg-gray-100">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Admin Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Top Navbar */}
        <Navbar />

        {/* Nested Admin Routes under /admin/* */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="batches" element={<Batches />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="performance" element={<Performance />} />
            {/* Fallback within admin */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
