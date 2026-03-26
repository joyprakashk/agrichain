// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Store, User, LogOut, ChevronDown } from "lucide-react";

const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const [isRetailerMenuOpen, setIsRetailerMenuOpen] = useState(false);
  
  // Check if user is logged in as retailer
  const isRetailerLoggedIn = localStorage.getItem('retailerEmail') !== null;
  const retailerName = localStorage.getItem('retailerName');

  const handleRetailerLogout = () => {
    localStorage.removeItem('retailerEmail');
    localStorage.removeItem('retailerName');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 shadow-sm transition-colors duration-500">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-green-600 p-2 rounded-xl group-hover:bg-green-700 transition-colors">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AgriChain</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Farm to Fork</p>
          </div>
        </Link>

        {/* Center Navigation Links - Evenly Spaced */}
        <ul className="flex items-center gap-8">
          <li>
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-0.5 after:bg-green-600 hover:after:w-full after:transition-all"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/farmer" 
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-0.5 after:bg-green-600 hover:after:w-full after:transition-all"
            >
              Farmer Portal
            </Link>
          </li>
          
          {/* Retailer Portal with Dropdown */}
          <li className="relative">
            <button
              onClick={() => setIsRetailerMenuOpen(!isRetailerMenuOpen)}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Retailer Portal</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isRetailerMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isRetailerMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {isRetailerLoggedIn ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{retailerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Retailer</p>
                    </div>
                    <Link
                      to="/retailer/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setIsRetailerMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Dashboard
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setIsRetailerMenuOpen(false);
                        handleRetailerLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/retailer/login"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setIsRetailerMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Login
                      </div>
                    </Link>
                    <Link
                      to="/retailer/register"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setIsRetailerMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Register
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </li>
          
          <li>
            <Link 
              to="/qrscanner" 
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-0.5 after:bg-green-600 hover:after:w-full after:transition-all"
            >
              QR Scanner
            </Link>
          </li>
          <li>
            <Link 
              to="/buy-produce" 
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors relative after:absolute after:bottom-[-8px] after:left-0 after:w-0 after:h-0.5 after:bg-green-600 hover:after:w-full after:transition-all"
            >
              Buy Produce
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;