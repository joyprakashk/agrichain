// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

const Navbar = ({ theme, setTheme }) => {
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
