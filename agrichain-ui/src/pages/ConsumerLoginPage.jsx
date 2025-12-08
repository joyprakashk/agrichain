// 🌾 ConsumerLoginPage.jsx — Enforced Login on Every Visit
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Smartphone,
  ArrowRight,
  Lock,
  ArrowLeft,
} from "lucide-react";

// -----------------------------------------------
// Reusable UI Components (No UI changes made here)
// -----------------------------------------------

const LoginMethodButton = ({ method, icon: Icon, currentMethod, setMethod }) => (
  <button
    onClick={() => setMethod(method)}
    className={`flex flex-col items-center p-3 rounded-lg w-1/2 transition-colors duration-200 border-2 ${
      currentMethod === method
        ? "bg-black dark:bg-gray-900 border-black dark:border-white text-white shadow-lg"
        : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
    }`}
  >
    <Icon className="w-5 h-5 mb-1" />
    <span className="text-xs font-semibold">{method}</span>
  </button>
);

const InputField = ({
  Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  disabled = false,
  center = false,
}) => (
  <div className="relative mb-6">
    {!center && (
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-800 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
        center
          ? "text-center text-xl font-bold tracking-widest px-4"
          : "pl-12 pr-4"
      }`}
      maxLength={center ? 6 : undefined}
    />
  </div>
);

// -----------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------

const ConsumerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Steps UI states
  const [step, setStep] = useState(1);
  const [loginMethod, setLoginMethod] = useState("Mobile OTP");
  const [isLogin, setIsLogin] = useState(true);

  // Login fields
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState("");
  const [locationText, setLocationText] = useState("");
  const [language, setLanguage] = useState("");

  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------
  // 🔐 FORCE LOGIN EVERY TIME (Do NOT remember session)
  // ----------------------------------------------------
  useEffect(() => {
    localStorage.removeItem("consumerInfo");
  }, []);

  // ----------------------------------------------------
  // STEP 1: SEND OTP
  // ----------------------------------------------------
  const handleSendOtp = () => {
    if (loginMethod === "Mobile OTP" && mobileNumber.length === 10) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      alert(`📩 Demo OTP: ${newOtp}`);
      setStep(2);
    } else if (loginMethod === "Email" && email.includes("@")) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      alert(`📩 Demo OTP sent to ${email}: ${newOtp}`);
      setStep(2);
    } else {
      alert("⚠️ Please enter a valid number or email.");
    }
  };

  // ----------------------------------------------------
  // STEP 2: VERIFY OTP
  // ----------------------------------------------------
  const handleVerifyOtp = async () => {
    if (otp !== generatedOtp) {
      alert("❌ Incorrect OTP");
      return;
    }

    try {
      setLoading(true);
      const phoneKey = "+91 " + mobileNumber;

      // Try to check if user exists in Firestore
      let userExists = false;
      let userData = null;
      
      try {
        const consumerRef = doc(db, "consumers", phoneKey);
        const snap = await getDoc(consumerRef);
        if (snap.exists()) {
          userExists = true;
          userData = snap.data();
        }
      } catch (firestoreError) {
        console.warn("Firestore query failed, continuing without:", firestoreError);
      }

      if (userExists && userData) {
        localStorage.setItem("consumerInfo", JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.fullName}!`);
        navigate("/buyproduce");
      } else if (isLogin) {
        // For login, if no user found, allow them to sign up
        toast.error("❌ No account found, please sign up first.");
        setIsLogin(false); // Switch to signup mode
      } else {
        // New account → register with backend and go to profile form
        try {
          await axios.post("http://localhost:8080/api/consumer/register", {
            phoneNumber: mobileNumber,
            email,
          });
        } catch (backendError) {
          console.warn("Backend registration failed, continuing:", backendError);
        }
        toast.success("OTP verified ✔️ Complete your profile");
        setStep(3);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      // For demo purposes, if there's any error, just proceed
      if (!isLogin) {
        toast.success("OTP verified ✔️ Complete your profile");
        setStep(3);
      } else {
        toast.error("❌ Login failed. Please try signing up instead.");
        setIsLogin(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 3: SAVE PROFILE
  // ----------------------------------------------------
  const handleCompleteProfile = async (e) => {
    e.preventDefault();

    if (!fullName || !userType || !locationText || !language) {
      alert("⚠️ Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const phoneKey = "+91 " + mobileNumber;
      const consumerData = {
        fullName,
        userType,
        location: locationText,
        language,
        email,
        phoneNumber: phoneKey,
        registeredAt: new Date().toISOString(),
      };

      // Try to save to Firestore, but continue even if it fails
      try {
        await setDoc(doc(db, "consumers", phoneKey), consumerData);
      } catch (firestoreError) {
        console.warn("Firestore save failed, continuing:", firestoreError);
      }

      // Always save to localStorage for the session
      localStorage.setItem("consumerInfo", JSON.stringify(consumerData));

      toast.success("🎉 Profile Created!");
      navigate("/buyproduce");
    } catch (err) {
      console.error("Profile creation error:", err);
      // Even if there's an error, create a basic profile for the session
      const basicConsumerData = {
        fullName,
        userType,
        location: locationText,
        language,
        email,
        phoneNumber: "+91 " + mobileNumber,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem("consumerInfo", JSON.stringify(basicConsumerData));
      toast.success("🎉 Profile Created (Demo Mode)!");
      navigate("/buyproduce");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 1 UI
  // ----------------------------------------------------
  if (step === 1)
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 pb-16">
          <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <User className="w-12 h-12 mx-auto mb-3 text-green-600 bg-green-100 dark:bg-green-800 rounded-full p-2" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Welcome to FarmTrace
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Login to buy fresh produce directly from farmers
              </p>
            </div>

            {/* Login Methods */}
            <div className="flex justify-between space-x-3 mb-6">
              <LoginMethodButton
                method="Mobile OTP"
                icon={Smartphone}
                currentMethod={loginMethod}
                setMethod={setLoginMethod}
              />
              <LoginMethodButton
                method="Email"
                icon={Mail}
                currentMethod={loginMethod}
                setMethod={setLoginMethod}
              />
            </div>

            {loginMethod === "Mobile OTP" ? (
              <InputField
                Icon={Smartphone}
                placeholder="Enter mobile number"
                type="tel"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(
                    e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                  )
                }
              />
            ) : (
              <InputField
                Icon={Mail}
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            {/* Login / Signup toggle */}
            <div className="flex justify-start space-x-2 text-sm font-semibold mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`px-6 py-2 rounded-lg ${
                  isLogin
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`px-6 py-2 rounded-lg ${
                  !isLogin
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Sign Up
              </button>
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full flex items-center justify-center py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition"
            >
              Send OTP <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </>
    );

  // ----------------------------------------------------
  // STEP 2 UI — OTP VERIFICATION
  // ----------------------------------------------------
  if (step === 2)
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              OTP sent to{" "}
              {loginMethod === "Mobile OTP" ? mobileNumber : email}
            </p>

            <InputField
              Icon={Lock}
              placeholder="Enter OTP"
              type="tel"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              center={true}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
              Demo OTP: {generatedOtp}
            </p>
          </div>
        </div>
      </>
    );

  // ----------------------------------------------------
  // STEP 3 UI — COMPLETE PROFILE
  // ----------------------------------------------------
  if (step === 3)
    return (
      <>
        <Toaster position="top-center" />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tell us more about yourself to get started
              </p>
            </div>

            <form onSubmit={handleCompleteProfile}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-800 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />

              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                I am a
              </label>
              <div className="mb-4">
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <input
                    type="radio"
                    value="Retailer"
                    checked={userType === "Retailer"}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-3 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-800 dark:text-white font-medium">Retailer</span>
                </label>
              </div>

              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Bengaluru, Karnataka"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-800 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />

              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-3 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-800 dark:bg-gray-700 dark:text-white"
              >
                <option value="" className="text-gray-500">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">हिन्दी</option>
                <option value="Kannada">ಕನ್ನಡ</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow-lg disabled:opacity-50"
              >
                {loading ? "Saving..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </div>
      </>
    );

  return null;
};

export default ConsumerLoginPage;
