// src/pages/QRVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, Shield, Package, Calendar, User, Hash, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const QRVerificationPage = () => {
  const { traceId } = useParams();
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (traceId) {
      verifyTrace(traceId);
    }
  }, [traceId]);

  const verifyTrace = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/trace/${id}`);
      const result = await response.json();
      
      if (response.ok) {
        setVerificationData(result);
        setError(null);
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify blockchain trace');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying on blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">!</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button 
              onClick={handleBack}
              className="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <header className="bg-white dark:bg-gray-700 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition duration-150 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Blockchain Verification</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 pt-8 pb-20">
        {/* Verification Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            ✅ Verified on Blockchain
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This product has been successfully verified on the blockchain
          </p>
        </div>

        {/* Blockchain Hash Display */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Blockchain Hash
          </h2>
          <div className="bg-gray-50 dark:bg-gray-600 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Transaction Hash:
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-mono text-sm break-all">
              {verificationData?.traceId}
            </p>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Product Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Product Name:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {verificationData?.productName || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {verificationData?.quantity || 'N/A'} kg
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Farmer:</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {verificationData?.farmer || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                verificationData?.status === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
              }`}>
                {verificationData?.status || 'Unknown'}
              </span>
            </div>
            
            {verificationData?.timestamp && (
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400">Registered:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {new Date(parseInt(verificationData.timestamp) * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Badge */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
            Blockchain Verified
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            This product's authenticity and origin have been verified on the blockchain. 
            The information displayed above is immutable and cannot be tampered with.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button 
            onClick={() => window.location.hash = '#/buyproduce'}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            <Package className="w-5 h-5 mr-2" />
            Shop More Products
          </button>
          <button 
            onClick={handleBack}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default QRVerificationPage;