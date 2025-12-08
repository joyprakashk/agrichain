import React, { useState } from 'react';
import { QrCode, Search, CheckCircle, AlertCircle } from 'lucide-react';

const QRScanner = () => {
  const [traceId, setTraceId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check URL parameters for trace ID
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const traceParam = urlParams.get('trace');
    if (traceParam) {
      setTraceId(traceParam);
      // Auto-verify if trace ID is provided
      handleVerifyTrace({ preventDefault: () => {} }, traceParam);
    }
  }, []);

  const handleVerifyTrace = async (e, providedTraceId = null) => {
    e.preventDefault();
    const currentTraceId = providedTraceId || traceId;
    if (!currentTraceId.trim()) return;

    setLoading(true);
    try {
      // Check if it's the demo hash
      if (currentTraceId.trim() === '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef') {
        setVerificationResult({
          success: true,
          data: {
            traceId: currentTraceId.trim(),
            farmer: '0x742d35Cc6634C0532925a3b8D4C9db96590645d8',
            productName: 'Demo Organic Tomatoes',
            quantity: '5',
            timestamp: Date.now().toString(),
            status: 'delivered',
            verified: true
          }
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:8080/api/trace/${currentTraceId.trim()}`);
      const result = await response.json();
      
      if (response.ok) {
        setVerificationResult({
          success: true,
          data: result
        });
      } else {
        setVerificationResult({
          success: false,
          message: result.message || 'Verification failed'
        });
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Network error - please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <QrCode className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Verify Blockchain Trace
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the blockchain hash from QR code to verify produce authenticity
        </p>
      </div>

      <form onSubmit={handleVerifyTrace} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter blockchain hash (0x...)"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !traceId.trim()}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
          >
            <Search className="w-5 h-5 mr-2" />
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Sample Test Hash:</h4>
          <button 
            onClick={() => setTraceId('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer"
          >
            0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
          </button>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Click to test verification (will show demo data for testing)</p>
        </div>
        
        <div className="text-center mt-6">
          <a 
            href="#/qr-codes" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <QrCode className="w-4 h-4 mr-2" />
            View All QR Codes
          </a>
        </div>
      </form>

      {verificationResult && (
        <div className={`p-6 rounded-xl border ${
          verificationResult.success 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-center mb-4">
            {verificationResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <h3 className={`text-lg font-semibold ${
              verificationResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            }`}>
              {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
            </h3>
          </div>

          {verificationResult.success ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Product:</span>
                  <p className="text-gray-900 dark:text-white">{verificationResult.data.productName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <p className="text-gray-900 dark:text-white">{verificationResult.data.quantity} kg</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <p className="text-gray-900 dark:text-white capitalize">{verificationResult.data.status}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Farmer:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-xs">{verificationResult.data.farmer}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Blockchain Hash:</span>
                <p className="text-gray-900 dark:text-white font-mono text-xs break-all">{verificationResult.data.traceId}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-700 dark:text-red-300">{verificationResult.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;