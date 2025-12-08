import React, { useState } from "react";
import { Leaf, Mail, Lock, User, Home, KeyRound } from "lucide-react";
import axios from "axios";

const InputField = ({ Icon, label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>
    )}
    <div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
                   focus:ring-2 focus:ring-green-500 focus:border-transparent
                   text-gray-900 placeholder-gray-400 transition duration-150"
      />
    </div>
  </div>
);

const FarmerPortalPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [aadharId, setAadharId] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const authenticateAndRedirect = (farmerData) => {
    localStorage.setItem("farmerEmail", farmerData.email);
    localStorage.setItem("farmerName", farmerData.fullName);
    window.location.hash = "#/farmerdashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:8080/api/verifyToken", {
          email,
          password,
        });

        if (res.status === 200) {
          authenticateAndRedirect(res.data.farmer || res.data.farmerData);
          setMessage("Login successful! Redirecting...");
        }
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        await axios.post("http://localhost:8080/api/farmers/register", {
          fullName,
          aadhaar: aadharId,
          email,
          password,
        });

        setMessage("Account created successfully! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      if (err.response?.status === 404) {
        setError("Farmer not found — please register first.");
      } else if (err.response?.status === 401) {
        setError("Invalid credentials — please check your password.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network Error: Backend not reachable.");
      } else {
        setError(err.response?.data?.message || err.message || "Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 pb-20">
      <main className="container flex flex-col items-center justify-start pt-20 px-6">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Leaf className="w-10 h-10 text-white" />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Farmer Portal
        </h1>
        <p className="text-gray-600 mb-12 text-center text-lg">
          Access your farm dashboard and register produce
        </p>

        {/* Login Card */}
        <div className="w-full max-w-lg p-10 bg-white rounded-3xl shadow-xl">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Welcome Back
          </h2>

          {/* Login/Sign Up Toggle */}
          <div className="flex p-1.5 bg-gray-100 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isLogin
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                !isLogin
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <InputField
                  Icon={User}
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <InputField
                  Icon={Home}
                  label="Aadhar ID"
                  placeholder="1234-5678-9012"
                  value={aadharId}
                  onChange={(e) => setAadharId(e.target.value)}
                />
              </>
            )}

            <InputField
              Icon={Mail}
              type="email"
              label="Email"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              Icon={Lock}
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {!isLogin && (
              <InputField
                Icon={KeyRound}
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-2"
            >
              {loading ? "Processing..." : isLogin ? "Login to Dashboard" : "Create Account"}
            </button>
          </form>

          {error && <p className="text-red-500 text-center mt-6 text-sm">{error}</p>}
          {message && (
            <p className="text-green-600 text-center mt-6 text-sm">{message}</p>
          )}
        </div>
        
        {/* Footer Text */}
        <p className="text-gray-500 text-center mt-8 text-sm max-w-xl">
          By signing up, you agree to our terms of service and blockchain transparency policy.
        </p>
      </main>
    </div>
  );
};

export default FarmerPortalPage;
